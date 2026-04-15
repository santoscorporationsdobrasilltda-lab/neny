import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, User } from 'lucide-react';

const LocalizacaoTab = ({ technicians }) => {
    // Mock locations since we don't have a real map API
    const locations = [
        { id: 1, tech: 'João Silva', lat: -23.550520, lng: -46.633308, status: 'Em trânsito', address: 'Av. Paulista, 1000 - São Paulo, SP' },
        { id: 2, tech: 'Maria Souza', lat: -23.550520, lng: -46.633308, status: 'Em atendimento', address: 'Rua Augusta, 500 - São Paulo, SP' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
             <h3 className="text-xl font-semibold text-slate-900">Localização da Equipe em Tempo Real</h3>
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    {locations.map(loc => (
                        <div key={loc.id} className="glass-effect p-4 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-500"/> {loc.tech}
                                </h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${loc.status === 'Em trânsito' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                    {loc.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5"/> 
                                {loc.address}
                            </p>
                        </div>
                    ))}
                </div>
                
                <div className="lg:col-span-2 bg-slate-200 rounded-xl min-h-[400px] flex items-center justify-center relative overflow-hidden">
                    {/* Placeholder for Map */}
                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] opacity-10 bg-cover bg-center"></div>
                    <div className="text-center p-8 bg-white/80 backdrop-blur-md rounded-xl shadow-lg z-10">
                        <Navigation className="w-12 h-12 text-indigo-600 mx-auto mb-4"/>
                        <h3 className="text-xl font-bold text-slate-800">Visualização de Mapa</h3>
                        <p className="text-slate-600 mt-2">Integração com OpenStreetMap ou Google Maps API necessária.</p>
                        <p className="text-xs text-slate-500 mt-4">A posição dos técnicos é atualizada via app móvel.</p>
                    </div>
                </div>
             </div>
        </motion.div>
    );
};

export default LocalizacaoTab;