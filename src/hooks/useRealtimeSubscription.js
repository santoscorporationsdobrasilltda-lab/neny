import { useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useRealtimeSubscription = (tableName, onInsert, onUpdate, onDelete) => {
    useEffect(() => {
        const channel = supabase
            .channel(`public:${tableName}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: tableName }, payload => {
                if (onInsert) onInsert(payload.new);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: tableName }, payload => {
                if (onUpdate) onUpdate(payload.new);
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: tableName }, payload => {
                if (onDelete) onDelete(payload.old);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tableName, onInsert, onUpdate, onDelete]);
};