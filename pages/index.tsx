import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Geist, Geist_Mono } from "next/font/google";
import Header from '../component/layout/Header';
import Hero from '../component/layout/Hero';
import MovieGrid from '../component/common/MovieGrid';
import { Movie } from '../types';
import { 
  fetchTrendingMovies, 
  fetchRecommendedMovies, 
  getFavorites, 
  saveFavorites 
} from '../utils/movieService';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface HomeProps {
  trendingMovies: Movie[];
  recommendedMovies: Movie[];
}

export default function Home({ trendingMovies, recommendedMovies }: HomeProps) {
  const [activeTab, setActiveTab] = useState('trending');
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadFavorites = () => {
      setFavorites(getFavorites());
      setMounted(true);
    };
    loadFavorites();
  }, []);

  const handleToggleFavorite = (movie: Movie) => {
    const isFavorite = favorites.some(fav => fav.imdbID === movie.imdbID);
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav.imdbID !== movie.imdbID);
    } else {
      newFavorites = [...favorites, movie];
    }
    
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const getDisplayedMovies = () => {
    switch (activeTab) {
      case 'trending':
        return trendingMovies;
      case 'recommended':
        return recommendedMovies;
      case 'favorites':
        return favorites;
      default:
        return trendingMovies;
    }
  };

  // Prevent hydration mismatch for favorites
  if (!mounted) {
    return null;
  }

  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen bg-black text-white font-sans`}>
      <Head>
        <title>MovieFlix - Discover Your Next Favorite Movie</title>
        <meta name="description" content="Find trending and recommended movies tailored for you." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        favoritesCount={favorites.length}
      />

      <main>
        {activeTab === 'trending' && <Hero />}
        
        <MovieGrid 
          movies={getDisplayedMovies()} 
          activeTab={activeTab}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>

      <footer className="bg-zinc-900 py-8 text-center text-zinc-500">
        <p>© {new Date().getFullYear()} MovieRec. All rights reserved.</p>
      </footer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const [trendingMovies, recommendedMovies] = await Promise.all([
    fetchTrendingMovies(),
    fetchRecommendedMovies()
  ]);

  return {
    props: {
      trendingMovies,
      recommendedMovies,
    },
  };
};
