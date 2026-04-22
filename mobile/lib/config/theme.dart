import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Core colors — deep navy palette matching web design
  static const Color background  = Color(0xFF080B12);
  static const Color surface     = Color(0xFF0E1420);
  static const Color surfaceAlt  = Color(0xFF141C2E);
  static const Color elevated    = Color(0xFF1A2438);
  static const Color primary     = Color(0xFF6366F1);
  static const Color primaryDark = Color(0xFF4F46E5);
  static const Color secondary   = Color(0xFF8B5CF6);
  static const Color success     = Color(0xFF10B981);
  static const Color warning     = Color(0xFFF59E0B);
  static const Color error       = Color(0xFFF43F5E);
  static const Color textPrimary = Color(0xFFF0F4FF);
  static const Color textSecondary = Color(0xFF8899B8);
  static const Color textMuted   = Color(0xFF4D6082);
  static const Color border      = Color(0x0FFFFFFF);  // ~6% white
  static const Color borderMid   = Color(0x1AFFFFFF);  // ~10% white

  // Shadow helpers
  static List<BoxShadow> get shadowSm => [
    BoxShadow(color: const Color(0xFF0F0F0F).withOpacity(0.4), blurRadius: 4, offset: const Offset(0, 2)),
  ];
  static List<BoxShadow> get shadowMd => [
    BoxShadow(color: const Color(0xFF0F0F0F).withOpacity(0.5), blurRadius: 16, offset: const Offset(0, 4)),
    BoxShadow(color: const Color(0xFF0F0F0F).withOpacity(0.3), blurRadius: 6, offset: const Offset(0, 2)),
  ];
  static List<BoxShadow> shadowAccent(Color color) => [
    BoxShadow(color: color.withOpacity(0.35), blurRadius: 16, offset: const Offset(0, 4)),
  ];

  static ThemeData get dark {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: secondary,
        surface: surface,
        error: error,
        onPrimary: const Color(0xFFF5F2EB),
        onSecondary: const Color(0xFFF5F2EB),
        onSurface: textPrimary,
        surfaceContainer: surfaceAlt,
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: GoogleFonts.inter(color: textPrimary, fontWeight: FontWeight.bold),
        titleLarge: GoogleFonts.inter(color: textPrimary, fontWeight: FontWeight.w600),
        bodyLarge: GoogleFonts.inter(color: textPrimary),
        bodyMedium: GoogleFonts.inter(color: textSecondary),
        labelSmall: GoogleFonts.inter(color: textSecondary, fontSize: 11),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surface,
        foregroundColor: textPrimary,
        elevation: 0, titleTextStyle: GoogleFonts.inter(
          color: textPrimary, fontSize: 18, fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0, shadowColor: const Color(0xFF0F0F0F),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.zero,
          side: const BorderSide(color: border, width: 1),
        ),
        margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 0),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        hintStyle: GoogleFonts.inter(color: textSecondary, fontSize: 14),
        labelStyle: GoogleFonts.inter(color: textSecondary, fontSize: 12),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: const BorderSide(color: primary, width: 2),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: const Color(0xFFF5F2EB),
          elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 14),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: surface,
        overlayColor: WidgetStateProperty.all(Colors.transparent),
        indicatorColor: primary.withOpacity(0.15),
        indicatorShape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return GoogleFonts.inter(color: primary, fontSize: 11, fontWeight: FontWeight.w600);
          }
          return GoogleFonts.inter(color: textSecondary, fontSize: 11);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: primary, size: 22);
          }
          return const IconThemeData(color: textSecondary, size: 22);
        }),
      ),
      dividerTheme: const DividerThemeData(color: border, space: 1, thickness: 1),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: surfaceAlt,
        contentTextStyle: GoogleFonts.inter(color: textPrimary),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  // Income / expense helpers kept as static getters for use in widgets
  static const Color income = Color(0xFF10B981);
  static const Color expense = Color(0xFFF43F5E);

  static ThemeData get light {
    const Color bgLight = Color(0xFFF1F5F9);
    const Color surfaceLight = Color(0xFFFFFFFF);
    const Color surfaceAltLight = Color(0xFFE2E8F0);
    const Color borderLight = Color(0xFFE2E8F0);
    const Color textPrimaryLight = Color(0xFF0F172A);
    const Color textSecondaryLight = Color(0xFF475569);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: bgLight,
      colorScheme: const ColorScheme.light(
        primary: primary,
        secondary: secondary,
        surface: surfaceLight,
        error: error,
        onPrimary: const Color(0xFFF5F2EB),
        onSecondary: const Color(0xFFF5F2EB),
        onSurface: textPrimaryLight,
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme).copyWith(
        displayLarge: GoogleFonts.inter(color: textPrimaryLight, fontWeight: FontWeight.bold),
        titleLarge: GoogleFonts.inter(color: textPrimaryLight, fontWeight: FontWeight.w600),
        bodyLarge: GoogleFonts.inter(color: textPrimaryLight),
        bodyMedium: GoogleFonts.inter(color: textSecondaryLight),
        labelSmall: GoogleFonts.inter(color: textSecondaryLight, fontSize: 11),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surfaceLight,
        foregroundColor: textPrimaryLight,
        elevation: 0, shadowColor: borderLight,
        titleTextStyle: GoogleFonts.inter(
          color: textPrimaryLight, fontSize: 18, fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardThemeData(
        color: surfaceLight,
        elevation: 0, shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.zero,
          side: const BorderSide(color: borderLight, width: 1),
        ),
        margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 0),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: bgLight,
        hintStyle: GoogleFonts.inter(color: textSecondaryLight, fontSize: 14),
        labelStyle: GoogleFonts.inter(color: textSecondaryLight, fontSize: 12),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: const BorderSide(color: borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: const BorderSide(color: borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: const BorderSide(color: primary, width: 2),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: const Color(0xFFF5F2EB),
          elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 14),
        ),
      ),
      dividerTheme: const DividerThemeData(color: borderLight, space: 1, thickness: 1),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: surfaceLight,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: surfaceAltLight,
        contentTextStyle: GoogleFonts.inter(color: textPrimaryLight),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  // Gradient helpers
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, secondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient incomeGradient = LinearGradient(
    colors: [Color(0xFF10B981), Color(0xFF059669)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient expenseGradient = LinearGradient(
    colors: [Color(0xFFF43F5E), Color(0xFFE11D48)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient savingsGradient = LinearGradient(
    colors: [Color(0xFF10B981), Color(0xFF3B82F6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient warningGradient = LinearGradient(
    colors: [Color(0xFFF59E0B), Color(0xFFEF4444)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
