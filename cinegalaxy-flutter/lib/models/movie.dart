class Movie {
  final String id;
  final String title;
  final String description;
  final String backdropUrl;
  final String posterUrl;
  final String genre;
  final double rating;
  final int year;
  final int match;
  final String mediaType; // 'movie' or 'tv'
  final bool adult;

  const Movie({
    required this.id,
    required this.title,
    required this.description,
    required this.backdropUrl,
    required this.posterUrl,
    required this.genre,
    required this.rating,
    required this.year,
    required this.match,
    required this.mediaType,
    this.adult = false,
  });

  factory Movie.fromTMDB(Map<String, dynamic> raw,
      {String defaultType = 'movie', required String imagePrefix}) {
    const genreMap = {
      28: 'Acción',
      12: 'Aventura',
      16: 'Animación',
      35: 'Comedia',
      80: 'Crimen',
      99: 'Documental',
      18: 'Drama',
      10751: 'Familia',
      14: 'Fantasía',
      36: 'Historia',
      27: 'Terror',
      10402: 'Música',
      9648: 'Misterio',
      10749: 'Romance',
      878: 'Sci-Fi',
      53: 'Suspense',
      10752: 'Bélica',
      37: 'Western',
    };

    final genreIds = (raw['genre_ids'] as List?)?.cast<int>() ?? [];
    final genreName =
        genreIds.isNotEmpty ? (genreMap[genreIds[0]] ?? 'Video') : 'Video';

    final voteAverage = (raw['vote_average'] as num?)?.toDouble() ?? 0.0;
    final releaseDate =
        raw['release_date'] as String? ?? raw['first_air_date'] as String? ?? '';
    final year = releaseDate.isNotEmpty
        ? int.tryParse(releaseDate.split('-')[0]) ?? 2024
        : 2024;

    final backdropPath = raw['backdrop_path'] as String?;
    final posterPath = raw['poster_path'] as String?;

    return Movie(
      id: raw['id'].toString(),
      title: raw['title'] as String? ?? raw['name'] as String? ?? '',
      description: raw['overview'] as String? ?? '',
      backdropUrl: backdropPath != null
          ? '$imagePrefix$backdropPath'
          : 'https://images.unsplash.com/photo-1618519764620-7403abdbf33a?w=1920&q=80',
      posterUrl: posterPath != null
          ? '$imagePrefix$posterPath'
          : 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500&q=60',
      genre: genreName,
      rating: double.parse(voteAverage.toStringAsFixed(1)),
      year: year,
      match: voteAverage > 0 ? (voteAverage * 10).floor() : 85,
      mediaType: raw['media_type'] as String? ?? defaultType,
      adult: raw['adult'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'backdropUrl': backdropUrl,
        'posterUrl': posterUrl,
        'genre': genre,
        'rating': rating,
        'year': year,
        'match': match,
        'mediaType': mediaType,
        'adult': adult,
      };

  factory Movie.fromJson(Map<String, dynamic> json) => Movie(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String? ?? '',
        backdropUrl: json['backdropUrl'] as String? ?? '',
        posterUrl: json['posterUrl'] as String? ?? '',
        genre: json['genre'] as String? ?? '',
        rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
        year: json['year'] as int? ?? 2024,
        match: json['match'] as int? ?? 85,
        mediaType: json['mediaType'] as String? ?? 'movie',
        adult: json['adult'] as bool? ?? false,
      );
}

class SeasonInfo {
  final int seasonNumber;
  final String name;
  final int episodeCount;

  const SeasonInfo(
      {required this.seasonNumber,
      required this.name,
      required this.episodeCount});
}

class EpisodeInfo {
  final int episodeNumber;
  final String name;

  const EpisodeInfo({required this.episodeNumber, required this.name});
}

class CastMember {
  final int id;
  final String name;
  final String character;
  final String? profilePath;

  const CastMember(
      {required this.id,
      required this.name,
      required this.character,
      this.profilePath});
}

class Review {
  final String userId;
  final String email;
  final String username;
  final String movieId;
  final int rating;
  final String comment;
  final bool isSpoiler;
  final DateTime? createdAt;

  const Review({
    required this.userId,
    required this.email,
    required this.username,
    required this.movieId,
    required this.rating,
    required this.comment,
    required this.isSpoiler,
    this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) => Review(
        userId: json['user_id'] as String? ?? '',
        email: json['email'] as String? ?? '',
        username: json['username'] as String? ?? '',
        movieId: json['movie_id'] as String? ?? '',
        rating: json['rating'] as int? ?? 5,
        comment: json['comment'] as String? ?? '',
        isSpoiler: json['is_spoiler'] as bool? ?? false,
        createdAt: json['created_at'] != null
            ? DateTime.tryParse(json['created_at'] as String)
            : null,
      );
}
