import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import '../theme/app_theme.dart';

class SplashScreen extends StatefulWidget {
  final VoidCallback onComplete;
  const SplashScreen({super.key, required this.onComplete});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnim = CurvedAnimation(parent: _fadeController, curve: Curves.easeIn);
    _fadeController.forward();

    // La animación Lottie dura ~3 s; al terminar hacemos fade out
    Future.delayed(const Duration(milliseconds: 3200), () {
      if (!mounted) return;
      _fadeController.reverse().then((_) {
        if (mounted) widget.onComplete();
      });
    });
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: FadeTransition(
        opacity: _fadeAnim,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Fondo con gradiente radial violeta
            Container(
              decoration: const BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.center,
                  radius: 0.9,
                  colors: [Color(0xFF1A0A2E), Color(0xFF09090B)],
                ),
              ),
            ),

            // Animación Lottie centrada
            Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 280,
                    height: 280,
                    child: Lottie.asset(
                      'assets/animations/cinegalaxy.json',
                      fit: BoxFit.contain,
                      repeat: false,
                      errorBuilder: (_, __, ___) => const Icon(
                        Icons.movie_filter_rounded,
                        color: AppTheme.violet,
                        size: 100,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  ShaderMask(
                    shaderCallback: (bounds) => const LinearGradient(
                      colors: [Color(0xFFC4B5FD), Color(0xFF8B5CF6), Color(0xFF6D28D9)],
                    ).createShader(bounds),
                    child: const Text(
                      'CineGalaxy',
                      style: TextStyle(
                        fontSize: 38,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: -1,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'PORTAL PRIVADO DE STREAMING',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.4),
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 3,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
