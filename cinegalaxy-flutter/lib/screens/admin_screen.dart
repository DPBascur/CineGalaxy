import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';
import 'login_screen.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});
  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  bool? _isAdmin;
  List<dynamic> _users = [];
  bool _loading = true;
  bool _isCreating = false;

  final _emailCtrl = TextEditingController();
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _checkAdmin();
  }

  Future<void> _checkAdmin() async {
    final user = SupabaseService.currentUser;
    if (user == null) {
      if (mounted) Navigator.of(context).pop();
      return;
    }
    final email = user.email ?? '';
    final role = user.userMetadata?['role'] as String?;
    if (email == AppConfig.adminEmail || role == 'admin') {
      setState(() => _isAdmin = true);
      _fetchUsers();
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Acceso Denegado'), backgroundColor: AppTheme.red));
        Navigator.pop(context);
      }
    }
  }

  Future<void> _fetchUsers() async {
    setState(() => _loading = true);
    try {
      final res = await http.get(Uri.parse('${AppConfig.apiUrl}/admin/users'));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        setState(() => _users = (data['users'] as List?) ?? []);
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('No se pudo conectar al servidor.'), backgroundColor: AppTheme.red));
      }
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _deleteUser(String id, String email) async {
    if (email == AppConfig.adminEmail) {
      _showSnack('El creador no puede ser eliminado.', isError: true);
      return;
    }
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.surface,
        title: const Text('Confirmación', style: TextStyle(color: Colors.white)),
        content: Text('¿Destruir la cuenta de $email?', style: const TextStyle(color: AppTheme.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
          TextButton(onPressed: () => Navigator.pop(context, true),
              child: const Text('Eliminar', style: TextStyle(color: AppTheme.red))),
        ],
      ),
    );
    if (confirmed == true) {
      final res = await http.delete(Uri.parse('${AppConfig.apiUrl}/admin/users?id=$id'));
      if (res.statusCode == 200) _fetchUsers();
      else _showSnack('Fallo al eliminar.', isError: true);
    }
  }

  Future<void> _createUser() async {
    if (_emailCtrl.text.isEmpty || _passwordCtrl.text.isEmpty) return;
    setState(() => _isCreating = true);
    try {
      final res = await http.post(
        Uri.parse('${AppConfig.apiUrl}/admin/users'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': _emailCtrl.text.trim(),
          'password': _passwordCtrl.text,
          'username': _usernameCtrl.text.trim(),
          'role': 'user',
        }),
      );
      if (res.statusCode == 200 || res.statusCode == 201) {
        _showSnack('Guardián registrado.');
        _emailCtrl.clear(); _usernameCtrl.clear(); _passwordCtrl.clear();
        _fetchUsers();
      } else {
        final data = jsonDecode(res.body) as Map;
        _showSnack(data['error'] as String? ?? 'Error al crear.', isError: true);
      }
    } catch (_) {
      _showSnack('Error de conexión.', isError: true);
    }
    if (mounted) setState(() => _isCreating = false);
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg), backgroundColor: isError ? AppTheme.red : AppTheme.violet,
      behavior: SnackBarBehavior.floating,
    ));
  }

  @override
  void dispose() { _emailCtrl.dispose(); _usernameCtrl.dispose(); _passwordCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    if (_isAdmin == null) {
      return Scaffold(
        backgroundColor: AppTheme.background,
        body: Center(child: LottieLoader(size: 120, label: 'Verificando acceso...')),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.surface,
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: Colors.white), onPressed: () => Navigator.pop(context)),
        title: const Row(children: [
          Icon(Icons.shield_rounded, color: AppTheme.violet, size: 26),
          SizedBox(width: 10),
          Text('Gestión Maestra', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
        ]),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          // Create form
          Container(
            padding: const EdgeInsets.all(18), margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppTheme.border)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Row(children: [
                Icon(Icons.person_add_rounded, color: AppTheme.violet, size: 22),
                SizedBox(width: 8),
                Text('Nuevo Miembro', style: TextStyle(color: AppTheme.violet, fontSize: 16, fontWeight: FontWeight.w700)),
              ]),
              const SizedBox(height: 16),
              TextField(controller: _emailCtrl, keyboardType: TextInputType.emailAddress,
                  style: const TextStyle(color: Colors.white), decoration: const InputDecoration(hintText: 'Correo')),
              const SizedBox(height: 10),
              TextField(controller: _usernameCtrl, style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(hintText: 'Alias (Username)')),
              const SizedBox(height: 10),
              TextField(controller: _passwordCtrl, obscureText: true, style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(hintText: 'Contraseña provisoria')),
              const SizedBox(height: 14),
              SizedBox(width: double.infinity,
                child: ElevatedButton(onPressed: _isCreating ? null : _createUser,
                  child: _isCreating ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('CREAR CUENTA'))),
            ]),
          ),

          // User list
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppTheme.border)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Directorio Central', style: TextStyle(color: AppTheme.violet, fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              _loading
                ? Center(child: LottieLoader(size: 100, label: 'Cargando usuarios...'))
                : _users.isEmpty
                  ? const Text('No hay usuarios.', style: TextStyle(color: AppTheme.textMuted))
                  : Column(children: _users.map<Widget>((u) {
                      final isMaster = u['email'] == AppConfig.adminEmail;
                      final meta = u['user_metadata'] as Map? ?? {};
                      final username = meta['username'] as String? ?? (u['email'] as String).split('@')[0];
                      return Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.border))),
                        child: Row(children: [
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(username, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                            Text(u['email'] as String, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                            if (isMaster)
                              Container(margin: const EdgeInsets.only(top: 4),
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(color: AppTheme.red.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
                                child: const Text('MÁSTER', style: TextStyle(color: AppTheme.red, fontSize: 10, fontWeight: FontWeight.w700))),
                          ])),
                          IconButton(
                            icon: Icon(Icons.delete_rounded, color: isMaster ? AppTheme.red.withOpacity(0.3) : AppTheme.red),
                            onPressed: isMaster ? null : () => _deleteUser(u['id'] as String, u['email'] as String),
                          ),
                        ]),
                      );
                    }).toList()),
            ]),
          ),
          const SizedBox(height: 40),
        ]),
      ),
    );
  }
}
