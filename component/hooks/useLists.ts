import { useState, useEffect, useCallback } from 'react';
import { MovieList } from '../../types';
import { getLists, saveLists } from '../lib/movieService';
import useFirebaseAuth from './useAuth';
import { v4 as uuidv4 } from 'uuid';

export function useLists() {
    const [lists, setLists] = useState<MovieList[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useFirebaseAuth();

    const fetchLists = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getLists();
            setLists(data);
        } catch (error) {
            console.error('Error fetching lists:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchLists();
    }, [fetchLists]);

    const createList = useCallback(async (name: string, description: string, isPublic: boolean, movieIds: string[]) => {
        const newList: MovieList = {
            id: uuidv4(),
            name,
            description,
            isPublic,
            movieIds,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            collaborators: 1
        };

        const updatedLists = [...lists, newList];
        setLists(updatedLists);
        await saveLists(updatedLists);
        return newList;
    }, [lists]);

    const updateList = useCallback(async (listId: string, updates: Partial<MovieList>) => {
        const updatedLists = lists.map(list =>
            list.id === listId ? { ...list, ...updates, updatedAt: new Date().toISOString() } : list
        );
        setLists(updatedLists);
        await saveLists(updatedLists);
    }, [lists]);

    const deleteList = useCallback(async (listId: string) => {
        const updatedLists = lists.filter(list => list.id !== listId);
        setLists(updatedLists);
        await saveLists(updatedLists);
    }, [lists]);

    const addMovieToList = useCallback(async (listId: string, movieId: string) => {
        const list = lists.find(l => l.id === listId);
        if (list && !list.movieIds.includes(movieId)) {
            await updateList(listId, { movieIds: [...list.movieIds, movieId] });
        }
    }, [lists, updateList]);

    const removeMovieFromList = useCallback(async (listId: string, movieId: string) => {
        const list = lists.find(l => l.id === listId);
        if (list) {
            await updateList(listId, { movieIds: list.movieIds.filter(id => id !== movieId) });
        }
    }, [lists, updateList]);

    return {
        lists,
        loading,
        createList,
        updateList,
        deleteList,
        addMovieToList,
        removeMovieFromList,
        refreshLists: fetchLists
    };
}
