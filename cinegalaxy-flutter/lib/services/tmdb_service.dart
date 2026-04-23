import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/movie.dart';

class TmdbService {
  static Map<String, String> get _headers => {
        'accept': 'application/json',
        'Authorization': 'Bearer ${AppConfig.tmdbToken}',
      };

  static Future<List<Movie>> _fetchMovies(String endpoint,
      {String defaultType = 'movie'}) async {
    try {
      final res = await http.get(
        Uri.parse('${AppConfig.tmdbBaseUrl}$endpoint'),
        headers: _headers,
      );
      if (res.statusCode != 200) return [];
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      final results = (data['results'] as List?) ?? [];
      return results
          .map((m) => Movie.fromTMDB(m as Map<String, dynamic>,
              defaultType: defaultType,
              imagePrefix: AppConfig.imagePrefix))
          .toList();
    } catch (e) {
      return [];
    }
  }

  static Future<List<Movie>> getTrendingMovies() =>
      _fetchMovies('/trending/movie/day?language=es-ES', defaultType: 'movie');

  static Future<List<Movie>> getPopularMovies() =>
      _fetchMovies('/movie/popular?language=es-ES&page=2', defaultType: 'movie');

  static Future<List<Movie>> getPopularTV() =>
      _fetchMovies('/tv/popular?language=es-ES', defaultType: 'tv');

  static Future<List<Movie>> getAnimeShows() => _fetchMovies(
      '/discover/tv?language=es-ES&page=1&with_genres=16&with_original_language=ja',
      defaultType: 'tv');

  static Future<List<Movie>> getMediaByGenre(int genreId,
      {bool isTv = false}) {
    final type = isTv ? 'tv' : 'movie';
    return _fetchMovies(
        '/discover/$type?language=es-ES&with_genres=$genreId',
        defaultType: type);
  }

  static Future<List<Movie>> searchMovies(String query) async {
    if (query.trim().isEmpty) return [];
    try {
      final url =
          '${AppConfig.tmdbBaseUrl}/search/multi?query=${Uri.encodeComponent(query)}&include_adult=false&language=es-ES&page=1';
      final res = await http.get(Uri.parse(url), headers: _headers);
      if (res.statusCode != 200) return [];
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      final results = (data['results'] as List?) ?? [];
      return results
          .where((m) =>
              m['media_type'] == 'movie' || m['media_type'] == 'tv')
          .map((m) => Movie.fromTMDB(m as Map<String, dynamic>,
              defaultType: m['media_type'] as String,
              imagePrefix: AppConfig.imagePrefix))
          .toList();
    } catch (e) {
      return [];
    }
  }

  static Future<List<SeasonInfo>> getTVShowDetails(String id) async {
    try {
      final res = await http.get(
        Uri.parse('${AppConfig.tmdbBaseUrl}/tv/$id?language=es-ES'),
        headers: _headers,
      );
      if (res.statusCode != 200) return [];
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      final seasons = (data['seasons'] as List?) ?? [];
      return seasons
          .where((s) => (s['season_number'] as int) > 0)
          .map((s) => SeasonInfo(
                seasonNumber: s['season_number'] as int,
                name: s['name'] as String,
                episodeCount: s['episode_count'] as int,
              ))
          .toList();
    } catch (e) {
      return [];
    }
  }

  static Future<List<EpisodeInfo>> getTVShowEpisodes(
      String id, int seasonNumber) async {
    try {
      final res = await http.get(
        Uri.parse(
            '${AppConfig.tmdbBaseUrl}/tv/$id/season/$seasonNumber?language=es-ES'),
        headers: _headers,
      );
      if (res.statusCode != 200) return [];
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      final episodes = (data['episodes'] as List?) ?? [];
      return episodes
          .map((e) => EpisodeInfo(
                episodeNumber: e['episode_number'] as int,
                name: e['name'] as String,
              ))
          .toList();
    } catch (e) {
      return [];
    }
  }

  static Future<List<CastMember>> getMediaCredits(
      String id, String type) async {
    try {
      final res = await http.get(
        Uri.parse(
            '${AppConfig.tmdbBaseUrl}/$type/$id/credits?language=es-ES'),
        headers: _headers,
      );
      if (res.statusCode != 200) return [];
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      final cast = (data['cast'] as List?) ?? [];
      return cast
          .take(7)
          .map((a) => CastMember(
                id: a['id'] as int,
                name: a['name'] as String,
                character: a['character'] as String? ?? '',
                profilePath: a['profile_path'] as String?,
              ))
          .toList();
    } catch (e) {
      return [];
    }
  }
}
