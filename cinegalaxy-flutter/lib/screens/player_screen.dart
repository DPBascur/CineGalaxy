import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../config.dart';
import '../models/movie.dart';
import '../services/tmdb_service.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/star_rating.dart';
import '../widgets/common.dart';

class PlayerScreen extends StatefulWidget {
  final Movie movie;
  final VoidCallback onClose;

  const PlayerScreen({super.key, required this.movie, required this.onClose});

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  late final WebViewController _webViewController;
  bool _webLoading = true;

  List<SeasonInfo> _seasons = [];
  List<EpisodeInfo> _episodes = [];
  int _selectedSeason = 1;
  int _selectedEpisode = 1;
  List<CastMember> _cast = [];

  List<Review> _reviews = [];
  final _reviewCtrl = TextEditingController();
  int _newRating = 5;
  bool _isSpoiler = false;
  final Set<int> _revealedSpoilers = {};

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    _initWebView();
    _fetchData();
  }

  String get _playerUrl {
    if (widget.movie.mediaType == 'tv') {
      return '${AppConfig.playerBaseUrl}/tv/${widget.movie.id}/$_selectedSeason/$_selectedEpisode?color=${AppConfig.accentColor}';
    }
    return '${AppConfig.playerBaseUrl}/movie/${widget.movie.id}?color=${AppConfig.accentColor}';
  }

  void _initWebView() {
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.black)
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (_) => setState(() => _webLoading = true),
        onPageFinished: (_) {
          setState(() => _webLoading = false);
          _webViewController.runJavaScript(_adBlockScript);
        },
        onNavigationRequest: (req) {
          if (!req.url.contains('videasy.net')) return NavigationDecision.prevent;
          return NavigationDecision.navigate;
        },
      ))
      ..loadRequest(Uri.parse(_playerUrl));
  }

  void _reloadPlayer() => _webViewController.loadRequest(Uri.parse(_playerUrl));

  Future<void> _fetchData() async {
    if (widget.movie.mediaType == 'tv') {
      final seasons = await TmdbService.getTVShowDetails(widget.movie.id);
      if (mounted && seasons.isNotEmpty) {
        setState(() {
          _seasons = seasons;
          _selectedSeason = seasons[0].seasonNumber;
        });
        _fetchEpisodes();
      }
    }
    final cast = await TmdbService.getMediaCredits(widget.movie.id, widget.movie.mediaType);
    if (mounted) setState(() => _cast = cast);
    _fetchReviews();
  }

  Future<void> _fetchEpisodes() async {
    final eps = await TmdbService.getTVShowEpisodes(widget.movie.id, _selectedSeason);
    if (mounted) {
      setState(() {
        _episodes = eps;
        _selectedEpisode = eps.isNotEmpty ? eps[0].episodeNumber : 1;
      });
      _reloadPlayer();
    }
  }

  Future<void> _fetchReviews() async {
    final reviews = await SupabaseService.getReviews(widget.movie.id);
    if (mounted) setState(() => _reviews = reviews);
  }

  Future<void> _submitReview() async {
    final comment = _reviewCtrl.text.trim();
    if (comment.isEmpty) return;
    final user = SupabaseService.currentUser;
    if (user == null) return;

    final review = Review(
      userId: user.id,
      email: user.email ?? '',
      username: user.userMetadata?['username'] as String? ?? (user.email ?? '').split('@')[0],
      movieId: widget.movie.id,
      rating: _newRating,
      comment: comment,
      isSpoiler: _isSpoiler,
      createdAt: DateTime.now(),
    );

    setState(() => _reviews = [review, ..._reviews]);
    _reviewCtrl.clear();
    setState(() { _newRating = 5; _isSpoiler = false; });

    await SupabaseService.insertReview({
      'user_id': review.userId,
      'email': review.email,
      'username': review.username,
      'movie_id': review.movieId,
      'rating': review.rating,
      'comment': review.comment,
      'is_spoiler': review.isSpoiler,
    });
  }

  void _nextEpisode() {
    final idx = _episodes.indexWhere((e) => e.episodeNumber == _selectedEpisode);
    if (idx >= 0 && idx < _episodes.length - 1) {
      setState(() => _selectedEpisode = _episodes[idx + 1].episodeNumber);
      _reloadPlayer();
    } else {
      final sIdx = _seasons.indexWhere((s) => s.seasonNumber == _selectedSeason);
      if (sIdx >= 0 && sIdx < _seasons.length - 1) {
        setState(() => _selectedSeason = _seasons[sIdx + 1].seasonNumber);
        _fetchEpisodes();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Has llegado al final de la serie. 🎉'), backgroundColor: AppTheme.violet));
      }
    }
  }

  static const _adBlockScript = '''
    window.open = function() { return null; };
    window.alert = function() { return true; };
    window.confirm = function() { return true; };
  ''';

  @override
  void dispose() {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
    ]);
    _reviewCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final orientation = MediaQuery.of(context).orientation;
    final isLandscape = orientation == Orientation.landscape;
    final screenH = MediaQuery.of(context).size.height;
    final bottomPad = MediaQuery.of(context).padding.bottom;

    if (isLandscape) {
      return Container(
        width: double.infinity,
        height: screenH,
        color: Colors.black,
        child: SafeArea(
          child: Stack(children: [
            WebViewWidget(
              controller: _webViewController,
              gestureRecognizers: {
                Factory<VerticalDragGestureRecognizer>(
                  () => VerticalDragGestureRecognizer(),
                ),
                Factory<HorizontalDragGestureRecognizer>(
                  () => HorizontalDragGestureRecognizer(),
                ),
                Factory<ScaleGestureRecognizer>(
                  () => ScaleGestureRecognizer(),
                ),
              },
            ),
            if (_webLoading)
              Center(child: LottieLoader(size: 100)),
          ]),
        ),
      );
    }

    return Container(
      height: screenH * 0.95,
      decoration: const BoxDecoration(
        color: AppTheme.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
      child: Column(
        children: [

          // ── PARTE FIJA: handle + título + WebView ──────────────────
          // El WebView NUNCA está dentro de un scrollable.
          // Así recibe el 100% de los gestos sin competencia.

          // Handle drag
          Center(
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 10),
              width: 44, height: 4,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Title + close
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            child: Row(children: [
              Expanded(
                child: Text(
                  widget.movie.title,
                  style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700),
                  maxLines: 1, overflow: TextOverflow.ellipsis,
                ),
              ),
              GestureDetector(
                onTap: widget.onClose,
                child: Container(
                  padding: const EdgeInsets.all(7),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.close_rounded, color: Colors.white, size: 20),
                ),
              ),
            ]),
          ),

          // WebView fijo (fuera de cualquier scroll)
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Stack(children: [
              WebViewWidget(
                controller: _webViewController,
                gestureRecognizers: {
                  Factory<VerticalDragGestureRecognizer>(
                    () => VerticalDragGestureRecognizer(),
                  ),
                  Factory<HorizontalDragGestureRecognizer>(
                    () => HorizontalDragGestureRecognizer(),
                  ),
                  Factory<ScaleGestureRecognizer>(
                    () => ScaleGestureRecognizer(),
                  ),
                },
              ),
              if (_webLoading)
                Container(
                  color: Colors.black,
                  child: Center(child: LottieLoader(size: 100)),
                ),
            ]),
          ),

          // AdBlock notice
          Container(
            color: const Color(0xFF161616),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
            child: Row(children: [
              const Icon(Icons.verified_user_outlined, color: Color(0xFFFB923C), size: 15),
              const SizedBox(width: 8),
              Text(
                'Protección activa anti pop-ups (Sandbox).',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 11),
              ),
            ]),
          ),

          // ── PARTE SCROLLABLE: info + reseñas ───────────────────────
          // Expanded acota la altura para que SingleChildScrollView funcione.
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.only(bottom: bottomPad + 24),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    // Match + year + HD
                    Row(children: [
                      Text('${widget.movie.match}% match',
                          style: const TextStyle(color: AppTheme.textGreen, fontWeight: FontWeight.w700, fontSize: 13)),
                      const SizedBox(width: 12),
                      Text('${widget.movie.year}',
                          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.white.withValues(alpha: 0.35)),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('HD', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
                      ),
                    ]),

                    // TV controls
                    if (widget.movie.mediaType == 'tv' && _seasons.isNotEmpty) ...[
                      const SizedBox(height: 14),
                      _buildDropdown(
                        _seasons.map((s) => DropdownMenuItem(value: s.seasonNumber, child: Text(s.name))).toList(),
                        _selectedSeason,
                        (v) { setState(() => _selectedSeason = v!); _fetchEpisodes(); },
                        Icons.layers_rounded,
                      ),
                      const SizedBox(height: 8),
                      _buildDropdown(
                        _episodes.map((e) => DropdownMenuItem(value: e.episodeNumber, child: Text('Ep. ${e.episodeNumber}: ${e.name}'))).toList(),
                        _selectedEpisode,
                        (v) { setState(() => _selectedEpisode = v!); _reloadPlayer(); },
                        Icons.play_circle_outline_rounded,
                      ),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: _nextEpisode,
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          decoration: BoxDecoration(
                            color: AppTheme.surface2,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.borderViolet),
                          ),
                          child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                            Text('Siguiente episodio', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                            SizedBox(width: 8),
                            Icon(Icons.skip_next_rounded, color: AppTheme.violetBright, size: 20),
                          ]),
                        ),
                      ),
                    ],

                    const SizedBox(height: 12),
                    Text(
                      widget.movie.description,
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 13, height: 1.65),
                    ),
                    const SizedBox(height: 12),
                    _MetaRow(label: 'Elenco',
                      value: _cast.isNotEmpty ? _cast.map((c) => c.name).join(', ') : 'Desconocido'),
                    const SizedBox(height: 6),
                    _MetaRow(label: 'Género', value: widget.movie.genre),
                    const SizedBox(height: 6),
                    _MetaRow(label: 'Calificación', value: '${widget.movie.rating}/10 ⭐'),
                  ]),
                ),

                const Divider(color: Color(0xFF1E1E1E), height: 28),

                // Reviews header
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 14),
                  child: Row(children: [
                    Container(width: 3, height: 18, decoration: BoxDecoration(color: AppTheme.violet, borderRadius: BorderRadius.circular(2))),
                    const SizedBox(width: 10),
                    const Text('Reseñas Galácticas',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                    const Spacer(),
                    Text('${_reviews.length}', style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                  ]),
                ),

                // Review form
                if (SupabaseService.currentUser != null)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
                    child: _buildReviewForm(),
                  ),

                // Review cards
                ..._reviews.asMap().entries.map((e) => Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                  child: _buildReviewCard(e.key, e.value),
                )),
              ]),
            ),
          ),
        ],
      ),
    );
  }


  Widget _buildDropdown<T>(
    List<DropdownMenuItem<T>> items,
    T value,
    ValueChanged<T?> onChange,
    IconData icon,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: AppTheme.surface2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(children: [
        Icon(icon, color: AppTheme.violet, size: 18),
        const SizedBox(width: 8),
        Expanded(
          child: DropdownButton<T>(
            isExpanded: true, value: value, items: items, onChanged: onChange,
            dropdownColor: const Color(0xFF1A1A2E),
            underline: const SizedBox(),
            style: const TextStyle(color: Colors.white, fontSize: 14),
            iconEnabledColor: AppTheme.violet,
          ),
        ),
      ]),
    );
  }

  Widget _buildReviewForm() {
    final user = SupabaseService.currentUser!;
    final username = user.userMetadata?['username'] as String? ?? user.email?.split('@')[0] ?? 'Tú';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.borderViolet),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          CircleAvatar(
            backgroundColor: AppTheme.violet,
            radius: 14,
            child: Text(username[0].toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12)),
          ),
          const SizedBox(width: 8),
          Text(username, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
        ]),
        const SizedBox(height: 12),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          StarRating(rating: _newRating, interactive: true, size: 28, onRatingChanged: (r) => setState(() => _newRating = r)),
          GestureDetector(
            onTap: () => setState(() => _isSpoiler = !_isSpoiler),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: _isSpoiler ? AppTheme.red.withValues(alpha: 0.15) : Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: _isSpoiler ? AppTheme.red.withValues(alpha: 0.4) : Colors.transparent),
              ),
              child: Row(children: [
                Icon(Icons.shield_rounded, size: 14, color: _isSpoiler ? AppTheme.red : AppTheme.textSecondary),
                const SizedBox(width: 5),
                Text('Spoiler', style: TextStyle(
                  color: _isSpoiler ? AppTheme.red : AppTheme.textSecondary,
                  fontSize: 11, fontWeight: FontWeight.w700)),
              ]),
            ),
          ),
        ]),
        const SizedBox(height: 12),
        TextField(
          controller: _reviewCtrl, maxLines: 3,
          style: const TextStyle(color: Colors.white, fontSize: 13),
          decoration: InputDecoration(
            hintText: '¿Qué te pareció este título?',
            hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.3)),
            filled: true,
            fillColor: Colors.white.withValues(alpha: 0.04),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppTheme.violet),
            ),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          height: 44,
          child: ElevatedButton.icon(
            onPressed: _submitReview,
            icon: const Icon(Icons.send_rounded, size: 16),
            label: const Text('Enviar Reseña', style: TextStyle(fontWeight: FontWeight.w700)),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.violet,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
      ]),
    );
  }

  Widget _buildReviewCard(int index, Review rev) {
    final initial = (rev.username.isNotEmpty ? rev.username[0] : rev.email.isNotEmpty ? rev.email[0] : 'U').toUpperCase();
    final isSpoilerHidden = rev.isSpoiler && !_revealedSpoilers.contains(index);
    final name = rev.username.isNotEmpty ? rev.username : rev.email.split('@')[0];

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF252525)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          CircleAvatar(
            backgroundColor: AppTheme.violet.withValues(alpha: 0.3),
            radius: 16,
            child: Text(initial, style: const TextStyle(color: AppTheme.violetBright, fontWeight: FontWeight.w800, fontSize: 13)),
          ),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
            StarRating(rating: rev.rating, size: 13),
          ])),
          if (rev.createdAt != null)
            Text(
              '${rev.createdAt!.day}/${rev.createdAt!.month}/${rev.createdAt!.year}',
              style: TextStyle(color: Colors.white.withValues(alpha: 0.25), fontSize: 10),
            ),
        ]),
        const SizedBox(height: 10),
        if (isSpoilerHidden)
          GestureDetector(
            onTap: () => setState(() => _revealedSpoilers.add(index)),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14), width: double.infinity,
              decoration: BoxDecoration(
                color: AppTheme.red.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppTheme.red.withValues(alpha: 0.2)),
              ),
              child: const Column(children: [
                Icon(Icons.visibility_off_rounded, color: AppTheme.red, size: 20),
                SizedBox(height: 5),
                Text('CONTIENE SPOILER', style: TextStyle(color: AppTheme.red, fontWeight: FontWeight.w800, fontSize: 11, letterSpacing: 1)),
                SizedBox(height: 2),
                Text('Toca para revelar', style: TextStyle(color: Color(0x55FFFFFF), fontSize: 10)),
              ]),
            ),
          )
        else
          Text(rev.comment, style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 13, height: 1.55)),
      ]),
    );
  }
}

class _MetaRow extends StatelessWidget {
  final String label;
  final String value;
  const _MetaRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return RichText(
      text: TextSpan(
        children: [
          TextSpan(text: '$label: ', style: const TextStyle(color: Color(0xFF666666), fontSize: 13, fontWeight: FontWeight.w700)),
          TextSpan(text: value, style: const TextStyle(color: Colors.white, fontSize: 13)),
        ],
      ),
    );
  }
}
