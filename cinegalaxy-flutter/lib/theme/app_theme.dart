import 'package:flutter/material.dart';

class AppTheme {
  // Colors
  static const Color background = Color(0xFF09090B);      // zinc-950
  static const Color surface = Color(0xFF141414);
  static const Color surface2 = Color(0xFF1A1A1A);
  static const Color surface3 = Color(0xFF242424);
  static const Color border = Color(0x1AFFFFFF);          // white/10
  static const Color borderViolet = Color(0x4D8B5CF6);   // violet/30

  static const Color violet = Color(0xFF8B5CF6);          // violet-500
  static const Color violetDim = Color(0x298B5CF6);       // violet/16
  static const Color violetBright = Color(0xFFA78BFA);   // violet-400

  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFA1A1AA);  // zinc-400
  static const Color textMuted = Color(0xFF52525B);       // zinc-600
  static const Color textGreen = Color(0xFF46D369);

  static const Color red = Color(0xFFEF4444);
  static const Color redDim = Color(0x1AEF4444);

  // Gradients
  static const LinearGradient heroGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color(0x00000000),
      Color(0x80000000),
      Color(0xFF000000),
    ],
    stops: [0.0, 0.5, 1.0],
  );

  static const LinearGradient cardGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color(0x00000000),
      Color(0xCC000000),
    ],
  );

  static ThemeData get theme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: background,
        colorScheme: const ColorScheme.dark(
          primary: violet,
          surface: surface,
          onPrimary: Colors.white,
          onSurface: textPrimary,
        ),
        fontFamily: 'Inter',
        textTheme: const TextTheme(
          displayLarge: TextStyle(
              color: textPrimary,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5),
          displayMedium: TextStyle(
              color: textPrimary,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5),
          titleLarge: TextStyle(
              color: textPrimary,
              fontWeight: FontWeight.w700,
              fontSize: 22),
          titleMedium: TextStyle(
              color: textPrimary,
              fontWeight: FontWeight.w700,
              fontSize: 18),
          titleSmall: TextStyle(
              color: textPrimary,
              fontWeight: FontWeight.w600,
              fontSize: 14),
          bodyLarge: TextStyle(color: textPrimary, fontSize: 16),
          bodyMedium: TextStyle(color: textSecondary, fontSize: 14),
          bodySmall: TextStyle(color: textMuted, fontSize: 12),
          labelLarge: TextStyle(
              color: textPrimary,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: surface,
          foregroundColor: textPrimary,
          elevation: 0,
          surfaceTintColor: Colors.transparent,
          iconTheme: IconThemeData(color: textPrimary),
          titleTextStyle: TextStyle(
              color: textPrimary, fontSize: 20, fontWeight: FontWeight.w700),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white.withOpacity(0.05),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: violet, width: 1.5),
          ),
          hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: violet,
            foregroundColor: Colors.white,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            padding:
                const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            textStyle: const TextStyle(
                fontWeight: FontWeight.w700, letterSpacing: 1.2),
          ),
        ),
        cardTheme: CardThemeData(
          color: surface,
          elevation: 0,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Color(0xFF0D0D0D),
          selectedItemColor: violet,
          unselectedItemColor: Color(0xFF555555),
          type: BottomNavigationBarType.fixed,
          showSelectedLabels: true,
          showUnselectedLabels: true,
        ),
        progressIndicatorTheme:
            const ProgressIndicatorThemeData(color: violet),
      );
}
