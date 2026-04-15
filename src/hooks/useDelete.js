import { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export const useDelete = (tableName) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    const remove = async (id) => {
        if (!currentUser) throw new Error('User not authenticated');
        setLoading(true);
        setError(null);
        try {
            const { error: err } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id)
                .eq('user_id', currentUser.id);
            if (err) throw err;
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { delete: remove, loading, error };
};
