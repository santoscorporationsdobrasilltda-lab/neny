import { useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useLogging = () => {
    const logEvent = useCallback(async (tipo, modulo, mensagem, detalhes = {}) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const detalhesTexto = detalhes && Object.keys(detalhes).length
                ? ` | detalhes: ${JSON.stringify(detalhes)}`
                : '';

            await supabase.from('smartzap_logs').insert([{
                user_id: user.id,
                tipo, // 'info', 'warning', 'error'
                modulo,
                mensagem: `${mensagem}${detalhesTexto}`
            }]);
        } catch (e) {
            console.error('Failed to write log', e);
        }
    }, []);

    return { logEvent };
};