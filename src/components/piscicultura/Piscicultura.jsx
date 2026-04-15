import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Save, X, Fish } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

const Piscicultura = () => {
    const { toast } = useToast();
    const [tanks, setTanks] = useState([]);
    const [formData, setFormData] = useState({ identificacao: '', especie: '', qtd: '', povoamento: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('piscicultura_tanques');
            if (stored) setTanks(JSON.parse(stored));
        } catch (error) {
            console.error("Erro ao carregar tanques:", error);
        }
    }, []);

    const saveToStorage = (data) => {
        localStorage.setItem('piscicultura_tanques', JSON.stringify(data));
        setTanks(data);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.identificacao) {
            toast({ title: 'Erro', description: 'A identificação do tanque é obrigatória.', variant: 'destructive' });
            return;
        }

        let updatedList;
        if (formData.id) {
            updatedList = tanks.map(t => t.id === formData.id ? formData : t);
            toast({ title: 'Sucesso', description: 'Dados do tanque atualizados.' });
        } else {
            updatedList = [...tanks, { ...formData, id: uuidv4() }];
            toast({ title: 'Sucesso', description: 'Novo tanque registrado.' });
        }
        saveToStorage(updatedList);
        resetForm();
    };

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza que deseja remover este tanque?')) {
            saveToStorage(tanks.filter(t => t.id !== id));
            toast({ title: 'Removido', description: 'Tanque removido com sucesso.' });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setIsEditing(true);
    };

    const resetForm = () => {
        setFormData({ identificacao: '', especie: '', qtd: '', povoamento: '' });
        setIsEditing(false);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-6xl mx-auto"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#0891b2]">Gestão de Piscicultura</h1>
                    <p className="text-[#64748b]">Controle de Tanques e Produção Aquícola</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
                    {isEditing ? <Edit className="w-5 h-5 text-blue-600"/> : <Fish className="w-5 h-5 text-cyan-600"/>}
                    <h2 className="text-xl font-bold text-[#1e293b]">{isEditing ? 'Editar Tanque' : 'Novo Tanque'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#334155]">Identificação do Tanque</label>
                        <input 
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all bg-white text-[#111827]" 
                            placeholder="Ex: Tanque A-01" 
                            value={formData.identificacao} 
                            onChange={e => setFormData({...formData, identificacao: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#334155]">Espécie de Peixe</label>
                        <input 
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all bg-white text-[#111827]" 
                            placeholder="Ex: Tilápia, Tambaqui..." 
                            value={formData.especie} 
                            onChange={e => setFormData({...formData, especie: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#334155]">Quantidade Inicial (Unidades)</label>
                        <input 
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all bg-white text-[#111827]" 
                            type="number"
                            placeholder="Ex: 5000" 
                            value={formData.qtd} 
                            onChange={e => setFormData({...formData, qtd: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#334155]">Data de Povoamento</label>
                        <input 
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all bg-white text-[#111827]" 
                            type="date"
                            value={formData.povoamento} 
                            onChange={e => setFormData({...formData, povoamento: e.target.value})}
                        />
                    </div>

                    <div className="md:col-span-2 flex gap-3 justify-end mt-4 pt-4 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={resetForm} className="border-slate-300 hover:bg-slate-50 text-slate-700">
                            <X className="w-4 h-4 mr-2"/> Cancelar
                        </Button>
                        <Button type="submit" className="bg-[#0891b2] hover:bg-[#0e7490] text-white min-w-[120px] font-semibold">
                            <Save className="w-4 h-4 mr-2"/> {isEditing ? 'Atualizar' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-[#334155]">Tanques Ativos</h3>
                    <span className="text-sm font-medium text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">Total: {tanks.length}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-[#475569] text-sm uppercase tracking-wider">Identificação</th>
                                <th className="p-4 font-semibold text-[#475569] text-sm uppercase tracking-wider">Espécie</th>
                                <th className="p-4 font-semibold text-[#475569] text-sm uppercase tracking-wider">Qtd. Inicial</th>
                                <th className="p-4 font-semibold text-[#475569] text-sm uppercase tracking-wider">Povoamento</th>
                                <th className="p-4 font-semibold text-[#475569] text-sm uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tanks.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                <Fish className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p>Nenhum tanque registrado ainda.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                tanks.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-[#1e293b]">{item.identificacao}</td>
                                        <td className="p-4 text-[#475569]">{item.especie}</td>
                                        <td className="p-4 text-[#475569] font-mono">{item.qtd}</td>
                                        <td className="p-4 text-[#475569]">
                                            {item.povoamento ? new Date(item.povoamento).toLocaleDateString('pt-BR') : '-'}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <Button size="sm" variant="ghost" onClick={() => handleEdit(item)} className="h-8 w-8 p-0 hover:bg-cyan-50 hover:text-cyan-600">
                                                <Edit className="w-4 h-4"/>
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600">
                                                <Trash2 className="w-4 h-4"/>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default Piscicultura;