import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import '../theme/app_theme.dart';

/// Widget reutilizable de loading con la animación Lottie
class LottieLoader extends StatelessWidget {
  final double size;
  final String? label;

  const LottieLoader({super.key, this.size = 120, this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: size,
          height: size,
          child: Lottie.asset(
            'assets/animations/loading.json',
            fit: BoxFit.contain,
            errorBuilder: (_, __, ___) => const CircularProgressIndicator(
              color: AppTheme.violet,
              strokeWidth: 2,
            ),
          ),
        ),
        if (label != null) ...[
          const SizedBox(height: 4),
          Text(
            label!,
            style: const TextStyle(
              color: AppTheme.violetBright,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ],
    );
  }
}

/// Logo de CineGalaxy con imagen real
class CineGalaxyLogo extends StatelessWidget {
  final double size;
  final bool showText;
  final double fontSize;

  const CineGalaxyLogo({
    super.key,
    this.size = 34,
    this.showText = true,
    this.fontSize = 20,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(size * 0.24),
          child: Image.asset(
            'assets/images/icon.png',
            width: size,
            height: size,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(size * 0.24),
                gradient: const LinearGradient(
                  colors: [Color(0xFF7C3AED), Color(0xFF8B5CF6)],
                ),
              ),
              child: Center(
                child: Text('🌌', style: TextStyle(fontSize: size * 0.5)),
              ),
            ),
          ),
        ),
        if (showText) ...[
          const SizedBox(width: 8),
          ShaderMask(
            shaderCallback: (bounds) => const LinearGradient(
              colors: [Color(0xFFC4B5FD), Color(0xFF8B5CF6)],
            ).createShader(bounds),
            child: Text(
              'CineGalaxy',
              style: TextStyle(
                color: Colors.white,
                fontSize: fontSize,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.3,
              ),
            ),
          ),
        ],
      ],
    );
  }
}
