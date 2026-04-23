import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String get supabaseUrl => dotenv.env['SUPABASE_URL']?.trim() ?? '';
  static String get supabaseAnonKey => dotenv.env['SUPABASE_ANON_KEY']?.trim() ?? '';
  static String get imagePrefix =>
      dotenv.env['IMAGE_PREFIX']?.trim() ?? 'https://image.tmdb.org/t/p/original';
  static String get tmdbToken => dotenv.env['TMDB_ACCESS_TOKEN']?.trim() ?? '';
  static String get apiUrl =>
      dotenv.env['API_URL']?.trim() ?? 'https://cine-galaxy.vercel.app/api';
  static String get adminEmail => dotenv.env['ADMIN_EMAIL']?.trim() ?? '';

  static const String tmdbBaseUrl = 'https://api.themoviedb.org/3';
  static const String playerBaseUrl = 'https://player.videasy.net';
  static const String accentColor = '8B5CF6';
}
