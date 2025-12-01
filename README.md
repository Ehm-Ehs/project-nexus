# MovieRec

MovieRec is a modern, personalized movie recommendation application built with Next.js and Firebase. It helps users discover their next favorite movie through a tailored onboarding process and intelligent recommendations based on their unique taste profile.

## 🚀 Features

-   **Personalized Recommendations**: Get movie suggestions based on your mood, liked movies, and specific preferences (genres, languages, etc.).
-   **Trending & Popular**: Stay updated with daily and weekly trending movies.
-   **User Authentication**: Seamless sign-in with Google via Firebase Auth.
-   **Taste Profile**: Create and manage a detailed taste profile that evolves with your choices.
-   **Favorites & Lists**: Save movies to your favorites or create custom lists to organize your watchlist.
-   **Responsive Design**: A premium, dark-mode interface that looks great on desktop and mobile.
-   **Real-time Sync**: User data and preferences are synced across devices using Cloud Firestore.

## 🛠️ Tech Stack

-   **Frontend**: [Next.js 16](https://nextjs.org/) (React 19)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Language**: TypeScript
-   **Backend / Auth**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
-   **Data Source**: [TMDB API](https://www.themoviedb.org/documentation/api) (The Movie Database)
-   **Icons**: React Icons / Lucide React
-   **Notifications**: React Hot Toast

## 🏁 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   A TMDB API Key (Get one [here](https://www.themoviedb.org/settings/api))
-   A Firebase Project (Create one [here](https://console.firebase.google.com/))

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/movierec.git
    cd movierec
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables**:
    Create a `.env.local` file in the root directory and add the following keys:

    ```env
    # TMDB API
    NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
    NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/original

    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Scripts

-   `npm run dev`: Runs the app in development mode.
-   `npm run build`: Builds the app for production.
-   `npm start`: Starts the production server.
-   `npm run lint`: Runs ESLint to check for code quality issues.

