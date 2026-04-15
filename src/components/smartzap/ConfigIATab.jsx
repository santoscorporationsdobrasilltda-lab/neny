import React, { useState } from 'react';
import { Settings, Save, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ConfigIATab = () => {
    const { toast } = useToast();
    const [config, setConfig] = useState({
        tone: 'amigavel',
        language: 'pt-BR',
        automationLevel: 'hybrid'
    });
    const [testInput, setTestInput] = useState('');
    const [aiResponse, setAiResponse] = useState('');

    const handleSave = () => {
        toast({ title: "Configurações Salvas", description: "A personalidade da IA foi atualizada." });
    };

    const handleTest = () => {
        if (!testInput) return;
        setAiResponse("Esta é uma resposta simulada da IA com base no tom " + config.tone + ". Ela responderia à sua pergunta de forma contextualizada.");
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-slate-600" /> Configurações Gerais da IA
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tom de Voz</label>
                        <select 
                            className="w-full p-2 border rounded-lg"
                            value={config.tone}
                            onChange={e => setConfig({...config, tone: e.target.value})}
                        >
                            <option value="amigavel">Amigável e Empático</option>
                            <option value="formal">Formal e Profissional</option>
                            <option value="tecnico">Técnico e Direto</option>
                            <option value="divertido">Descontraído e Divertido</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Define como o bot se expressa nas mensagens.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Idioma Padrão</label>
                        <select 
                            className="w-full p-2 border rounded-lg"
                            value={config.language}
                            onChange={e => setConfig({...config, language: e.target.value})}
                        >
                            <option value="pt-BR">Português (Brasil)</option>
                            <option value="en-US">English (US)</option>
                            <option value="es-ES">Español</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-4">Nível de Automação</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className={`border p-4 rounded-lg cursor-pointer transition-all ${config.automationLevel === 'suggestion' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:border-slate-300'}`}>
                                <input type="radio" name="auto" value="suggestion" checked={config.automationLevel === 'suggestion'} onChange={e => setConfig({...config, automationLevel: e.target.value})} className="sr-only"/>
                                <div className="font-bold text-slate-800 mb-1">Apenas Sugestão</div>
                                <div className="text-xs text-slate-500">IA sugere respostas, mas humano precisa aprovar/enviar.</div>
                            </label>
                            
                            <label className={`border p-4 rounded-lg cursor-pointer transition-all ${config.automationLevel === 'hybrid' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:border-slate-300'}`}>
                                <input type="radio" name="auto" value="hybrid" checked={config.automationLevel === 'hybrid'} onChange={e => setConfig({...config, automationLevel: e.target.value})} className="sr-only"/>
                                <div className="font-bold text-slate-800 mb-1">Híbrido (Recomendado)</div>
                                <div className="text-xs text-slate-500">Responde automaticamente perguntas simples, encaminha complexas.</div>
                            </label>

                            <label className={`border p-4 rounded-lg cursor-pointer transition-all ${config.automationLevel === 'full' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:border-slate-300'}`}>
                                <input type="radio" name="auto" value="full" checked={config.automationLevel === 'full'} onChange={e => setConfig({...config, automationLevel: e.target.value})} className="sr-only"/>
                                <div className="font-bold text-slate-800 mb-1">Totalmente Automático</div>
                                <div className="text-xs text-slate-500">IA tenta resolver tudo sozinha antes de passar para humano.</div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button onClick={handleSave} className="bg-[#1e3a8a] text-white">
                        <Save className="w-4 h-4 mr-2"/> Salvar Configurações
                    </Button>
                </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-600"/> Playground de Teste
                </h3>
                <div className="flex gap-2 mb-4">
                    <input 
                        className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Digite uma mensagem como se fosse um cliente..."
                        value={testInput}
                        onChange={e => setTestInput(e.target.value)}
                    />
                    <Button onClick={handleTest} className="bg-indigo-600 hover:bg-indigo-700">
                        Testar
                    </Button>
                </div>
                {aiResponse && (
                    <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm animate-in fade-in">
                        <div className="text-xs text-indigo-500 font-bold mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3"/> Resposta da IA
                        </div>
                        <p className="text-slate-700">{aiResponse}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfigIATab;