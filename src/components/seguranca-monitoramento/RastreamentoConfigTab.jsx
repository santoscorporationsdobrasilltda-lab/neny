import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save } from 'lucide-react';

const RastreamentoConfigTab = () => {
    const { toast } = useToast();
    const [configs, setConfigs] = useState({
        geoportal: { enabled: false, endpoint: '', token: '', polling: 30 },
        wsdenatran: { enabled: false, endpoint: '', token: '', polling: 60 }
    });

    useEffect(() => {
        const stored = localStorage.getItem('seguranca_rastreamento_config');
        if (stored) setConfigs(JSON.parse(stored));
    }, []);

    const handleChange = (service, field, value) => {
        setConfigs(prev => ({
            ...prev,
            [service]: { ...prev[service], [field]: value }
        }));
    };

    const handleSave = () => {
        localStorage.setItem('seguranca_rastreamento_config', JSON.stringify(configs));
        toast({ title: 'Configurações de Rastreamento Salvas' });
    };

    const renderConfig = (key, title) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={configs[key].enabled} onChange={e => handleChange(key, 'enabled', e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            {configs[key].enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium">Endpoint URL</label>
                        <input className="w-full p-2 border rounded" value={configs[key].endpoint} onChange={e => handleChange(key, 'endpoint', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Auth Token</label>
                        <input className="w-full p-2 border rounded" type="password" value={configs[key].token} onChange={e => handleChange(key, 'token', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Polling Interval (segundos)</label>
                        <input className="w-full p-2 border rounded" type="number" value={configs[key].polling} onChange={e => handleChange(key, 'polling', e.target.value)} />
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg text-sm text-indigo-800 mb-6">
                <strong>Data Polling:</strong> O sistema fará requisições periódicas aos endpoints configurados para atualizar a posição da frota. Certifique-se de que o intervalo de polling respeita os limites de taxa da API do provedor (Geoportal/WSDenatran).
            </div>

            {renderConfig('geoportal', 'API Geoportal')}
            {renderConfig('wsdenatran', 'API WSDenatran')}

            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-[#1e3a8a] text-white">Salvar Configurações</Button>
            </div>
        </div>
    );
};

export default RastreamentoConfigTab;