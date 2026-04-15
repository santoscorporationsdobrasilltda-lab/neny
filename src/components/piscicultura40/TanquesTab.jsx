import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Save, Search, X } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const TanquesTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: tanques,
        fetchAll,
        create,
        update,
        remove,
    } = useSupabaseCrud('piscicultura40_tanques');

    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const initialForm = {
        id: '',
        codigo: '',
        tipo: 'Escavado',
        volume: '',
        especie: 'Tilápia',
        densidade: '',
        localizacao: '',
        status: 'Ativo',
        observacoes: '',
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (user) {
            fetchAll();
        }
    }, [user, fetchAll]);

    const resetForm = () => {
        setFormData(initialForm);
        setIsEditing(false);
    };

    const generateCode = () => {
        const nextId = tanques.length + 1;
        return `TQ-${String(nextId).padStart(3, '0')}`;
    };

    const getCapacity = (vol, den) => {
        const targetWeight = 0.8;
        const fishPerM3 = parseFloat(den || 0);
        const kgPerM3 = fishPerM3 * targetWeight;
        return kgPerM3.toFixed(2);
    };

    const getTotalProd = (vol, den) => {
        const kgPerM3 = parseFloat(getCapacity(vol, den));
        const volume = parseFloat(vol || 0);
        return (volume * kgPerM3).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!formData.tipo || !formData.volume) {
            toast({
                title: 'Erro',
                description: 'Tipo e volume são obrigatórios.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            codigo: formData.codigo || generateCode(),
            tipo: formData.tipo || null,
            volume_m3: formData.volume ? Number(formData.volume) : null,
            especie: formData.especie || null,
            densidade_estocagem: formData.densidade ? Number(formData.densidade) : null,
            localizacao: formData.localizacao || null,
            status: formData.status || 'Ativo',
            observacoes: formData.observacoes || null,
        };

        try {
            if (formData.id) {
                await update(formData.id, payload);
                toast({
                    title: 'Sucesso',
                    description: 'Tanque atualizado.',
                });
            } else {
                await create(payload);
                toast({
                    title: 'Sucesso',
                    description: 'Tanque cadastrado.',
                });
            }

            await fetchAll();
            resetForm();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao salvar tanque.',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir tanque?')) return;

        try {
            await remove(id);
            await fetchAll();
            toast({
                title: 'Sucesso',
                description: 'Tanque removido.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao excluir tanque.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (item) => {
        setFormData({
            id: item.id,
            codigo: item.codigo || '',
            tipo: item.tipo || 'Escavado',
            volume: item.volume_m3 ?? '',
            especie: item.especie || 'Tilápia',
            densidade: item.densidade_estocagem ?? '',
            localizacao: item.localizacao || '',
            status: item.status || 'Ativo',
            observacoes: item.observacoes || '',
        });

        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filtered = useMemo(() => {
        return tanques.filter((t) =>
            (t.codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.especie || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.tipo || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tanques, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isEditing ? 'Editar Tanque' : 'Novo Tanque'}
                    </h2>

                    {isEditing && (
                        <Button variant="ghost" onClick={resetForm} size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        className="p-2 border rounded bg-slate-50"
                        placeholder="Código (Auto)"
                        value={formData.codigo}
                        readOnly
                    />

                    <select
                        className="p-2 border rounded"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    >
                        <option value="Escavado">Escavado</option>
                        <option value="Alvenaria">Alvenaria</option>
                        <option value="Rede">Tanque Rede</option>
                        <option value="Biofloco">Biofloco</option>
                        <option value="Outro">Outro</option>
                    </select>

                    <input
                        className="p-2 border rounded"
                        type="number"
                        step="0.01"
                        placeholder="Volume (m³)"
                        value={formData.volume}
                        onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                        required
                    />

                    <select
                        className="p-2 border rounded"
                        value={formData.especie}
                        onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
                    >
                        <option value="Tilápia">Tilápia</option>
                        <option value="Carpa">Carpa</option>
                        <option value="Truta">Truta</option>
                        <option value="Pacu">Pacu</option>
                        <option value="Tambaqui">Tambaqui</option>
                        <option value="Pintado">Pintado</option>
                        <option value="Outro">Outro</option>
                    </select>

                    <input
                        className="p-2 border rounded"
                        type="number"
                        step="0.01"
                        placeholder="Densidade (peixes/m³)"
                        value={formData.densidade}
                        onChange={(e) => setFormData({ ...formData, densidade: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        placeholder="Localização"
                        value={formData.localizacao}
                        onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                    />

                    <div className="md:col-span-1">
                        <label className="text-sm font-medium mb-1 block">Status</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formData.status === 'Ativo'}
                                    onChange={() => setFormData({ ...formData, status: 'Ativo' })}
                                />
                                Ativo
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formData.status === 'Inativo'}
                                    onChange={() => setFormData({ ...formData, status: 'Inativo' })}
                                />
                                Inativo
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-slate-50 p-3 rounded border border-slate-100 flex justify-between items-center text-sm">
                        <span>
                            <strong>Produtividade Est.:</strong> {getCapacity(formData.volume, formData.densidade)} kg/m³
                        </span>
                        <span>
                            <strong>Produção Total Est.:</strong> {getTotalProd(formData.volume, formData.densidade)} kg
                        </span>
                        <span className="text-xs text-slate-400">*Baseado em peso médio 0.8kg</span>
                    </div>

                    <textarea
                        className="p-2 border rounded md:col-span-3 h-16"
                        placeholder="Observações"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />

                    <div className="md:col-span-3 flex justify-end">
                        <Button type="submit" className="bg-[#1e3a8a] text-white">
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Tanque
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-slate-700">Tanques Cadastrados ({filtered.length})</h3>

                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                            placeholder="Buscar tanque..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="p-4">Código</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Espécie</th>
                                <th className="p-4">Volume</th>
                                <th className="p-4">Densidade</th>
                                <th className="p-4">Prod. Est.</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500">
                                        Nenhum tanque encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-bold text-slate-700">{item.codigo}</td>
                                        <td className="p-4">{item.tipo}</td>
                                        <td className="p-4">{item.especie}</td>
                                        <td className="p-4">{item.volume_m3} m³</td>
                                        <td className="p-4">{item.densidade_estocagem} px/m³</td>
                                        <td className="p-4 font-mono text-blue-600">
                                            {getTotalProd(item.volume_m3, item.densidade_estocagem)} kg
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Ativo'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-1">
                                            <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                                                <Edit className="w-4 h-4 text-blue-600" />
                                            </Button>

                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TanquesTab;