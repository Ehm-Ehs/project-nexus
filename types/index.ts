export interface Movie {
    Title: string;
    Year: string;
    Rated: string;
    Released: string;
    Runtime: string;
    Genre: string;
    Director: string;
    Writer: string;
    Actors: string;
    Plot: string;
    Language: string;
    Country: string;
    Awards: string;
    Poster: string;
    Ratings: {
        Source: string;
        Value: string;
    }[];
    Metascore: string;
    imdbRating: string;
    imdbVotes: string;
    imdbID: string;
    Type: string;
    DVD: string;
    BoxOffice: string;
    Production: string;
    Website: string;
    Response: string;
    // Extended fields for rich UI
    moods?: string[];
    contentFlags?: string[];
    streaming?: string[];
    length?: number;
    pacing?: string;
    isHiddenGem?: boolean;
    genres?: string[];
    director?: string;
    country?: string;
}

export interface UserPreferences {
    moods: string[];
    likedMovies: string[];
    dislikedMovies: string[];
    languages: string[];
    countries: string[];
    contentRestrictions: string[];
    familiarityLevel: number;
    excludeFilters: string[];
}

export interface MovieList {
    id: string;
    name: string;
    description: string;
    isPublic: boolean;
    movieIds: string[];
    createdAt: string;
    updatedAt: string;
    collaborators?: number;
    movies?: Movie[]; // Optional populated movies
}
