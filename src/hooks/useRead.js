import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export const useRead = (tableName, options = {}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    const fetchAll = useCallback(async () => {
        if (!currentUser) {
            setData([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            let query = supabase.from(tableName).select('*');
            query = query.eq('user_id', currentUser.id);
            const { data: result, error: err } = await query;
            if (err) throw err;
            setData(result || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [tableName, currentUser]);

    useEffect(() => {
        if (options.autoFetch !== false) {
            fetchAll();
        }
    }, [fetchAll, options.autoFetch]);

    return { data, loading, error, refetch: fetchAll };
};
