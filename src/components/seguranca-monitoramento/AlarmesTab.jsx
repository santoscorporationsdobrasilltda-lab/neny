import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Save, Bell, Siren, CheckCircle, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const AlarmesTab = () => {
    const { toast } = useToast();
    const [zones, setZones] = useState([]);
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('eventos'); // 'zonas' or 'eventos'
    
    // Zones Form
    const [zoneForm, setZoneForm] = useState({ nome: '', dispositivo: '', local: '', tipo: 'Intrusão', prioridade: 'Alta', status: 'Ativo' });
    
    useEffect(() => {
        const storedZones = localStorage.getItem('seguranca_zonas_alarmes');
        if (storedZones) setZones(JSON.parse(storedZones));

        const storedEvents = localStorage.getItem('seguranca_eventos_alarmes');
        if (storedEvents) setEvents(JSON.parse(storedEvents));
    }, []);

    // Helper to simulate incoming alarm events
    const simulateEvent = () => {
        if (zones.length === 0) {
            toast({ title: 'Sem Zonas', description: 'Cadastre uma zona primeiro.' });
            return;
        }
        const randomZone = zones[Math.floor(Math.random() * zones.length)];
        const newEvent = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            zona: randomZone.nome,
            tipo: randomZone.tipo,
            origem: 'Simulador',
            status: 'Novo'
        };
        const updatedEvents = [newEvent, ...events];
        setEvents(updatedEvents);
        localStorage.setItem('seguranca_eventos_alarmes', JSON.stringify(updatedEvents));
        toast({ title: 'Alarme Disparado!', description: `Zona: ${randomZone.nome}`, variant: 'destructive' });
    };

    const handleSaveZone = (e) => {
        e.preventDefault();
        const newZone = { ...zoneForm, id: uuidv4() };
        const updated = [...zones, newZone];
        setZones(updated);
        localStorage.setItem('seguranca_zonas_alarmes', JSON.stringify(updated));
        toast({ title: 'Zona Cadastrada' });
        setZoneForm({ nome: '', dispositivo: '', local: '', tipo: 'Intrusão', prioridade: 'Alta', status: 'Ativo' });
    };

    const handleUpdateEventStatus = (id, newStatus) => {
        const updated = events.map(e => e.id === id ? { ...e, status: newStatus } : e);
        setEvents(updated);
        localStorage.setItem('seguranca_eventos_alarmes', JSON.stringify(updated));
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-slate-200">
                <button 
                    className={`pb-2 px-4 font-medium ${activeTab === 'eventos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                    onClick={() => setActiveTab('eventos')}
                >
                    Monitoramento de Eventos
                </button>
                <button 
                    className={`pb-2 px-4 font-medium ${activeTab === 'zonas' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                    onClick={() => setActiveTab('zonas')}
                >
                    Cadastro de Zonas
                </button>
            </div>

            {activeTab === 'zonas' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                        <h3 className="font-bold text-slate-800 mb-4">Nova Zona de Alarme</h3>
                        <form onSubmit={handleSaveZone} className="space-y-4">
                            <input className="w-full p-2 border rounded" placeholder="Nome da Zona" value={zoneForm.nome} onChange={e => setZoneForm({...zoneForm, nome: e.target.value})} required />
                            <input className="w-full p-2 border rounded" placeholder="Local Físico" value={zoneForm.local} onChange={e => setZoneForm({...zoneForm, local: e.target.value})} />
                            <select className="w-full p-2 border rounded" value={zoneForm.tipo} onChange={e => setZoneForm({...zoneForm, tipo: e.target.value})}>
                                <option value="Intrusão">Intrusão</option>
                                <option value="Pânico">Pânico</option>
                                <option value="Cerca Elétrica">Cerca Elétrica</option>
                                <option value="Incêndio">Incêndio</option>
                            </select>
                            <select className="w-full p-2 border rounded" value={zoneForm.prioridade} onChange={e => setZoneForm({...zoneForm, prioridade: e.target.value})}>
                                <option value="Baixa">Baixa</option>
                                <option value="Média">Média</option>
                                <option value="Alta">Alta</option>
                                <option value="Crítico">Crítico</option>
                            </select>
                            <Button type="submit" className="w-full bg-[#1e3a8a]">Salvar Zona</Button>
                        </form>
                    </div>
                    
                    <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-3">Zona</th>
                                    <th className="p-3">Tipo</th>
                                    <th className="p-3">Local</th>
                                    <th className="p-3">Prioridade</th>
                                    <th className="p-3">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {zones.map(z => (
                                    <tr key={z.id} className="border-b hover:bg-slate-50">
                                        <td className="p-3 font-medium">{z.nome}</td>
                                        <td className="p-3">{z.tipo}</td>
                                        <td className="p-3">{z.local}</td>
                                        <td className="p-3">{z.prioridade}</td>
                                        <td className="p-3">
                                            <Button size="sm" variant="ghost" onClick={() => {
                                                const updated = zones.filter(x => x.id !== z.id);
                                                setZones(updated);
                                                localStorage.setItem('seguranca_zonas_alarmes', JSON.stringify(updated));
                                            }}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'eventos' && (
                <div className="space-y-4">
                    <div className="flex justify-between">
                         <div className="text-sm text-slate-500 bg-blue-50 p-2 rounded border border-blue-200">
                            <strong>Integradores Suportados:</strong> TMF642, apiALARM, Control iD. Eventos recebidos via webhook aparecem aqui em tempo real.
                        </div>
                        <Button onClick={simulateEvent} variant="destructive" size="sm">
                            <Siren className="w-4 h-4 mr-2" /> Simular Disparo
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-4">Hora</th>
                                    <th className="p-4">Zona</th>
                                    <th className="p-4">Tipo</th>
                                    <th className="p-4">Origem</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {events.map(evt => (
                                    <tr key={evt.id} className={evt.status === 'Novo' ? 'bg-red-50' : 'bg-white'}>
                                        <td className="p-4 font-mono text-xs">{new Date(evt.timestamp).toLocaleTimeString()}</td>
                                        <td className="p-4 font-bold text-slate-800">{evt.zona}</td>
                                        <td className="p-4">{evt.tipo}</td>
                                        <td className="p-4 text-slate-500 text-xs">{evt.origem}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                ${evt.status === 'Novo' ? 'bg-red-200 text-red-800 animate-pulse' : 
                                                  evt.status === 'Em Atendimento' ? 'bg-yellow-200 text-yellow-800' : 
                                                  'bg-green-200 text-green-800'}`}>
                                                {evt.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            {evt.status === 'Novo' && (
                                                <Button size="sm" onClick={() => handleUpdateEventStatus(evt.id, 'Em Atendimento')}>Atender</Button>
                                            )}
                                            {evt.status === 'Em Atendimento' && (
                                                <Button size="sm" variant="outline" className="text-green-600 border-green-600" onClick={() => handleUpdateEventStatus(evt.id, 'Encerrado')}>
                                                    <CheckCircle className="w-4 h-4 mr-1"/> Encerrar
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {events.length === 0 && (
                                    <tr><td colSpan="6" className="p-8 text-center text-slate-500">Nenhum evento de alarme recente.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlarmesTab;