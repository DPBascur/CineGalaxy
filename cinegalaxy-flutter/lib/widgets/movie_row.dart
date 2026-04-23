import 'package:flutter/material.dart';
import '../models/movie.dart';
import '../theme/app_theme.dart';
import 'movie_card.dart';

class MovieRow extends StatelessWidget {
  final String title;
  final List<Movie> movies;
  final ValueChanged<Movie> onMovieSelect;
  final bool isTop10;
  final ValueChanged<Movie>? onRemove;

  const MovieRow({
    super.key,
    required this.title,
    required this.movies,
    required this.onMovieSelect,
    this.isTop10 = false,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    if (movies.isEmpty) return const SizedBox.shrink();

    final displayMovies = isTop10 ? movies.take(10).toList() : movies;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 15, bottom: 10),
            child: Text(
              title,
              style: const TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 20,
                fontWeight: FontWeight.w700,
                shadows: [
                  Shadow(
                    color: Color(0x4D8B5CF6),
                    offset: Offset(0, 2),
                    blurRadius: 4,
                  ),
                ],
              ),
            ),
          ),
          SizedBox(
            height: isTop10 ? 210 : 190,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 15),
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemCount: displayMovies.length,
              itemBuilder: (context, index) {
                final movie = displayMovies[index];
                return MovieCard(
                  movie: movie,
                  onTap: () => onMovieSelect(movie),
                  showRank: isTop10,
                  rank: isTop10 ? index + 1 : null,
                  onRemove: onRemove != null ? () => onRemove!(movie) : null,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
