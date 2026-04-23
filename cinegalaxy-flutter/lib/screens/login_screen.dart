import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';
import 'main_shell.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _loading = false;
  String _error = '';
  bool _obscurePass = true;

  late AnimationController _slideCtrl;
  late Animation<Offset> _slideAnim;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _slideCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 700));
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.06), end: Offset.zero)
        .animate(CurvedAnimation(parent: _slideCtrl, curve: Curves.easeOutCubic));
    _fadeAnim = CurvedAnimation(parent: _slideCtrl, curve: Curves.easeIn);
    _slideCtrl.forward();
  }

  Future<void> _handleLogin() async {
    if (_emailCtrl.text.trim().isEmpty || _passCtrl.text.isEmpty) return;
    setState(() { _loading = true; _error = ''; });
    try {
      final res = await SupabaseService.signIn(
        email: _emailCtrl.text.trim(),
        password: _passCtrl.text,
      );
      if (res.session != null && mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (_, __, ___) => const MainShell(),
            transitionsBuilder: (_, anim, __, child) => FadeTransition(opacity: anim, child: child),
            transitionDuration: const Duration(milliseconds: 400),
          ),
        );
      }
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = 'Error de conexión: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _slideCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Background glow
          Positioned(
            top: -100, left: -80,
            child: Container(
              width: 300, height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [AppTheme.violet.withValues(alpha: 0.15), Colors.transparent],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -80, right: -60,
            child: Container(
              width: 250, height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [AppTheme.violet.withValues(alpha: 0.1), Colors.transparent],
                ),
              ),
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: FadeTransition(
                opacity: _fadeAnim,
                child: SlideTransition(
                  position: _slideAnim,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 56),

                      // Logo
                      Center(
                        child: Column(children: [
                          Container(
                            width: 80, height: 80,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(22),
                              boxShadow: [BoxShadow(color: AppTheme.violet.withValues(alpha: 0.5), blurRadius: 30, offset: const Offset(0, 10))],
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(22),
                              child: Image.asset('assets/images/icon.png', fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(22),
                                    gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF8B5CF6)]),
                                  ),
                                  child: const Center(child: Text('🌌', style: TextStyle(fontSize: 36))),
                                )),
                            ),
                          ),
                          const SizedBox(height: 18),
                          ShaderMask(
                            shaderCallback: (b) => const LinearGradient(
                              colors: [Color(0xFFC4B5FD), Color(0xFF8B5CF6), Color(0xFF6D28D9)],
                            ).createShader(b),
                            child: const Text('CineGalaxy',
                              style: TextStyle(fontSize: 34, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.5)),
                          ),
                          const SizedBox(height: 6),
                          const Text('Portal Privado  ·  Acceso restringido',
                            style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                        ]),
                      ),

                      const SizedBox(height: 44),

                      // Error box
                      if (_error.isNotEmpty) ...[
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppTheme.red.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.red.withValues(alpha: 0.4)),
                          ),
                          child: Row(children: [
                            const Icon(Icons.warning_rounded, color: AppTheme.red, size: 18),
                            const SizedBox(width: 10),
                            Expanded(child: Text(_error, style: const TextStyle(color: AppTheme.red, fontWeight: FontWeight.w600, fontSize: 13))),
                          ]),
                        ),
                        const SizedBox(height: 20),
                      ],

                      // Email field
                      _FieldLabel('CORREO ELECTRÓNICO'),
                      const SizedBox(height: 8),
                      _StyledField(
                        controller: _emailCtrl,
                        hint: 'admin@cinegalaxy.com',
                        keyboardType: TextInputType.emailAddress,
                        prefixIcon: Icons.alternate_email_rounded,
                      ),
                      const SizedBox(height: 18),

                      // Password field
                      _FieldLabel('CONTRASEÑA'),
                      const SizedBox(height: 8),
                      _StyledField(
                        controller: _passCtrl,
                        hint: '••••••••',
                        obscure: _obscurePass,
                        onSubmit: _handleLogin,
                        prefixIcon: Icons.lock_outline_rounded,
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePass ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                            color: AppTheme.textMuted, size: 20,
                          ),
                          onPressed: () => setState(() => _obscurePass = !_obscurePass),
                        ),
                      ),

                      const SizedBox(height: 28),

                      // Login button
                      GestureDetector(
                        onTap: _loading ? null : _handleLogin,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          height: 54,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: _loading
                                  ? [const Color(0xFF6D28D9), const Color(0xFF6D28D9)]
                                  : [const Color(0xFF7C3AED), const Color(0xFF8B5CF6)],
                            ),
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(color: AppTheme.violet.withValues(alpha: 0.5), blurRadius: 20, offset: const Offset(0, 8)),
                            ],
                          ),
                          child: Center(
                            child: _loading
                                ? const SizedBox(height: 22, width: 22,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                                : const Row(mainAxisSize: MainAxisSize.min, children: [
                                    Icon(Icons.rocket_launch_rounded, color: Colors.white, size: 18),
                                    SizedBox(width: 10),
                                    Text('INICIAR SESIÓN', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15, letterSpacing: 1.2)),
                                  ]),
                          ),
                        ),
                      ),

                      const SizedBox(height: 40),

                      // Footer
                      Center(
                        child: Text(
                          'Acceso exclusivo para miembros autorizados',
                          style: TextStyle(color: Colors.white.withValues(alpha: 0.2), fontSize: 11),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);
  @override
  Widget build(BuildContext context) => Text(text,
    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.8));
}

class _StyledField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final bool obscure;
  final TextInputType? keyboardType;
  final VoidCallback? onSubmit;
  final IconData? prefixIcon;
  final Widget? suffixIcon;

  const _StyledField({
    required this.controller,
    required this.hint,
    this.obscure = false,
    this.keyboardType,
    this.onSubmit,
    this.prefixIcon,
    this.suffixIcon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(13),
        border: Border.all(color: Colors.white.withValues(alpha: 0.09)),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        keyboardType: keyboardType,
        autocorrect: false,
        style: const TextStyle(color: Colors.white, fontSize: 15),
        onSubmitted: onSubmit != null ? (_) => onSubmit!() : null,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.25)),
          prefixIcon: prefixIcon != null ? Icon(prefixIcon, color: AppTheme.violet.withValues(alpha: 0.6), size: 20) : null,
          suffixIcon: suffixIcon,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          filled: false,
        ),
      ),
    );
  }
}
