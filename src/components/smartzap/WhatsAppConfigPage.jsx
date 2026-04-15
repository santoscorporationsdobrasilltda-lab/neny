import React, { useState, useEffect } from 'react';
import { Settings, Save, Smartphone, Link, RefreshCw, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { supabase } from '@/lib/customSupabaseClient';
import { useLogging } from '@/hooks/useLogging';

const WhatsAppConfigPage = () => {
    const { toast } = useToast();
    const { logEvent } = useLogging();
    const [config, setConfig] = useState({ id: null, phone_id: '', account_id: '', access_token: '', webhook_verify_token: '', auto_create_clientes: true });
    const [loading, setLoading] = useState(true);
    const [testStatus, setTestStatus] = useState(null);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data } = await supabase.from('smartzap_whatsapp_config').select('*').eq('user_id', user.id).maybeSingle();
            if (data) setConfig(data);
            setLoading(false);
        };
        load();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const payload = { ...config, user_id: user.id };
            
            if (config.id) {
                await supabase.from('smartzap_whatsapp_config').update(payload).eq('id', config.id);
            } else {
                const { data } = await supabase.from('smartzap_whatsapp_config').insert([payload]).select().maybeSingle();
                setConfig(data);
            }
            toast({ title: 'Sucesso', description: 'Configurações salvas.' });
            logEvent('info', 'whatsapp', 'Configurações do WhatsApp atualizadas.');
        } catch (error) {
            toast({ title: 'Erro', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const generateWebhookToken = () => {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        setConfig({ ...config, webhook_verify_token: token });
    };

    const testConnection = async () => {
        setTestStatus('testing');
        try {
            const res = await fetch(`https://graph.facebook.com/v17.0/${config.phone_id}`, {
                headers: { 'Authorization': `Bearer ${config.access_token}` }
            });
            if (res.ok) {
                setTestStatus('connected');
                toast({ title: 'Conectado', description: 'Conexão com a API do WhatsApp bem-sucedida.' });
            } else {
                setTestStatus('disconnected');
                toast({ title: 'Falha', description: 'Credenciais inválidas.', variant: 'destructive' });
            }
        } catch (error) {
            setTestStatus('disconnected');
        }
    };

    if (loading) return <div className="p-8 animate-pulse text-center">Carregando configurações...</div>;

    const webhookUrl = "https://[SUA-URL-SUPABASE]/functions/v1/whatsapp-webhook";

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Smartphone className="w-6 h-6 text-green-600" /> API Oficial do WhatsApp Business
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Phone Number ID</label>
                        <input className="w-full p-2 border rounded-lg" value={config.phone_id} onChange={e => setConfig({...config, phone_id: e.target.value})} placeholder="Ex: 1048923049823" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Business Account ID</label>
                        <input className="w-full p-2 border rounded-lg" value={config.account_id} onChange={e => setConfig({...config, account_id: e.target.value})} placeholder="Ex: 10293847561" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Access Token Permanente</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="password" className="w-full pl-9 p-2 border rounded-lg" value={config.access_token} onChange={e => setConfig({...config, access_token: e.target.value})} placeholder="EAAI..." />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Link className="w-4 h-4"/> Configuração de Webhook</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Callback URL (Webhook)</label>
                            <input className="w-full p-2 border rounded-lg bg-slate-100 text-slate-500 font-mono text-sm" value={webhookUrl} readOnly />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Verify Token</label>
                            <div className="flex gap-2">
                                <input className="flex-1 p-2 border rounded-lg font-mono text-sm" value={config.webhook_verify_token} onChange={e => setConfig({...config, webhook_verify_token: e.target.value})} />
                                <Button variant="outline" onClick={generateWebhookToken}><RefreshCw className="w-4 h-4 mr-2"/> Gerar</Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                    <input type="checkbox" id="auto_crm" checked={config.auto_create_clientes} onChange={e => setConfig({...config, auto_create_clientes: e.target.checked})} className="rounded text-green-600" />
                    <label htmlFor="auto_crm" className="text-sm text-slate-700 font-medium">Criar clientes automaticamente no CRM ao receber nova mensagem</label>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={testConnection} disabled={testStatus === 'testing'}>
                            {testStatus === 'testing' ? 'Testando...' : 'Testar Conexão'}
                        </Button>
                        {testStatus === 'connected' && <span className="flex items-center text-green-600 text-sm font-bold"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Conectado</span>}
                        {testStatus === 'disconnected' && <span className="flex items-center text-red-600 text-sm font-bold"><span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>Desconectado</span>}
                    </div>
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                        <Save className="w-4 h-4 mr-2"/> Salvar Configurações
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppConfigPage;