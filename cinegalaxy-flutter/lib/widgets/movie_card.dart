import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../models/movie.dart';
import '../theme/app_theme.dart';

class MovieCard extends StatelessWidget {
  final Movie movie;
  final VoidCallback onTap;
  final VoidCallback? onRemove;
  final bool showRank;
  final int? rank;

  const MovieCard({
    super.key,
    required this.movie,
    required this.onTap,
    this.onRemove,
    this.showRank = false,
    this.rank,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 130,
        height: 190,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            // Poster image
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: CachedNetworkImage(
                imageUrl: movie.posterUrl,
                width: 130,
                height: 190,
                fit: BoxFit.cover,
                placeholder: (_, __) => Shimmer.fromColors(
                  baseColor: const Color(0xFF1F1F2E),
                  highlightColor: const Color(0xFF2D2D3E),
                  child: Container(
                    width: 130,
                    height: 190,
                    color: const Color(0xFF1F1F2E),
                  ),
                ),
                errorWidget: (_, __, ___) => Container(
                  width: 130,
                  height: 190,
                  color: const Color(0xFF1F1F2E),
                  child: const Icon(Icons.movie, color: AppTheme.textMuted, size: 40),
                ),
              ),
            ),

            // Gradient + title overlay (when NOT top10)
            if (!showRank)
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: ClipRRect(
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(8),
                    bottomRight: Radius.circular(8),
                  ),
                  child: Container(
                    decoration: const BoxDecoration(
                      gradient: AppTheme.cardGradient,
                    ),
                    padding: const EdgeInsets.fromLTRB(6, 16, 6, 6),
                    child: Text(
                      movie.title,
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ),

            // Top-10 rank number
            if (showRank && rank != null)
              Positioned(
                bottom: -16,
                left: -8,
                child: Text(
                  '$rank',
                  style: TextStyle(
                    fontSize: 80,
                    fontWeight: FontWeight.w900,
                    color: Colors.white.withOpacity(0.8),
                    height: 1,
                    shadows: [
                      Shadow(
                        color: AppTheme.violet.withOpacity(0.8),
                        blurRadius: 10,
                      ),
                    ],
                  ),
                ),
              ),

            // Remove button
            if (onRemove != null)
              Positioned(
                top: 6,
                right: 6,
                child: GestureDetector(
                  onTap: onRemove,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      shape: BoxShape.circle,
                      border: Border.all(
                          color: Colors.white.withOpacity(0.2), width: 1),
                    ),
                    child: const Icon(Icons.close, color: Colors.white, size: 14),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// Grid version
class MovieGridCard extends StatelessWidget {
  final Movie movie;
  final VoidCallback onTap;

  const MovieGridCard({super.key, required this.movie, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Stack(
          fit: StackFit.expand,
          children: [
            CachedNetworkImage(
              imageUrl: movie.posterUrl,
              fit: BoxFit.cover,
              placeholder: (_, __) => Shimmer.fromColors(
                baseColor: const Color(0xFF1A1A2E),
                highlightColor: const Color(0xFF252540),
                child: Container(color: const Color(0xFF1A1A2E)),
              ),
              errorWidget: (_, __, ___) => Container(
                color: const Color(0xFF1A1A2E),
                child: const Icon(Icons.movie, color: AppTheme.textMuted),
              ),
            ),
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                decoration: const BoxDecoration(gradient: AppTheme.cardGradient),
                padding: const EdgeInsets.fromLTRB(6, 12, 6, 6),
                child: Text(
                  movie.title,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
