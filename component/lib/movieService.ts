import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth } from "../lib/firebase";
import { Movie, UserPreferences } from "../../types";

const LOCAL_FAVS_KEY = "movieflix.favorites";

// get favorites: if signed-in, read Firestore, else read localStorage
export async function getFavorites(): Promise<Movie[]> {
    if (typeof window === "undefined") {
        return []; // SSR fallback
    }

    const user = auth.currentUser;
    if (user && db) {
        try {
            const ref = doc(db, "users", user.uid, "preferences", "profile");
            const snap = await getDoc(ref);
            if (snap.exists()) return snap.data().favorites ?? [];
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    // localStorage fallback
    try {
        const raw = localStorage.getItem(LOCAL_FAVS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

// save favorites: write to Firestore if signed-in, else to localStorage
export async function saveFavorites(favorites: Movie[]): Promise<void> {
    const user = auth.currentUser;
    if (user && db) {
        // ensure parent doc exists and set
        const ref = doc(db, "users", user.uid, "preferences", "profile");
        try {
            await setDoc(ref, { favorites, updatedAt: new Date().toISOString() }, { merge: true });
            return;
        } catch (err) {
            console.error("Failed to save favorites to Firestore", err);
        }
    }

    // fallback to localStorage
    try {
        if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_FAVS_KEY, JSON.stringify(favorites));
        }
    } catch (err) {
        console.error("Failed to save to localStorage", err);
    }
}

// save preferences to Firestore
export async function savePreferencesToFirestore(preferences: UserPreferences): Promise<void> {
    const user = auth.currentUser;
    if (user && db) {
        const ref = doc(db, "users", user.uid, "preferences", "profile");
        try {
            await setDoc(ref, {
                ...preferences,
                email: user.email,
                displayName: user.displayName,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (err) {
            console.error("Failed to save preferences to Firestore", err);
        }
    }
}

// migrate local favorites to Firestore (call when user upgrades / links account)
export async function migrateLocalToFirestore(): Promise<void> {
    const user = auth.currentUser;
    if (!user || !db) return;

    try {
        const raw = typeof window !== "undefined" ? localStorage.getItem(LOCAL_FAVS_KEY) : null;
        if (!raw) return;

        const localFavs = JSON.parse(raw);
        const ref = doc(db, "users", user.uid, "preferences", "profile");
        await setDoc(ref, { favorites: localFavs, updatedAt: new Date().toISOString() }, { merge: true });

        // optionally clear local
        localStorage.removeItem(LOCAL_FAVS_KEY);
    } catch (err) {
        console.error("Migration failed", err);
    }
}

const LOCAL_LISTS_KEY = "movieflix.lists";

// get lists
export async function getLists(): Promise<any[]> {
    if (typeof window === "undefined") return [];

    const user = auth.currentUser;
    if (user && db) {
        try {
            const ref = doc(db, "users", user.uid, "preferences", "lists");
            const snap = await getDoc(ref);
            if (snap.exists()) return snap.data().lists ?? [];
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    try {
        const raw = localStorage.getItem(LOCAL_LISTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

// save lists
export async function saveLists(lists: any[]): Promise<void> {
    const user = auth.currentUser;
    if (user && db) {
        const ref = doc(db, "users", user.uid, "preferences", "lists");
        try {
            await setDoc(ref, { lists, updatedAt: new Date().toISOString() }, { merge: true });
            return;
        } catch (err) {
            console.error("Failed to save lists to Firestore", err);
        }
    }

    try {
        if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_LISTS_KEY, JSON.stringify(lists));
        }
    } catch (err) {
        console.error("Failed to save lists to localStorage", err);
    }
}

// get full user profile
export async function getUserProfile(uid: string): Promise<any | null> {
    if (!db) return null;

    try {
        const ref = doc(db, "users", uid, "preferences", "profile");
        const snap = await getDoc(ref);

        if (snap.exists()) {
            return snap.data();
        }
        return null;
    } catch (err) {
        console.error("Failed to fetch user profile", err);
        return null;
    }
}
