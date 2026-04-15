import { useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useWhatsAppHistory = () => {
    const fetchHistory = useCallback(async (conversaId, phoneNumber) => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return [];

            await new Promise((resolve) => setTimeout(resolve, 800));

            const mockHistory = [
                {
                    user_id: user.id,
                    conversa_id: conversaId,
                    telefone: phoneNumber,
                    remetente: 'cliente',
                    conteudo: 'Olá, qual o horário de funcionamento?',
                    tipo: 'texto',
                    status: 'recebido',
                },
                {
                    user_id: user.id,
                    conversa_id: conversaId,
                    telefone: phoneNumber,
                    remetente: 'bot',
                    conteudo: 'Nosso horário é das 08h às 18h.',
                    tipo: 'texto',
                    status: 'enviado',
                },
            ];

            const { data, error } = await supabase
                .from('smartzap_mensagens')
                .insert(mockHistory)
                .select();

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('History sync error:', error);
            return [];
        }
    }, []);

    return { fetchHistory };
};