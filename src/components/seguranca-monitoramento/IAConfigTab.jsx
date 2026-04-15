import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, AlertTriangle, CheckCircle, Brain } from 'lucide-react';

const IAConfigTab = () => {
    const { toast } = useToast();
    const [configs, setConfigs] = useState({
        rekognition: { enabled: false, apiKey: '', endpoint: '', types: [], sensitivity: 'media', alerts: [] },
        eagleEye: { enabled: false, apiKey: '', endpoint: '', types: [], sensitivity: 'media', alerts: [] },
        katomaran: { enabled: false, apiKey: '', endpoint: '', types: [], sensitivity: 'media', alerts: [] },
        milestone: { enabled: false, apiKey: '', endpoint: '', types: [], sensitivity: 'media', alerts: [] }
    });

    useEffect(() => {
        const stored = localStorage.getItem('seguranca_ia_config');
        if (stored) setConfigs(JSON.parse(stored));
    }, []);

    const handleChange = (service, field, value) => {
        setConfigs(prev => ({
            ...prev,
            [service]: { ...prev[service], [field]: value }
        }));
    };

    const handleArrayChange = (service, field, value, checked) => {
        setConfigs(prev => {
            const currentList = prev[service][field] || [];
            const newList = checked 
                ? [...currentList, value] 
                : currentList.filter(item => item !== value);
            return { ...prev, [service]: { ...prev[service], [field]: newList } };
        });
    };

    const handleSave = () => {
        localStorage.setItem('seguranca_ia_config', JSON.stringify(configs));
        toast({ title: 'Configurações Salvas', description: 'As definições de IA foram atualizadas.' });
    };

    const renderServiceConfig = (key, title) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-600"/> {title}
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={configs[key].enabled} onChange={e => handleChange(key, 'enabled', e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            {configs[key].enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">API Endpoint URL</label>
                        <input className="w-full p-2 border rounded" value={configs[key].endpoint} onChange={e => handleChange(key, 'endpoint', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">API Key / Token</label>
                        <input className="w-full p-2 border rounded" type="password" value={configs[key].apiKey} onChange={e => handleChange(key, 'apiKey', e.target.value)} />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium block">Tipos de Análise</label>
                        <div className="flex gap-4 flex-wrap">
                            {['Reconhecimento Facial', 'Leitura de Placas (LPR)', 'Comportamento Suspeito', 'Contagem de Pessoas', 'Detecção de Armas'].map(type => (
                                <label key={type} className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={configs[key].types.includes(type)} onChange={e => handleArrayChange(key, 'types', type, e.target.checked)} />
                                    {type}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sensibilidade</label>
                        <select className="w-full p-2 border rounded" value={configs[key].sensitivity} onChange={e => handleChange(key, 'sensitivity', e.target.value)}>
                            <option value="baixa">Baixa (Menos falsos positivos)</option>
                            <option value="media">Média</option>
                            <option value="alta">Alta (Mais detalhes)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Gerar Alertas em:</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={configs[key].alerts.includes('dashboard')} onChange={e => handleArrayChange(key, 'alerts', 'dashboard', e.target.checked)} />
                                Dashboard
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={configs[key].alerts.includes('email')} onChange={e => handleArrayChange(key, 'alerts', 'email', e.target.checked)} />
                                E-mail
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={configs[key].alerts.includes('sms')} onChange={e => handleArrayChange(key, 'alerts', 'sms', e.target.checked)} />
                                SMS
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
             <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800 mb-6">
                <strong>Integração via API:</strong> Utilize os padrões de autenticação (Bearer Token ou API Key) para conectar os serviços de Video Analytics. Webhooks devem ser configurados no provedor para enviar eventos em tempo real para o endpoint <code>/api/webhooks/video-analytics</code>.
            </div>

            {renderServiceConfig('rekognition', 'Amazon Rekognition Video')}
            {renderServiceConfig('eagleEye', 'Eagle Eye Networks')}
            {renderServiceConfig('katomaran', 'Katomaran AI')}
            {renderServiceConfig('milestone', 'Milestone Systems')}

            <div className="flex justify-end sticky bottom-4">
                <Button onClick={handleSave} className="bg-[#1e3a8a] text-white shadow-lg">
                    <Save className="w-4 h-4 mr-2" /> Salvar Configurações
                </Button>
            </div>
        </div>
    );
};

export default IAConfigTab;