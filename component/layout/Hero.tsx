import React from 'react';

const Hero = () => {
  return (
    <div 
      className="relative h-96 bg-cover bg-center"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(20,20,20,0.9)), url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80)',
      }}
    >
      <div className="container mx-auto flex h-full items-center px-4">
        <div className="max-w-2xl">
          <h2 className="mb-4 text-shadow text-5xl font-bold text-white">Discover Your Next Favorite Movie</h2>
          <p className="mb-6 text-shadow text-xl text-[var(--text-secondary)]">
            Explore trending films and get personalized recommendations tailored just for you
          </p>
          <button className="rounded-full bg-[var(--primary-color)] px-8 py-3 font-bold text-white transition-transform hover:scale-105">
            <span className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-xl"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Start Watching</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;