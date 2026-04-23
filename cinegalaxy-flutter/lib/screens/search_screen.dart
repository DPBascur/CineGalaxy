import 'package:flutter/material.dart';
import '../models/movie.dart';
import '../services/tmdb_service.dart';
import '../theme/app_theme.dart';
import '../widgets/movie_card.dart';
import '../widgets/common.dart';
import 'player_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchCtrl = TextEditingController();
  final _focusNode = FocusNode();
  List<Movie> _results = [];
  bool _isLoading = false;
  bool _hasSearched = false;
  bool _isFocused = false;

  static const _suggestions = ['Acción', 'Terror', 'Anime', 'Comedia', 'Marvel', 'Drama', 'Sci-Fi'];

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() => setState(() => _isFocused = _focusNode.hasFocus));
  }

  Future<void> _handleSearch() async {
    final q = _searchCtrl.text.trim();
    if (q.isEmpty) return;
    _focusNode.unfocus();
    setState(() { _isLoading = true; _hasSearched = true; });
    final results = await TmdbService.searchMovies(q);
    if (mounted) setState(() { _results = results; _isLoading = false; });
  }

  void _clearSearch() {
    _searchCtrl.clear();
    setState(() { _results = []; _hasSearched = false; });
    _focusNode.requestFocus();
  }

  void _openMovie(Movie movie) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: false,
      backgroundColor: Colors.transparent,
      builder: (_) => PlayerScreen(movie: movie, onClose: () => Navigator.pop(context)),
    );
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Column(
        children: [
          // ── Header minimalista
          Container(
            padding: EdgeInsets.only(top: topPad + 18, left: 20, right: 20, bottom: 14),
            color: AppTheme.background,
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text(
                'Buscar',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.5),
              ),
              const SizedBox(height: 12),

              // ── Search bar — solo el campo, sin botón externo
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                height: 46,
                decoration: BoxDecoration(
                  color: const Color(0xFF111111),
                  borderRadius: BorderRadius.circular(13),
                  border: Border.all(
                    color: _isFocused
                        ? AppTheme.violet.withValues(alpha: 0.6)
                        : Colors.white.withValues(alpha: 0.07),
                  ),
                ),
                child: Row(children: [
                  const SizedBox(width: 13),
                  Icon(
                    Icons.search_rounded,
                    size: 19,
                    color: _isFocused
                        ? AppTheme.violet
                        : Colors.white.withValues(alpha: 0.28),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _searchCtrl,
                      focusNode: _focusNode,
                      style: const TextStyle(color: Colors.white, fontSize: 15),
                      decoration: InputDecoration(
                        hintText: 'Películas, series, anime...',
                        hintStyle: TextStyle(
                          color: Colors.white.withValues(alpha: 0.22),
                          fontSize: 14,
                        ),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 10),
                        filled: false,
                        isDense: true,
                      ),
                      onSubmitted: (_) => _handleSearch(),
                      textInputAction: TextInputAction.search,
                      onChanged: (_) => setState(() {}),
                    ),
                  ),
                  // X solo cuando hay texto
                  if (_searchCtrl.text.isNotEmpty)
                    GestureDetector(
                      onTap: _clearSearch,
                      child: Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: Icon(
                          Icons.close_rounded,
                          size: 17,
                          color: Colors.white.withValues(alpha: 0.3),
                        ),
                      ),
                    )
                  else
                    const SizedBox(width: 12),
                ]),
              ),
            ]),
          ),

          // ── Body
          Expanded(
            child: _isLoading
                ? Center(child: LottieLoader(size: 130, label: 'Buscando...'))
                : _results.isNotEmpty
                    ? _buildResults()
                    : _hasSearched
                        ? _buildEmpty()
                        : _buildPrompt(),
          ),
        ],
      ),
    );
  }

  Widget _buildResults() {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 14),
            child: Row(children: [
              Container(width: 3, height: 14, decoration: BoxDecoration(color: AppTheme.violet, borderRadius: BorderRadius.circular(2))),
              const SizedBox(width: 8),
              RichText(text: TextSpan(children: [
                TextSpan(text: '${_results.length} ', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),
                TextSpan(text: 'resultados  ', style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontSize: 13)),
                TextSpan(text: '"${_searchCtrl.text}"', style: const TextStyle(color: AppTheme.violetBright, fontWeight: FontWeight.w600, fontSize: 13)),
              ])),
            ]),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3, childAspectRatio: 2 / 3, crossAxisSpacing: 8, mainAxisSpacing: 12,
            ),
            delegate: SliverChildBuilderDelegate(
              (_, i) => MovieGridCard(movie: _results[i], onTap: () => _openMovie(_results[i])),
              childCount: _results.length,
            ),
          ),
        ),
        const SliverToBoxAdapter(child: SizedBox(height: 30)),
      ],
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.search_off_rounded, color: Colors.white.withValues(alpha: 0.1), size: 52),
          const SizedBox(height: 16),
          const Text('Sin resultados', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 18)),
          const SizedBox(height: 8),
          Text(
            'No encontramos nada para "${_searchCtrl.text}".',
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppTheme.textMuted, fontSize: 13, height: 1.5),
          ),
          const SizedBox(height: 20),
          GestureDetector(
            onTap: _clearSearch,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 9),
              decoration: BoxDecoration(
                color: AppTheme.surface2,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.borderViolet),
              ),
              child: const Text('Intentar de nuevo', style: TextStyle(color: AppTheme.violetBright, fontWeight: FontWeight.w600, fontSize: 13)),
            ),
          ),
        ]),
      ),
    );
  }

  Widget _buildPrompt() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 30),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text(
          'BÚSQUEDAS POPULARES',
          style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 2),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8, runSpacing: 8,
          children: _suggestions.map((tag) =>
            GestureDetector(
              onTap: () { _searchCtrl.text = tag; _handleSearch(); },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF111111),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.07)),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.trending_up_rounded, size: 13, color: AppTheme.violet.withValues(alpha: 0.6)),
                  const SizedBox(width: 5),
                  Text(tag, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                ]),
              ),
            ),
          ).toList(),
        ),
        const SizedBox(height: 44),
        Center(
          child: Column(children: [
            Icon(Icons.movie_filter_outlined, color: Colors.white.withValues(alpha: 0.06), size: 56),
            const SizedBox(height: 14),
            const Text('Descubre el universo', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 17)),
            const SizedBox(height: 6),
            const Text(
              'Millones de títulos esperándote.',
              style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
            ),
          ]),
        ),
      ]),
    );
  }
}
