import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Save, MapPin, Truck, Navigation } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const RastreamentoTab = () => {
    const { toast } = useToast();
    const [vehicles, setVehicles] = useState([]);
    const [activeTab, setActiveTab] = useState('posicoes');
    
    // Vehicle CRUD
    const [form, setForm] = useState({ placa: '', renavam: '', proprietario: '', tipo: 'Carro', cliente: '', status: 'Ativo' });

    useEffect(() => {
        const stored = localStorage.getItem('seguranca_veiculos');
        if (stored) setVehicles(JSON.parse(stored));
    }, []);

    const handleSaveVehicle = (e) => {
        e.preventDefault();
        const newVehicle = { ...form, id: uuidv4(), lastPosition: null };
        const updated = [...vehicles, newVehicle];
        setVehicles(updated);
        localStorage.setItem('seguranca_veiculos', JSON.stringify(updated));
        toast({ title: 'Veículo Cadastrado' });
        setForm({ placa: '', renavam: '', proprietario: '', tipo: 'Carro', cliente: '', status: 'Ativo' });
    };

    const handleDelete = (id) => {
        const updated = vehicles.filter(v => v.id !== id);
        setVehicles(updated);
        localStorage.setItem('seguranca_veiculos', JSON.stringify(updated));
    };

    // Simulated data for positions
    const getSimulatedPosition = () => ({
        lat: -23.5505 + (Math.random() * 0.01),
        lon: -46.6333 + (Math.random() * 0.01),
        speed: Math.floor(Math.random() * 100),
        updatedAt: new Date().toISOString()
    });

    return (
        <div className="space-y-6">
             <div className="flex gap-4 border-b border-slate-200">
                <button 
                    className={`pb-2 px-4 font-medium ${activeTab === 'posicoes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                    onClick={() => setActiveTab('posicoes')}
                >
                    Posições em Tempo Real
                </button>
                <button 
                    className={`pb-2 px-4 font-medium ${activeTab === 'cadastro' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                    onClick={() => setActiveTab('cadastro')}
                >
                    Cadastro de Veículos
                </button>
            </div>

            {activeTab === 'cadastro' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                        <h3 className="font-bold text-slate-800 mb-4">Novo Veículo</h3>
                        <form onSubmit={handleSaveVehicle} className="space-y-4">
                            <input className="w-full p-2 border rounded" placeholder="Placa" value={form.placa} onChange={e => setForm({...form, placa: e.target.value})} required />
                            <input className="w-full p-2 border rounded" placeholder="RENAVAM" value={form.renavam} onChange={e => setForm({...form, renavam: e.target.value})} />
                            <input className="w-full p-2 border rounded" placeholder="Proprietário" value={form.proprietario} onChange={e => setForm({...form, proprietario: e.target.value})} />
                            <select className="w-full p-2 border rounded" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                                <option value="Carro">Carro</option>
                                <option value="Moto">Moto</option>
                                <option value="Caminhão">Caminhão</option>
                                <option value="Utilitário">Utilitário</option>
                            </select>
                            <input className="w-full p-2 border rounded" placeholder="Cliente / Empresa" value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})} />
                            <Button type="submit" className="w-full bg-[#1e3a8a]">Salvar</Button>
                        </form>
                    </div>

                    <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
                         <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-3">Placa</th>
                                    <th className="p-3">Tipo</th>
                                    <th className="p-3">Proprietário</th>
                                    <th className="p-3">Cliente</th>
                                    <th className="p-3">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.map(v => (
                                    <tr key={v.id} className="border-b hover:bg-slate-50">
                                        <td className="p-3 font-bold">{v.placa}</td>
                                        <td className="p-3">{v.tipo}</td>
                                        <td className="p-3">{v.proprietario}</td>
                                        <td className="p-3">{v.cliente}</td>
                                        <td className="p-3">
                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(v.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'posicoes' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                        <h3 className="font-semibold text-slate-700">Frota Monitorada</h3>
                        <div className="text-xs text-slate-500">
                            Fonte de Dados: Geoportal / WSDenatran
                        </div>
                    </div>
                    
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-4">Veículo</th>
                                <th className="p-4">Última Posição</th>
                                <th className="p-4">Velocidade</th>
                                <th className="p-4">Atualização</th>
                                <th className="p-4">Status Ign.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {vehicles.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Nenhum veículo cadastrado.</td></tr>
                            ) : (
                                vehicles.map(v => {
                                    const pos = getSimulatedPosition();
                                    return (
                                        <tr key={v.id} className="hover:bg-slate-50">
                                            <td className="p-4">
                                                <div className="font-bold flex items-center gap-2">
                                                    <Truck className="w-4 h-4 text-slate-400"/> {v.placa}
                                                </div>
                                                <div className="text-xs text-slate-500">{v.tipo} - {v.cliente}</div>
                                            </td>
                                            <td className="p-4 text-xs font-mono">
                                                Lat: {pos.lat.toFixed(6)}<br/>
                                                Lon: {pos.lon.toFixed(6)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`font-bold ${pos.speed > 80 ? 'text-red-600' : 'text-slate-700'}`}>
                                                    {pos.speed} km/h
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-slate-500">
                                                {new Date().toLocaleTimeString()}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${pos.speed > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                                    {pos.speed > 0 ? 'Ligado' : 'Parado'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RastreamentoTab;