import React, { useState, useEffect } from 'react';
import { Brain, Save, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAIService } from '@/hooks/useAIService';

const AIConfigPage = () => {
    const { toast } = useToast();
    const { generateResponse } = useAIService();
    const [config, setConfig] = useState({ id: null, provedor_ia: 'openai', chave_api: '', model: 'gpt-3.5-turbo', temperature: 0.7, max_tokens: 500, system_prompt: 'Você é um assistente virtual prestativo.' });
    const [loading, setLoading] = useState(true);
    const [testResponse, setTestResponse] = useState('');

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data } = await supabase.from('smartzap_config_ia').select('*').eq('user_id', user.id).maybeSingle();
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
                await supabase.from('smartzap_config_ia').update(payload).eq('id', config.id);
            } else {
                const { data } = await supabase.from('smartzap_config_ia').insert([payload]).select().maybeSingle();
                setConfig(data);
            }
            toast({ title: 'Sucesso', description: 'Configurações de IA salvas.' });
        } catch (error) {
            toast({ title: 'Erro', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        setTestResponse('Gerando resposta...');
        try {
            const resp = await generateResponse("Olá, como funciona o sistema?");
            setTestResponse(resp);
        } catch (error) {
            setTestResponse('Erro ao conectar com a IA.');
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Carregando IA...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-600" /> Configuração Avançada de Inteligência Artificial
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="text-sm font-semibold block mb-1">Provedor</label>
                        <select className="w-full p-2 border rounded-lg" value={config.provedor_ia} onChange={e => setConfig({...config, provedor_ia: e.target.value})}>
                            <option value="openai">OpenAI (ChatGPT)</option>
                            <option value="anthropic">Anthropic (Claude)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-semibold block mb-1">API Key (Máscarada)</label>
                        <input type="password" className="w-full p-2 border rounded-lg" value={config.chave_api} onChange={e => setConfig({...config, chave_api: e.target.value})} placeholder="sk-..." />
                    </div>
                    <div>
                        <label className="text-sm font-semibold block mb-1">Modelo</label>
                        <input className="w-full p-2 border rounded-lg" value={config.model} onChange={e => setConfig({...config, model: e.target.value})} placeholder="gpt-4" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-sm font-semibold block mb-1">Temperatura ({config.temperature})</label>
                            <input type="range" min="0" max="1" step="0.1" className="w-full" value={config.temperature} onChange={e => setConfig({...config, temperature: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                            <label className="text-sm font-semibold block mb-1">Max Tokens</label>
                            <input type="number" className="w-full p-2 border rounded-lg" value={config.max_tokens} onChange={e => setConfig({...config, max_tokens: parseInt(e.target.value)})} />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-semibold block mb-1">System Prompt (Personalidade)</label>
                        <textarea className="w-full p-3 border rounded-lg h-32" value={config.system_prompt} onChange={e => setConfig({...config, system_prompt: e.target.value})} placeholder="Defina como a IA deve se comportar..." />
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <Button variant="outline" onClick={handleTest}><Zap className="w-4 h-4 mr-2 text-yellow-500"/> Testar IA</Button>
                    <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white"><Save className="w-4 h-4 mr-2"/> Salvar Configurações</Button>
                </div>
                
                {testResponse && (
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-lg text-sm text-purple-900">
                        <strong>Resposta da IA:</strong> {testResponse}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIConfigPage;