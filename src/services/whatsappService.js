import { supabase } from '@/lib/customSupabaseClient';

export const whatsappService = {
    async getConfig() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { data } = await supabase
            .from('smartzap_whatsapp_config')
            .select('*')
            .eq('user_id', user.id)
            .single();

        return data;
    },

    async sendWhatsAppMessage(phoneNumber, messageText, conversaId) {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const config = await this.getConfig();

        if (!config || !config.access_token || !config.phone_id) {
            throw new Error('WhatsApp não configurado.');
        }

        const { data: tempMsg, error: insertError } = await supabase
            .from('smartzap_mensagens')
            .insert([
                {
                    user_id: user.id,
                    conversa_id: conversaId,
                    telefone: phoneNumber,
                    remetente: 'agente',
                    conteudo: messageText,
                    tipo: 'texto',
                    status: 'enviando',
                },
            ])
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        try {
            const response = await fetch(
                `https://graph.facebook.com/v17.0/${config.phone_id}/messages`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${config.access_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: phoneNumber,
                        type: 'text',
                        text: { body: messageText },
                    }),
                }
            );

            const result = await response.json();
            if (result.error) throw new Error(result.error.message);

            await supabase
                .from('smartzap_mensagens')
                .update({
                    status: 'enviado',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', tempMsg.id);

            return { success: true, message: tempMsg };
        } catch (error) {
            await supabase
                .from('smartzap_mensagens')
                .update({
                    status: 'erro',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', tempMsg.id);

            throw error;
        }
    },

    async sendWhatsAppMedia(phoneNumber, mediaUrl, mediaType, conversaId) {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const config = await this.getConfig();
        if (!config || !config.access_token || !config.phone_id) {
            throw new Error('WhatsApp não configurado.');
        }

        let typeStr = 'image';
        if (mediaType.includes('pdf') || mediaType.includes('document')) typeStr = 'document';
        if (mediaType.includes('video')) typeStr = 'video';

        const { data: tempMsg, error: insertError } = await supabase
            .from('smartzap_mensagens')
            .insert([
                {
                    user_id: user.id,
                    conversa_id: conversaId,
                    telefone: phoneNumber,
                    remetente: 'agente',
                    conteudo: `[Mídia: ${typeStr}] ${mediaUrl}`,
                    tipo: typeStr,
                    status: 'enviando',
                },
            ])
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        try {
            const body = {
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: typeStr,
            };
            body[typeStr] = { link: mediaUrl };

            const response = await fetch(
                `https://graph.facebook.com/v17.0/${config.phone_id}/messages`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${config.access_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                }
            );

            const result = await response.json();
            if (result.error) throw new Error(result.error.message);

            await supabase
                .from('smartzap_mensagens')
                .update({
                    status: 'enviado',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', tempMsg.id);

            return { success: true, message: tempMsg };
        } catch (error) {
            await supabase
                .from('smartzap_mensagens')
                .update({
                    status: 'erro',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', tempMsg.id);

            throw error;
        }
    },
};