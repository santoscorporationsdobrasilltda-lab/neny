import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Save, X, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

const Fazenda50 = () => {
    const { toast } = useToast();
    const [properties, setProperties] = useState([]);
    const [formData, setFormData] = useState({ nome: '', localizacao: '', area: '', tipo: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('fazenda50_propriedades');
            if (stored) setProperties(JSON.parse(stored));
        } catch (error) {
            console.error("Erro ao carregar propriedades:", error);
        }
    }, []);

    const saveToStorage = (data) => {
        localStorage.setItem('fazenda50_propriedades', JSON.stringify(data));
        setProperties(data);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nome) {
            toast({ title: 'Erro', description: 'O nome da propriedade é obrigatório.', variant: 'destructive' });
            return;
        }

        let updatedList;
        if (formData.id) {
            updatedList = properties.map(p => p.id === formData.id ? formData : p);
            toast({ title: 'Sucesso', description: 'Propriedade atualizada com sucesso.' });
        } else {
            updatedList = [...properties, { ...formData, id: uuidv4() }];
            toast({ title: 'Sucesso', description: 'Nova propriedade cadastrada.' });
        }
        saveToStorage(updatedList);
        resetForm();
    };

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta propriedade?')) {
            const updated = properties.filter(p => p.id !== id);
            saveToStorage(updated);
            toast({ title: 'Removido', description: 'Propriedade excluída com sucesso.' });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setIsEditing(true);
    };

    const resetForm = () => {
        setFormData({ nome: '', localizacao: '', area: '', tipo: '' });
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
                    <h1 className="text-3xl font-bold text-[#1e3a8a]">Fazenda 5.0</h1>
                    <p className="text-slate-500">Gestão Integrada de Propriedades Rurais</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                    {isEditing ? <Edit className="w-5 h-5 text-blue-600"/> : <Plus className="w-5 h-5 text-green-600"/>}
                    <h2 className="text-xl font-bold text-slate-800">{isEditing ? 'Editar Propriedade' : 'Nova Propriedade'}</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Nome da Propriedade</label>
                        <input 
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                            placeholder="Ex: Fazenda Santa Maria" 
                            value={formData.nome} 
                            onChange={e => setFormData({...formData, nome: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Localização (Cidade/UF)</label>
                        <input 
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                            placeholder="Ex: Ribeirão Preto/SP" 
                            value={formData.localizacao} 
                            onChange={e => setFormData({...formData, localizacao: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Área Total (Hectares)</label>
                        <input 
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                            type="number"
                            placeholder="Ex: 1500" 
                            value={formData.area} 
                            onChange={e => setFormData({...formData, area: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Tipo de Produção</label>
                        <select 
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white" 
                            value={formData.tipo} 
                            onChange={e => setFormData({...formData, tipo: e.target.value})}
                        >
                            <option value="">Selecione o Tipo</option>
                            <option value="Agricultura">Agricultura (Grãos/Culturas)</option>
                            <option value="Pecuária">Pecuária (Gado de Corte/Leite)</option>
                            <option value="Mista">Mista (Integração Lavoura-Pecuária)</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 flex gap-3 justify-end mt-4 pt-4 border-t border-slate-100">
                        <Button type="button" variant="outline" onClick={resetForm} className="border-slate-300 hover:bg-slate-50">
                            <X className="w-4 h-4 mr-2"/> Cancelar
                        </Button>
                        <Button type="submit" className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white min-w-[120px]">
                            <Save className="w-4 h-4 mr-2"/> {isEditing ? 'Atualizar' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700">Propriedades Cadastradas</h3>
                    <span className="text-sm text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">Total: {properties.length}</span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Nome</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Localização</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Área (ha)</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Tipo</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {properties.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                <Plus className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p>Nenhuma propriedade cadastrada ainda.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                properties.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-800">{item.nome}</td>
                                        <td className="p-4 text-slate-600">{item.localizacao}</td>
                                        <td className="p-4 text-slate-600">{item.area}</td>
                                        <td className="p-4 text-slate-600">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                ${item.tipo === 'Agricultura' ? 'bg-green-100 text-green-700' : 
                                                  item.tipo === 'Pecuária' ? 'bg-amber-100 text-amber-700' : 
                                                  'bg-blue-100 text-blue-700'}`}>
                                                {item.tipo}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <Button size="sm" variant="ghost" onClick={() => handleEdit(item)} className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600">
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

export default Fazenda50;