import 'package:flutter/material.dart';
import '../config.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import 'login_screen.dart';
import 'admin_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _isAdmin = false;
  String _username = 'Invitado';
  String _email = '';
  bool _showPasswordForm = false;
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _passLoading = false;

  @override
  void initState() {
    super.initState();
    _loadSession();
  }

  void _loadSession() {
    final user = SupabaseService.currentUser;
    if (user != null) {
      final email = user.email ?? '';
      final role = user.userMetadata?['role'] as String?;
      final username = user.userMetadata?['username'] as String? ?? email.split('@')[0];
      setState(() {
        _email = email;
        _username = username;
        _isAdmin = email == AppConfig.adminEmail || role == 'admin';
      });
    }
  }

  Future<void> _handleLogout() async {
    await SupabaseService.signOut();
    if (mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
        (_) => false,
      );
    }
  }

  Future<void> _handleChangePassword() async {
    final pass = _passCtrl.text;
    final confirm = _confirmCtrl.text;
    if (pass != confirm) { _showSnack('Las contraseñas no coinciden.', isError: true); return; }
    if (pass.length < 6) { _showSnack('Mínimo 6 caracteres.', isError: true); return; }
    setState(() => _passLoading = true);
    try {
      await SupabaseService.updatePassword(pass);
      _passCtrl.clear(); _confirmCtrl.clear();
      setState(() => _showPasswordForm = false);
      _showSnack('Contraseña actualizada galácticamente. ✨');
    } catch (_) {
      _showSnack('No se pudo actualizar.', isError: true);
    }
    if (mounted) setState(() => _passLoading = false);
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? AppTheme.red : AppTheme.violet,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    ));
  }

  @override
  void dispose() { _passCtrl.dispose(); _confirmCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    final initial = _username.isNotEmpty ? _username[0].toUpperCase() : 'U';

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: CustomScrollView(slivers: [
        SliverToBoxAdapter(
          child: Container(
            padding: EdgeInsets.only(top: topPad + 10, left: 16, right: 16, bottom: 14),
            color: AppTheme.surface,
            child: const Row(children: [
              Icon(Icons.settings_rounded, color: Colors.white, size: 22),
              SizedBox(width: 10),
              Text('Ajustes', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
            ]),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(children: [
              const SizedBox(height: 10),
              // Avatar
              Container(
                width: 88, height: 88,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.violet.withOpacity(0.2),
                  border: Border.all(color: AppTheme.violet.withOpacity(0.5), width: 2),
                ),
                child: Center(child: Text(initial,
                  style: const TextStyle(color: AppTheme.violet, fontSize: 36, fontWeight: FontWeight.w700))),
              ),
              const SizedBox(height: 12),
              Text(_username, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
              Text(_email, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
              const SizedBox(height: 32),

              // Cuenta section
              _sectionLabel('Cuenta y Seguridad'),
              Container(
                decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppTheme.border)),
                child: Column(children: [
                  if (_isAdmin) _item(Icons.shield_rounded, AppTheme.violet, 'Panel Maestro (Admin)',
                    () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminScreen())), hasBorder: true),
                  _item(Icons.key_rounded, AppTheme.violet, 'Cambiar Contraseña',
                    () => setState(() => _showPasswordForm = !_showPasswordForm), hasBorder: _showPasswordForm || true),
                  if (_showPasswordForm) _passwordForm(),
                  _item(Icons.logout_rounded, AppTheme.red, 'Cerrar Sesión', _handleLogout,
                    labelColor: AppTheme.red, bg: AppTheme.red.withOpacity(0.05)),
                ]),
              ),
              const SizedBox(height: 28),

              // About
              _sectionLabel('Acerca de'),
              Container(
                width: double.infinity, padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppTheme.border)),
                child: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('CineGalaxy v1.0.0 (Flutter)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                  SizedBox(height: 6),
                  Text('CineGalaxy es un proveedor de servicios de streaming gratuito. No almacenamos archivos. El contenido es provisto por terceros no afiliados.',
                    style: TextStyle(color: AppTheme.textMuted, fontSize: 11, height: 1.6)),
                ]),
              ),
              const SizedBox(height: 40),
            ]),
          ),
        ),
      ]),
    );
  }

  Widget _sectionLabel(String text) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Align(alignment: Alignment.centerLeft,
      child: Text(text.toUpperCase(),
        style: const TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.5))),
  );

  Widget _item(IconData icon, Color iconColor, String label, VoidCallback onTap,
      {Color? labelColor, Color? bg, bool hasBorder = false}) {
    return InkWell(onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(color: bg, border: hasBorder ? const Border(bottom: BorderSide(color: AppTheme.border)) : null),
        child: Row(children: [
          Icon(icon, color: iconColor, size: 22),
          const SizedBox(width: 12),
          Expanded(child: Text(label, style: TextStyle(color: labelColor ?? Colors.white, fontWeight: FontWeight.w700, fontSize: 15))),
          Icon(Icons.chevron_right_rounded, color: Colors.white.withOpacity(0.3), size: 20),
        ]),
      ),
    );
  }

  Widget _passwordForm() => Container(
    padding: const EdgeInsets.all(16),
    decoration: const BoxDecoration(color: AppTheme.surface2, border: Border(bottom: BorderSide(color: AppTheme.border))),
    child: Column(children: [
      TextField(controller: _passCtrl, obscureText: true, style: const TextStyle(color: Colors.white),
        decoration: const InputDecoration(hintText: 'Nueva contraseña')),
      const SizedBox(height: 10),
      TextField(controller: _confirmCtrl, obscureText: true, style: const TextStyle(color: Colors.white),
        decoration: const InputDecoration(hintText: 'Confirmar contraseña')),
      const SizedBox(height: 12),
      SizedBox(width: double.infinity,
        child: ElevatedButton(onPressed: _passLoading ? null : _handleChangePassword,
          child: _passLoading
            ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : const Text('ACEPTAR'))),
    ]),
  );
}
