import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Radio } from 'lucide-react';

const AlarmeConfigTab = () => {
    const { toast } = useToast();
    const [configs, setConfigs] = useState({
        tmf642: { enabled: false, endpoint: '', token: '', timeout: 5000 },
        apiAlarm: { enabled: false, endpoint: '', token: '', timeout: 5000 },
        controlId: { enabled: false, endpoint: '', token: '', timeout: 5000 }
    });

    useEffect(() => {
        const stored = localStorage.getItem('seguranca_alarmes_config');
        if (stored) setConfigs(JSON.parse(stored));
    }, []);

    const handleChange = (service, field, value) => {
        setConfigs(prev => ({
            ...prev,
            [service]: { ...prev[service], [field]: value }
        }));
    };

    const handleSave = () => {
        localStorage.setItem('seguranca_alarmes_config', JSON.stringify(configs));
        toast({ title: 'Configurações Salvas' });
    };

    const handleTest = (service) => {
        toast({ title: 'Teste de Conexão', description: `Tentando conectar a ${service}... Sucesso (Simulado).` });
    };

    const renderConfig = (key, title) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={configs[key].enabled} onChange={e => handleChange(key, 'enabled', e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
            </div>
            
            {configs[key].enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium">Endpoint URL</label>
                        <input className="w-full p-2 border rounded" value={configs[key].endpoint} onChange={e => handleChange(key, 'endpoint', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">API Token / Key</label>
                        <input className="w-full p-2 border rounded" type="password" value={configs[key].token} onChange={e => handleChange(key, 'token', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Timeout (ms)</label>
                        <input className="w-full p-2 border rounded" type="number" value={configs[key].timeout} onChange={e => handleChange(key, 'timeout', e.target.value)} />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleTest(title)}>Testar Conexão</Button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg text-sm text-orange-800">
                <strong>Configuração de Webhooks:</strong> Para recepção de eventos em tempo real, configure seu hardware ou gateway para enviar POST requests para <code>/api/alarms/webhook</code> com o payload padrão do fabricante.
            </div>

            {renderConfig('tmf642', 'Protocolo TMF642 (Alarm Management)')}
            {renderConfig('apiAlarm', 'apiALARM Integration')}
            {renderConfig('controlId', 'Control iD API')}

            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-[#1e3a8a] text-white">Salvar Todas Configurações</Button>
            </div>
        </div>
    );
};

export default AlarmeConfigTab;