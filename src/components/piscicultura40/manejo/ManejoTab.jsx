import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Save, X, Edit, Search } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const ManejoTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: manejos,
        fetchAll: fetchManejos,
        create,
        update,
        remove,
    } = useSupabaseCrud('piscicultura40_manejos');

    const {
        data: tanques,
        fetchAll: fetchTanques,
    } = useSupabaseCrud('piscicultura40_tanques');

    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const initialForm = {
        id: '',
        data: new Date().toISOString().split('T')[0],
        tanqueId: '',
        tanqueNome: '',
        tipo: 'Alimentação',
        quantidade: '',
        produto: '',
        observacoes: '',
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (user) {
            fetchManejos();
            fetchTanques();
        }
    }, [user, fetchManejos, fetchTanques]);

    const resetForm = () => {
        setFormData({
            ...initialForm,
            data: new Date().toISOString().split('T')[0],
        });
        setIsEditing(false);
    };

    const handleTanqueChange = (e) => {
        const id = e.target.value;
        const tanque = tanques.find((item) => item.id === id);

        setFormData((prev) => ({
            ...prev,
            tanqueId: id,
            tanqueNome: tanque ? tanque.codigo : '',
        }));
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

        if (!formData.tanqueId) {
            toast({
                title: 'Erro',
                description: 'Selecione o tanque.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            tanque_id: formData.tanqueId,
            data: formData.data || null,
            tipo_manejo: formData.tipo || null,
            quantidade_racao:
                formData.tipo === 'Alimentação' && formData.quantidade
                    ? Number(formData.quantidade)
                    : null,
            produto_aplicado:
                formData.tipo === 'Tratamento' ? formData.produto || null : null,
            observacoes: formData.observacoes || null,
        };

        try {
            if (formData.id) {
                await update(formData.id, payload);
                toast({
                    title: 'Sucesso',
                    description: 'Manejo atualizado.',
                });
            } else {
                await create(payload);
                toast({
                    title: 'Sucesso',
                    description: 'Manejo registrado.',
                });
            }

            await fetchManejos();
            resetForm();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao salvar manejo.',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir registro?')) return;

        try {
            await remove(id);
            await fetchManejos();
            toast({
                title: 'Sucesso',
                description: 'Manejo removido.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao excluir manejo.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (item) => {
        const tanque = tanques.find((t) => t.id === item.tanque_id);

        setFormData({
            id: item.id,
            data: item.data || new Date().toISOString().split('T')[0],
            tanqueId: item.tanque_id || '',
            tanqueNome: tanque ? tanque.codigo : '',
            tipo: item.tipo_manejo || 'Alimentação',
            quantidade: item.quantidade_racao ?? '',
            produto: item.produto_aplicado || '',
            observacoes: item.observacoes || '',
        });

        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredManejos = useMemo(() => {
        const ordered = [...manejos].sort((a, b) => {
            const da = a.data ? new Date(a.data).getTime() : 0;
            const db = b.data ? new Date(b.data).getTime() : 0;
            return db - da;
        });

        return ordered.filter((item) => {
            const tanque = tanques.find((t) => t.id === item.tanque_id);
            const tanqueNome = tanque ? tanque.codigo : '';
            const term = searchTerm.toLowerCase();

            return (
                tanqueNome.toLowerCase().includes(term) ||
                (item.tipo_manejo || '').toLowerCase().includes(term) ||
                (item.produto_aplicado || '').toLowerCase().includes(term) ||
                (item.observacoes || '').toLowerCase().includes(term)
            );
        });
    }, [manejos, tanques, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isEditing ? 'Editar Manejo' : 'Novo Manejo'}
                    </h2>

                    {isEditing && (
                        <Button variant="ghost" onClick={resetForm} size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        className="p-2 border rounded"
                        type="date"
                        value={formData.data}
                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                        required
                    />

                    <select
                        className="p-2 border rounded"
                        value={formData.tanqueId}
                        onChange={handleTanqueChange}
                        required
                    >
                        <option value="">Selecione o Tanque...</option>
                        {tanques.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.codigo} ({t.especie})
                            </option>
                        ))}
                    </select>

                    <select
                        className="p-2 border rounded"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    >
                        <option value="Alimentação">Alimentação</option>
                        <option value="Classificação">Classificação</option>
                        <option value="Limpeza">Limpeza</option>
                        <option value="Tratamento">Tratamento</option>
                        <option value="Manejo Densidade">Manejo Densidade</option>
                    </select>

                    {formData.tipo === 'Alimentação' ? (
                        <input
                            className="p-2 border rounded"
                            type="number"
                            step="0.1"
                            placeholder="Qtd Ração (kg)"
                            value={formData.quantidade}
                            onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                        />
                    ) : (
                        <input
                            className="p-2 border rounded"
                            placeholder={
                                formData.tipo === 'Tratamento'
                                    ? 'Produto Aplicado'
                                    : 'Detalhe complementar (opcional)'
                            }
                            value={formData.produto}
                            onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                        />
                    )}

                    <input
                        className="p-2 border rounded md:col-span-3"
                        placeholder="Observações"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />

                    <div className="flex justify-end md:col-span-1">
                        <Button type="submit" className="bg-[#1e3a8a] text-white w-full">
                            <Save className="w-4 h-4 mr-2" />
                            {isEditing ? 'Atualizar' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <h3 className="font-semibold text-slate-700">
                        Manejos Registrados ({filteredManejos.length})
                    </h3>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                            placeholder="Buscar tanque, tipo, produto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="p-4">Data</th>
                                <th className="p-4">Tanque</th>
                                <th className="p-4">Tipo Manejo</th>
                                <th className="p-4">Detalhes</th>
                                <th className="p-4">Observações</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredManejos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">
                                        Nenhum manejo registrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredManejos.map((item) => {
                                    const tanque = tanques.find((t) => t.id === item.tanque_id);
                                    const tanqueNome = tanque ? tanque.codigo : 'Tanque não encontrado';

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="p-4 text-slate-500">
                                                {item.data ? new Date(item.data).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="p-4 font-bold text-slate-700">{tanqueNome}</td>
                                            <td className="p-4">{item.tipo_manejo}</td>
                                            <td className="p-4">
                                                {item.tipo_manejo === 'Alimentação'
                                                    ? item.quantidade_racao
                                                        ? `${item.quantidade_racao} kg`
                                                        : '-'
                                                    : item.produto_aplicado || '-'}
                                            </td>
                                            <td className="p-4 text-slate-500">{item.observacoes || '-'}</td>
                                            <td className="p-4 text-right space-x-1">
                                                <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManejoTab;