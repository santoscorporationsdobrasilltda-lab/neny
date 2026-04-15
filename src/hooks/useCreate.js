import { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export const useCreate = (tableName) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    const create = async (payload) => {
        if (!currentUser) throw new Error('User not authenticated');
        setLoading(true);
        setError(null);
        try {
            const insertPayload = { ...payload };
            if (!insertPayload.user_id) insertPayload.user_id = currentUser.id;

            const { data, error: err } = await supabase
                .from(tableName)
                .insert([insertPayload])
                .select()
                .single();
            if (err) throw err;
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { create, loading, error };
};
