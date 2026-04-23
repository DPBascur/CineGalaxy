import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/bottom_nav_bar.dart';
import 'home_screen.dart';
import 'search_screen.dart';
import 'settings_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  void _goToSearch() => setState(() => _currentIndex = 1);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _HomeWrapper(onSearchTap: _goToSearch),
          const SearchScreen(),
          const SettingsScreen(),
        ],
      ),
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
      ),
    );
  }
}

/// Wraps HomeScreen and injects the search navigation callback
class _HomeWrapper extends StatelessWidget {
  final VoidCallback onSearchTap;
  const _HomeWrapper({required this.onSearchTap});

  @override
  Widget build(BuildContext context) {
    return HomeScreen(onSearchTap: onSearchTap);
  }
}
