import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Save, Droplets, Search, X } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const DefensivosTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: applications,
        fetchAll: fetchApplications,
        create,
        update,
        remove,
    } = useSupabaseCrud('fazenda50_defensivos');

    const {
        data: lavouras,
        fetchAll: fetchLavouras,
    } = useSupabaseCrud('fazenda50_lavouras');

    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const initialForm = {
        id: '',
        lavouraId: '',
        lavouraNome: '',
        data: new Date().toISOString().split('T')[0],
        produto: '',
        dose: '',
        areaAplicada: '',
        equipamento: '',
        operador: '',
        condicaoClimatica: 'Ensolarado',
        carencia: '',
        observacoes: '',
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (user) {
            fetchApplications();
            fetchLavouras();
        }
    }, [user, fetchApplications, fetchLavouras]);

    const resetForm = () => {
        setFormData(initialForm);
        setIsEditing(false);
    };

    const handleLavouraChange = (e) => {
        const id = e.target.value;
        const lavoura = lavouras.find((l) => l.id === id);

        setFormData((prev) => ({
            ...prev,
            lavouraId: id,
            lavouraNome: lavoura ? `${lavoura.talhao} - ${lavoura.cultura}` : '',
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

        if (!formData.lavouraId || !formData.produto) {
            toast({
                title: 'Erro',
                description: 'Selecione a lavoura e informe o produto.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            lavoura_id: formData.lavouraId,
            data: formData.data || null,
            produto: formData.produto,
            dose: formData.dose || null,
            area_aplicada: formData.areaAplicada ? Number(formData.areaAplicada) : null,
            equipamento: formData.equipamento || null,
            operador: formData.operador || null,
            condicao_climatica: formData.condicaoClimatica || null,
            carencia: formData.carencia ? Number(formData.carencia) : null,
            observacoes: formData.observacoes || null,
        };

        try {
            if (formData.id) {
                await update(formData.id, payload);
                toast({
                    title: 'Sucesso',
                    description: 'Aplicação atualizada.',
                });
            } else {
                await create(payload);
                toast({
                    title: 'Sucesso',
                    description: `Defensivo registrado para ${formData.lavouraNome}.`,
                });
            }

            await fetchApplications();
            resetForm();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao salvar aplicação.',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir aplicação?')) return;

        try {
            await remove(id);
            await fetchApplications();
            toast({
                title: 'Sucesso',
                description: 'Aplicação removida.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao excluir aplicação.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (item) => {
        const lavoura = lavouras.find((l) => l.id === item.lavoura_id);

        setFormData({
            id: item.id,
            lavouraId: item.lavoura_id || '',
            lavouraNome: lavoura ? `${lavoura.talhao} - ${lavoura.cultura}` : '',
            data: item.data || new Date().toISOString().split('T')[0],
            produto: item.produto || '',
            dose: item.dose || '',
            areaAplicada: item.area_aplicada ?? '',
            equipamento: item.equipamento || '',
            operador: item.operador || '',
            condicaoClimatica: item.condicao_climatica || 'Ensolarado',
            carencia: item.carencia ?? '',
            observacoes: item.observacoes || '',
        });

        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredApplications = useMemo(() => {
        const ordered = [...applications].sort((a, b) => {
            const da = a.data ? new Date(a.data).getTime() : 0;
            const db = b.data ? new Date(b.data).getTime() : 0;
            return db - da;
        });

        return ordered.filter((item) => {
            const lavoura = lavouras.find((l) => l.id === item.lavoura_id);
            const lavouraNome = lavoura ? `${lavoura.talhao} - ${lavoura.cultura}` : '';
            const term = searchTerm.toLowerCase();

            return (
                lavouraNome.toLowerCase().includes(term) ||
                (item.produto || '').toLowerCase().includes(term) ||
                (item.operador || '').toLowerCase().includes(term) ||
                (item.condicao_climatica || '').toLowerCase().includes(term)
            );
        });
    }, [applications, lavouras, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#1e3a8a] flex items-center gap-2">
                        <Droplets className="w-5 h-5" />
                        {isEditing ? 'Editar Aplicação de Defensivos' : 'Aplicação de Defensivos'}
                    </h3>

                    {isEditing && (
                        <Button variant="ghost" size="sm" onClick={resetForm}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                        <label className="text-sm font-medium mb-1 block">Lavoura</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={formData.lavouraId}
                            onChange={handleLavouraChange}
                            required
                        >
                            <option value="">Selecione o Talhão...</option>
                            {lavouras.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.talhao} - {l.cultura}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Data</label>
                        <input
                            className="w-full p-2 border rounded"
                            type="date"
                            value={formData.data}
                            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-1 block">Produto</label>
                        <input
                            className="w-full p-2 border rounded"
                            placeholder="Nome do Produto"
                            value={formData.produto}
                            onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                            required
                        />
                    </div>

                    <input
                        className="p-2 border rounded"
                        placeholder="Dose (L/ha)"
                        value={formData.dose}
                        onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        type="number"
                        step="0.01"
                        placeholder="Área Aplicada (ha)"
                        value={formData.areaAplicada}
                        onChange={(e) => setFormData({ ...formData, areaAplicada: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        placeholder="Equipamento"
                        value={formData.equipamento}
                        onChange={(e) => setFormData({ ...formData, equipamento: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        placeholder="Operador"
                        value={formData.operador}
                        onChange={(e) => setFormData({ ...formData, operador: e.target.value })}
                    />

                    <select
                        className="p-2 border rounded"
                        value={formData.condicaoClimatica}
                        onChange={(e) => setFormData({ ...formData, condicaoClimatica: e.target.value })}
                    >
                        <option value="Ensolarado">Ensolarado</option>
                        <option value="Nublado">Nublado</option>
                        <option value="Chuva Leve">Chuva Leve</option>
                        <option value="Vento Forte">Vento Forte</option>
                    </select>

                    <input
                        className="p-2 border rounded"
                        type="number"
                        placeholder="Carência (dias)"
                        value={formData.carencia}
                        onChange={(e) => setFormData({ ...formData, carencia: e.target.value })}
                    />

                    <textarea
                        className="p-2 border rounded md:col-span-2 h-20"
                        placeholder="Observações"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />

                    <div className="md:col-span-4 flex justify-end items-end">
                        <Button type="submit" className="bg-[#1e3a8a] text-white w-full md:w-auto">
                            <Save className="w-4 h-4 mr-2" />
                            {formData.id ? 'Atualizar Aplicação' : 'Registrar Aplicação'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <h3 className="font-semibold text-slate-700">
                        Aplicações Registradas ({filteredApplications.length})
                    </h3>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                            placeholder="Buscar lavoura, produto, operador..."
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
                                <th className="p-4">Lavoura</th>
                                <th className="p-4">Produto</th>
                                <th className="p-4">Dose</th>
                                <th className="p-4">Área</th>
                                <th className="p-4">Operador</th>
                                <th className="p-4">Carência</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500">
                                        Nenhuma aplicação registrada.
                                    </td>
                                </tr>
                            ) : (
                                filteredApplications.map((item) => {
                                    const lavoura = lavouras.find((l) => l.id === item.lavoura_id);
                                    const lavouraNome = lavoura
                                        ? `${lavoura.talhao} - ${lavoura.cultura}`
                                        : 'Lavoura não encontrada';

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="p-4 text-slate-500">
                                                {item.data ? new Date(item.data).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="p-4 font-bold text-slate-700">{lavouraNome}</td>
                                            <td className="p-4">{item.produto}</td>
                                            <td className="p-4">{item.dose}</td>
                                            <td className="p-4">{item.area_aplicada ?? '-'}</td>
                                            <td className="p-4">{item.operador}</td>
                                            <td className="p-4">
                                                {item.carencia ? `${item.carencia} dias` : '-'}
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

export default DefensivosTab;