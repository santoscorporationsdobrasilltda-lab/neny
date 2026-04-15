import { useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useLogging } from './useLogging';

export const useClienteSync = () => {
    const { logEvent } = useLogging();

    const syncCliente = useCallback(async (telefone, nome = 'Cliente WhatsApp') => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Check if client auto-sync is enabled
            const { data: config } = await supabase.from('smartzap_whatsapp_config').select('auto_create_clientes').eq('user_id', user.id).single();
            if (config && config.auto_create_clientes === false) return null;

            // Search for existing client
            const { data: existing } = await supabase.from('sac_crm_clientes').select('id').eq('telefone', telefone).eq('user_id', user.id).single();

            if (existing) {
                await logEvent('info', 'crm', `Cliente ${telefone} já existe, atualizando data de contato.`);
                return existing.id;
            }

            // Create new client
            const { data: newClient, error } = await supabase.from('sac_crm_clientes').insert([{
                user_id: user.id,
                nome: nome,
                telefone: telefone
            }]).select('id').single();

            if (error) throw error;
            await logEvent('info', 'crm', `Novo cliente criado automaticamente via WhatsApp: ${telefone}`);
            return newClient.id;

        } catch (error) {
            await logEvent('error', 'crm', `Erro ao sincronizar cliente ${telefone}`, { error: error.message });
            return null;
        }
    }, [logEvent]);

    return { syncCliente };
};