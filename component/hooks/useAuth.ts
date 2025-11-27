import { useEffect, useState, useCallback } from "react";
import {
    onAuthStateChanged,
    signInAnonymously,
    signOut,
    signInWithPopup,
    GoogleAuthProvider,
    linkWithPopup,
    linkWithCredential,
    EmailAuthProvider,
    User,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export default function useFirebaseAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setInitializing(false);
        });
        return () => unsub();
    }, []);

    // ensure anonymous user exists for every visitor
    const ensureAnonymous = useCallback(async () => {
        if (!auth.currentUser) {
            await signInAnonymously(auth);
            return;
        }
        // if already signed-in, do nothing
    }, []);

    const signInGoogle = useCallback(async () => {
        const provider = new GoogleAuthProvider();
        if (auth.currentUser && auth.currentUser.isAnonymous) {
            // link anonymous -> google, preserves uid (merges)
            try {
                const result = await linkWithPopup(auth.currentUser, provider);
                return result.user;
            } catch (err) {
                // if link fails you might need to sign in separately
                return null;
            }
        } else {
            // normal popup sign-in
            const res = await signInWithPopup(auth, provider);
            return res.user;
        }
    }, []);

    const linkEmailPassword = useCallback(async (email: string, password: string) => {
        if (!auth.currentUser) throw new Error("No current user");
        const credential = EmailAuthProvider.credential(email, password);
        const res = await linkWithCredential(auth.currentUser, credential);
        return res.user;
    }, []);

    const signOutUser = useCallback(async () => {
        await signOut(auth);
    }, []);

    return {
        user,
        initializing,
        ensureAnonymous,
        signInGoogle,
        linkEmailPassword,
        signOutUser,
    };
}
