import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/movie.dart';
import '../services/tmdb_service.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/movie_row.dart';
import '../widgets/movie_card.dart';
import '../widgets/common.dart';
import 'player_screen.dart';

const _categories = [
  {'id': 'popular', 'name': 'Populares'},
  {'id': 'movie', 'name': 'Películas'},
  {'id': 'tv', 'name': 'Series'},
  {'id': 'anime', 'name': 'Anime'},
  {'id': '28', 'name': 'Acción', 'media': 'movie'},
  {'id': '16', 'name': 'Animación', 'media': 'movie'},
  {'id': '27', 'name': 'Terror', 'media': 'movie'},
];

class HomeScreen extends StatefulWidget {
  final VoidCallback? onSearchTap;
  const HomeScreen({super.key, this.onSearchTap});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Movie> _continueWatching = [];
  List<Movie> _trending = [];
  List<Movie> _popular = [];
  List<Movie> _series = [];
  List<Movie> _anime = [];
  final Map<String, List<Movie>> _categoryCache = {};
  List<Movie> _gridData = [];

  bool _isLoading = true;
  bool _gridLoading = false;
  String _activeCategory = 'popular';
  String _userId = 'invitado';

  // ── Hero carousel
  final PageController _heroCtrl = PageController();
  int _heroIndex = 0;
  Timer? _heroTimer;
  static const _heroCycleSec = 5;
  static const _heroCount = 5;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _heroTimer?.cancel();
    _heroCtrl.dispose();
    super.dispose();
  }

  void _startHeroTimer() {
    _heroTimer?.cancel();
    _heroTimer = Timer.periodic(const Duration(seconds: _heroCycleSec), (_) {
      if (!mounted || _trending.isEmpty) return;
      final next = (_heroIndex + 1) % _trending.take(_heroCount).length;
      _heroCtrl.animateToPage(
        next,
        duration: const Duration(milliseconds: 700),
        curve: Curves.easeInOut,
      );
    });
  }

  Future<void> _load() async {
    try {
      final session = SupabaseService.currentSession;
      if (session != null) _userId = session.user.id;

      final results = await Future.wait([
        TmdbService.getTrendingMovies(),
        TmdbService.getPopularMovies(),
        TmdbService.getPopularTV(),
        TmdbService.getAnimeShows(),
      ]);

      final prefs = await SharedPreferences.getInstance();
      final cwRaw = prefs.getString('cinegalaxy_continue_watching_$_userId');
      final cw = cwRaw != null
          ? (jsonDecode(cwRaw) as List).map((m) => Movie.fromJson(m as Map<String, dynamic>)).toList()
          : <Movie>[];

      if (mounted) {
        setState(() {
          _trending = results[0];
          _popular = results[1];
          _series = results[2];
          _anime = results[3];
          _continueWatching = cw;
          _isLoading = false;
        });
        _startHeroTimer();
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveToContinueWatching(Movie movie) async {
    final prefs = await SharedPreferences.getInstance();
    final newList = [movie, ..._continueWatching.where((m) => m.id != movie.id)].take(15).toList();
    await prefs.setString('cinegalaxy_continue_watching_$_userId',
        jsonEncode(newList.map((m) => m.toJson()).toList()));
    if (mounted) setState(() => _continueWatching = newList);
  }

  Future<void> _removeFromContinueWatching(Movie movie) async {
    final prefs = await SharedPreferences.getInstance();
    final newList = _continueWatching.where((m) => m.id != movie.id).toList();
    await prefs.setString('cinegalaxy_continue_watching_$_userId',
        jsonEncode(newList.map((m) => m.toJson()).toList()));
    if (mounted) setState(() => _continueWatching = newList);
  }

  void _openMovie(Movie movie) {
    _saveToContinueWatching(movie);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: false,
      backgroundColor: Colors.transparent,
      builder: (_) => PlayerScreen(movie: movie, onClose: () => Navigator.pop(context)),
    );
  }

  void _goToSearch() => widget.onSearchTap?.call();

  Future<void> _handleCategorySelect(Map<String, dynamic> cat) async {
    final catId = cat['id'] as String;
    setState(() => _activeCategory = catId);
    if (catId == 'popular') { setState(() => _gridData = []); return; }
    if (_categoryCache.containsKey(catId)) { setState(() => _gridData = _categoryCache[catId]!); return; }
    setState(() => _gridLoading = true);
    List<Movie> data;
    if (catId == 'movie') data = await TmdbService.getPopularMovies();
    else if (catId == 'tv') data = await TmdbService.getPopularTV();
    else if (catId == 'anime') data = await TmdbService.getAnimeShows();
    else data = await TmdbService.getMediaByGenre(int.parse(catId), isTv: cat['media'] == 'tv');
    _categoryCache[catId] = data;
    if (mounted) setState(() { _gridData = data; _gridLoading = false; });
  }

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: _isLoading
          ? Center(child: LottieLoader(size: 140, label: 'Cargando CineGalaxy...'))
          : CustomScrollView(slivers: [
              SliverToBoxAdapter(
                child: _activeCategory == 'popular' && _trending.isNotEmpty
                    ? _buildHeroCarousel(topPad)
                    : _buildMinimalHeader(topPad),
              ),
              SliverToBoxAdapter(child: _buildCategoryPills()),
              SliverToBoxAdapter(child: _buildContent()),
              const SliverToBoxAdapter(child: SizedBox(height: 30)),
            ]),
    );
  }

  Widget _buildHeroCarousel(double topPad) {
    final heroes = _trending.take(_heroCount).toList();

    return SizedBox(
      height: 490,
      child: Stack(fit: StackFit.expand, children: [
        // ── PageView de backdrops
        PageView.builder(
          controller: _heroCtrl,
          itemCount: heroes.length,
          onPageChanged: (i) => setState(() => _heroIndex = i),
          itemBuilder: (_, i) {
            final movie = heroes[i];
            return Stack(fit: StackFit.expand, children: [
              CachedNetworkImage(
                imageUrl: movie.backdropUrl,
                fit: BoxFit.cover,
                placeholder: (_, __) => Container(color: const Color(0xFF111111)),
              ),
              // Gradient overlays
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withValues(alpha: 0.15),
                      Colors.black.withValues(alpha: 0.5),
                      AppTheme.background,
                    ],
                    stops: const [0.0, 0.45, 1.0],
                  ),
                ),
              ),
            ]);
          },
        ),

        // ── Top bar (logo + search)
        Positioned(
          top: topPad + 8,
          left: 16,
          right: 16,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const CineGalaxyLogo(size: 36, fontSize: 22),
              GestureDetector(
                onTap: _goToSearch,
                child: Container(
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                  ),
                  child: const Icon(Icons.search_rounded, color: Colors.white, size: 22),
                ),
              ),
            ],
          ),
        ),

        // ── Bottom info del hero activo
        Positioned(
          bottom: 20,
          left: 16,
          right: 16,
          child: _buildHeroInfo(heroes[_heroIndex]),
        ),

        // ── Dots indicadores
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(heroes.length, (i) {
              final isActive = i == _heroIndex;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.only(right: 5, bottom: 10),
                width: isActive ? 20 : 5,
                height: 5,
                decoration: BoxDecoration(
                  color: isActive ? AppTheme.violet : Colors.white.withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(3),
                ),
              );
            }),
          ),
        ),
      ]),
    );
  }

  Widget _buildHeroInfo(Movie movie) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Genre pill
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: AppTheme.violet.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppTheme.violet.withValues(alpha: 0.45)),
          ),
          child: Text(
            movie.genre.toUpperCase(),
            style: const TextStyle(color: AppTheme.violetBright, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 2),
          ),
        ),
        const SizedBox(height: 10),
        // Title
        Text(
          movie.title,
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900,
            letterSpacing: -0.5, shadows: [Shadow(color: Colors.black87, blurRadius: 12)],
          ),
        ),
        const SizedBox(height: 6),
        // Meta row
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text('${movie.match}% match',
              style: const TextStyle(color: AppTheme.textGreen, fontSize: 12, fontWeight: FontWeight.w700)),
          const SizedBox(width: 10),
          Text('${movie.year}',
              style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 12)),
          const SizedBox(width: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
            decoration: BoxDecoration(border: Border.all(color: Colors.white.withValues(alpha: 0.4)), borderRadius: BorderRadius.circular(3)),
            child: const Text('HD', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
          ),
        ]),
        const SizedBox(height: 16),
        // Buttons
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          _HeroBtn(label: 'Reproducir', icon: Icons.play_arrow_rounded, primary: true, onTap: () => _openMovie(movie)),
          const SizedBox(width: 10),
          _HeroBtn(label: 'Más info', icon: Icons.info_outline_rounded, primary: false, onTap: () => _openMovie(movie)),
        ]),
      ],
    );
  }

  Widget _buildMinimalHeader(double topPad) {
    return Container(
      padding: EdgeInsets.only(top: topPad + 10, left: 16, right: 16, bottom: 14),
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        border: Border(bottom: BorderSide(color: AppTheme.borderViolet, width: 0.5)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const CineGalaxyLogo(size: 34, fontSize: 20),
          GestureDetector(
            onTap: _goToSearch,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
              ),
              child: const Icon(Icons.search_rounded, color: Colors.white, size: 22),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryPills() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
      child: Row(
        children: _categories.map((cat) {
          final isActive = _activeCategory == cat['id'];
          return GestureDetector(
            onTap: () => _handleCategorySelect(cat),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
              decoration: BoxDecoration(
                color: isActive ? AppTheme.violet : const Color(0xFF141414),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isActive ? AppTheme.violet : Colors.white.withValues(alpha: 0.07)),
                boxShadow: isActive
                    ? [BoxShadow(color: AppTheme.violet.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 3))]
                    : [],
              ),
              child: Text(
                cat['name'] as String,
                style: TextStyle(
                  fontSize: 13, fontWeight: FontWeight.w700,
                  color: isActive ? Colors.white : Colors.white.withValues(alpha: 0.55),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildContent() {
    if (_gridLoading) {
      return Padding(
        padding: const EdgeInsets.only(top: 60),
        child: Center(child: LottieLoader(size: 120, label: 'Cargando...')),
      );
    }
    if (_activeCategory != 'popular') {
      if (_gridData.isEmpty) {
        return Padding(
          padding: const EdgeInsets.only(top: 60),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.movie_outlined, color: Colors.white.withValues(alpha: 0.08), size: 60),
            const SizedBox(height: 12),
            const Text('No hay contenido disponible.', style: TextStyle(color: AppTheme.textMuted)),
          ]),
        );
      }
      return _buildGrid(_gridData);
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (_continueWatching.isNotEmpty)
        MovieRow(title: 'Continuar Viendo', movies: _continueWatching,
            onMovieSelect: _openMovie, onRemove: _removeFromContinueWatching),
      MovieRow(title: 'Tendencias Globales 🔥', movies: _trending, onMovieSelect: _openMovie, isTop10: true),
      MovieRow(title: 'Películas Extraordinarias', movies: _popular, onMovieSelect: _openMovie),
      MovieRow(title: 'Series Destacadas', movies: _series, onMovieSelect: _openMovie),
      MovieRow(title: 'Nuevos Episodios Anime', movies: _anime, onMovieSelect: _openMovie),
    ]);
  }

  Widget _buildGrid(List<Movie> data) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3, childAspectRatio: 2 / 3, crossAxisSpacing: 8, mainAxisSpacing: 12,
        ),
        itemCount: data.length,
        itemBuilder: (_, i) => MovieGridCard(movie: data[i], onTap: () => _openMovie(data[i])),
      ),
    );
  }
}

// ── Helper widgets ─────────────────────────────────────────────
class _HeroBtn extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool primary;
  final VoidCallback onTap;

  const _HeroBtn({required this.label, required this.icon, required this.primary, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 11),
        decoration: BoxDecoration(
          color: primary ? AppTheme.violet : Colors.white.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: primary ? AppTheme.violet : Colors.white.withValues(alpha: 0.25)),
          boxShadow: primary
              ? [BoxShadow(color: AppTheme.violet.withValues(alpha: 0.45), blurRadius: 14, offset: const Offset(0, 5))]
              : [],
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, color: Colors.white, size: 19),
          const SizedBox(width: 7),
          Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
        ]),
      ),
    );
  }
}
