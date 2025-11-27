import Link from 'next/link';
import Head from 'next/head';
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Custom404() {
  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center`}>
      <Head>
        <title>404 - Page Not Found | MovieRec</title>
        <meta name="description" content="Page not found" />
      </Head>

      <div className="space-y-6">
        <h1 className="text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>
        
        <Link 
          href="/"
          className="inline-block px-8 py-3 rounded-full bg-white text-black font-medium transition-transform hover:scale-105 hover:bg-zinc-200 active:scale-95"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
