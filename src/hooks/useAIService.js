import { useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useAIService = () => {
    const generateResponse = useCallback(async (clientMessage, history = []) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: config } = await supabase
                .from('smartzap_config_ia')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!config || !config.chave_api) {
                return "Aviso: IA não configurada. Defina a Chave API em Configurações > IA Avançado.";
            }

            // Mocking the OpenAI/Claude call to avoid requiring real keys in this environment.
            // In a real scenario, we'd use `fetch('https://api.openai.com/v1/chat/completions', ...)`
            
            // Simulating API latency
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return `[IA Sugestão (${config.model})]: Baseado em "${clientMessage}", recomendo verificar as opções em nosso catálogo. Posso ajudar com mais detalhes?`;
            
        } catch (error) {
            console.error("AI Service Error:", error);
            throw error;
        }
    }, []);

    return { generateResponse };
};