import { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export const useUpdate = (tableName) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    const update = async (id, payload) => {
        if (!currentUser) throw new Error('User not authenticated');
        setLoading(true);
        setError(null);
        try {
            const dataToUpdate = { ...payload };
            delete dataToUpdate.id;
            delete dataToUpdate.user_id;

            const { data, error: err } = await supabase
                .from(tableName)
                .update(dataToUpdate)
                .eq('id', id)
                .eq('user_id', currentUser.id)
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

    return { update, loading, error };
};
