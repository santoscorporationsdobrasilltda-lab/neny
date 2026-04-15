import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Search, Filter, AlertTriangle, User, Car, Zap, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const EventosIATab = () => {
    const { toast } = useToast();
    const [events, setEvents] = useState([]);
    const [filterType, setFilterType] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('seguranca_eventos_ia');
        if (stored) setEvents(JSON.parse(stored));
    }, []);

    const addMockEvent = () => {
        const types = ['Face Detectada', 'Placa de Veículo', 'Movimento Suspeito', 'Arma Detectada'];
        const sources = ['Rekognition', 'Eagle Eye', 'Katomaran', 'Milestone'];
        const levels = ['Baixo', 'Médio', 'Alto', 'Crítico'];
        
        const newEvent = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            camera: `Câmera ${Math.floor(Math.random() * 10) + 1}`,
            tipo: types[Math.floor(Math.random() * types.length)],
            criticidade: levels[Math.floor(Math.random() * levels.length)],
            fonte: sources[Math.floor(Math.random() * sources.length)],
            imagem: 'placeholder-url'
        };

        const updated = [newEvent, ...events];
        setEvents(updated);
        localStorage.setItem('seguranca_eventos_ia', JSON.stringify(updated));
        toast({ title: 'Evento Simulado', description: `${newEvent.tipo} detectado!` });
    };

    const filteredEvents = events.filter(e => {
        const matchesType = filterType === 'Todos' || e.tipo === filterType;
        const matchesSearch = e.camera.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            e.tipo.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const getIcon = (tipo) => {
        if (tipo.includes('Face')) return <User className="w-4 h-4" />;
        if (tipo.includes('Placa')) return <Car className="w-4 h-4" />;
        return <AlertTriangle className="w-4 h-4" />;
    };

    const getLevelColor = (level) => {
        switch(level) {
            case 'Crítico': return 'bg-red-100 text-red-700 border-red-200';
            case 'Alto': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Médio': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex gap-4 items-center flex-1">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" 
                            placeholder="Buscar evento, câmera..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="p-2 border rounded-lg text-sm"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="Todos">Todos os Tipos</option>
                        <option value="Face Detectada">Face Detectada</option>
                        <option value="Placa de Veículo">Placa de Veículo</option>
                        <option value="Movimento Suspeito">Movimento Suspeito</option>
                    </select>
                </div>
                <Button onClick={addMockEvent} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2"/> Simular Detecção IA
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                            <th className="p-4">Data/Hora</th>
                            <th className="p-4">Evento</th>
                            <th className="p-4">Câmera</th>
                            <th className="p-4">Fonte IA</th>
                            <th className="p-4">Criticidade</th>
                            <th className="p-4">Recorte</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredEvents.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-slate-500">Nenhum evento registrado.</td></tr>
                        ) : (
                            filteredEvents.map(evt => (
                                <tr key={evt.id} className="hover:bg-slate-50">
                                    <td className="p-4 text-slate-500 font-mono text-xs">
                                        {new Date(evt.timestamp).toLocaleString()}
                                    </td>
                                    <td className="p-4 font-medium flex items-center gap-2">
                                        {getIcon(evt.tipo)} {evt.tipo}
                                    </td>
                                    <td className="p-4">{evt.camera}</td>
                                    <td className="p-4 text-xs font-semibold text-slate-600 uppercase">{evt.fonte}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getLevelColor(evt.criticidade)}`}>
                                            {evt.criticidade}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-500 cursor-pointer hover:bg-slate-300">
                                            IMG
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EventosIATab;