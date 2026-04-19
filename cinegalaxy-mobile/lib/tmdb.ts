import { Movie } from "@/lib/mockData";

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = process.env.EXPO_PUBLIC_IMAGE_PREFIX || "https://image.tmdb.org/t/p/original";
const TOKEN = process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN;

export const GENRE_MAP: Record<number, string> = {
  28: "Acción",
  12: "Aventura",
  16: "Animación",
  35: "Comedia",
  80: "Crimen",
  99: "Documental",
  18: "Drama",
  10751: "Familia",
  14: "Fantasía",
  36: "Historia",
  27: "Terror",
  10402: "Música",
  9648: "Misterio",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "Película TV",
  53: "Suspense",
  10752: "Bélica",
  37: "Western"
};

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${TOKEN}`,
  },
};

// Mapea la respuesta raw al modelo Movie que utiliza la Interfaz
function mapTMDBToMovie(raw: any, defaultType: 'movie' | 'tv' = 'movie'): Movie {
  return {
    id: raw.id.toString(),
    title: raw.title || raw.name,
    description: raw.overview,
    backdrop_url: raw.backdrop_path ? `${IMAGE_BASE}${raw.backdrop_path}` : "https://images.unsplash.com/photo-1618519764620-7403abdbf33a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    poster_url: raw.poster_path ? `${IMAGE_BASE}${raw.poster_path}` : "https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    genre: raw.genre_ids?.length > 0 ? GENRE_MAP[raw.genre_ids[0]] || "Video" : "Video",
    rating: raw.vote_average ? Number(raw.vote_average.toFixed(1)) : 0,
    year: raw.release_date ? parseInt(raw.release_date.split("-")[0]) : (raw.first_air_date ? parseInt(raw.first_air_date.split("-")[0]) : 2024),
    match: raw.vote_average ? Math.floor(raw.vote_average * 10) : 85,
    media_type: raw.media_type || defaultType,
    adult: raw.adult || false
  };
}

export async function getTrendingMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(`${BASE_URL}/trending/movie/day?language=es-ES`, options);
    const data = await res.json();
    return data.results ? data.results.map((m: any) => mapTMDBToMovie(m, 'movie')) : [];
  } catch (err) {
    console.error("Error fetching trending movies:", err);
    return [];
  }
}

export async function getPopularMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(`${BASE_URL}/movie/popular?language=es-ES&page=2`, options);
    const data = await res.json();
    return data.results ? data.results.map((m: any) => mapTMDBToMovie(m, 'movie')) : [];
  } catch (err) {
    console.error("Error fetching popular movies:", err);
    return [];
  }
}

export async function getPopularTV(): Promise<Movie[]> {
  try {
    const res = await fetch(`${BASE_URL}/tv/popular?language=es-ES`, options);
    const data = await res.json();
    return data.results ? data.results.map((m: any) => mapTMDBToMovie(m, 'tv')) : [];
  } catch (err) {
    console.error("Error fetching popular tv:", err);
    return [];
  }
}

export async function getMediaByGenre(genreId: number, isTv: boolean = false): Promise<Movie[]> {
  try {
    const type = isTv ? 'tv' : 'movie';
    const res = await fetch(`${BASE_URL}/discover/${type}?language=es-ES&with_genres=${genreId}`, options);
    const data = await res.json();
    return data.results ? data.results.map((m: any) => mapTMDBToMovie(m, type)) : [];
  } catch (err) {
    console.error(`Error fetching genre ${genreId}:`, err);
    return [];
  }
}

export async function getTopRatedMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(`${BASE_URL}/movie/top_rated?language=es-ES`, options);
    const data = await res.json();
    return data.results ? data.results.map((m: any) => mapTMDBToMovie(m, 'movie')) : [];
  } catch (err) {
    console.error("Error fetching top rated movies:", err);
    return [];
  }
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query) return [];
  try {
    const url = `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=es-ES&page=1`;
    const res = await fetch(url, options);
    const data = await res.json();
    // Filtramos solo movies o tv, descartando personas
    const validResults = data.results ? data.results.filter((i: any) => i.media_type === "movie" || i.media_type === "tv") : [];
    return validResults.map((m: any) => mapTMDBToMovie(m, m.media_type));
  } catch (err) {
    console.error("Error searching movies:", err);
    return [];
  }
}

export interface SeasonInfo {
  season_number: number;
  name: string;
  episode_count: number;
}
export interface EpisodeInfo {
  episode_number: number;
  name: string;
}

export async function getTVShowDetails(id: string): Promise<SeasonInfo[]> {
  try {
    const res = await fetch(`${BASE_URL}/tv/${id}?language=es-ES`, options);
    const data = await res.json();
    return data.seasons 
      ? data.seasons.filter((s: any) => s.season_number > 0).map((s: any) => ({
          season_number: s.season_number,
          name: s.name,
          episode_count: s.episode_count
        }))
      : [];
  } catch (err) {
    console.error("Error fetching tv show details:", err);
    return [];
  }
}

export async function getTVShowEpisodes(id: string, season_number: number): Promise<EpisodeInfo[]> {
  try {
    const res = await fetch(`${BASE_URL}/tv/${id}/season/${season_number}?language=es-ES`, options);
    const data = await res.json();
    return data.episodes 
      ? data.episodes.map((e: any) => ({
          episode_number: e.episode_number,
          name: e.name
        }))
      : [];
  } catch (err) {
    console.error(`Error fetching tv episodes for season ${season_number}:`, err);
    return [];
  }
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export async function getAnimeShows(): Promise<Movie[]> {
  try {
    const res = await fetch(`${BASE_URL}/discover/tv?language=es-ES&page=1&with_genres=16&with_original_language=ja`, options);
    const data = await res.json();
    return data.results ? data.results.map((m: any) => mapTMDBToMovie(m, 'tv')) : [];
  } catch (err) {
    console.error("Error fetching anime shows:", err);
    return [];
  }
}

export async function getMediaCredits(id: string, type: 'movie' | 'tv'): Promise<CastMember[]> {
  try {
    const res = await fetch(`${BASE_URL}/${type}/${id}/credits?language=es-ES`, options);
    const data = await res.json();
    return data.cast ? data.cast.slice(0, 7).map((actor: any) => ({
      id: actor.id,
      name: actor.name,
      character: actor.character,
      profile_path: actor.profile_path
    })) : [];
  } catch (err) {
    console.error("Error fetching credits:", err);
    return [];
  }
}
