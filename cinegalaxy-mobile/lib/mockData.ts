export interface Movie {
  id: string;
  title: string;
  description: string;
  backdrop_url: string;
  poster_url: string;
  genre: string;
  rating: number;
  year: number;
  match?: number;
  media_type?: 'movie' | 'tv';
  adult?: boolean;
}

export const mockMovies: Movie[] = [
  {
    id: "299534",
    title: "Vengadores: Endgame",
    description: "Después de los devastadores eventos de Infinity War, el universo está en ruinas. Los Vengadores se reúnen una vez más para restaurar el balance.",
    backdrop_url: "https://images.unsplash.com/photo-1618519764620-7403abdbf33a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    poster_url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    genre: "Acción",
    rating: 9.8,
    year: 2019,
    match: 99
  },
  {
    id: "2",
    title: "Liquid Mirrors",
    description: "Un detective cibernético investiga asesinatos que ocurren dentro de las reflexiones de la ciudad.",
    backdrop_url: "https://images.unsplash.com/photo-1589802781467-f41e0646cde7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    poster_url: "https://images.unsplash.com/photo-1528643604158-70d10b77b1e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    genre: "Thriller",
    rating: 8.5,
    year: 2025,
    match: 95
  },
  {
    id: "3",
    title: "Purple Skies",
    description: "Una historia de amor entre dos pilotos en un planeta alienígena con cielos eternamente púrpuras.",
    backdrop_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    poster_url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    genre: "Romance",
    rating: 7.9,
    year: 2024,
    match: 88
  },
  {
    id: "4",
    title: "The Stitch Protocol",
    description: "Un experimento genético resulta en una inteligencia artificial con instintos alienígenas que toma control de la red global.",
    backdrop_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    poster_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    genre: "Acción",
    rating: 9.1,
    year: 2026,
    match: 97
  },
  {
    id: "5",
    title: "Violet Infinity",
    description: "Astronautas viajan al centro de una nebulosa púrpura, descubriendo una civilización antigua hecha de cristal oscuro.",
    backdrop_url: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    poster_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    genre: "Sci-Fi",
    rating: 8.9,
    year: 2023,
    match: 92
  }
];

export const genres = ["Todos", "Sci-Fi", "Acción", "Thriller", "Romance", "Aventura"];
