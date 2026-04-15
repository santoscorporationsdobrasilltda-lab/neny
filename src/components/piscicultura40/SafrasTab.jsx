import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Save, Search, X } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const SafrasTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: safras,
        fetchAll: fetchSafras,
        create,
        update,
        remove,
    } = useSupabaseCrud('piscicultura40_safras');

    const {
        data: tanques,
        fetchAll: fetchTanques,
    } = useSupabaseCrud('piscicultura40_tanques');

    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const initialForm = {
        id: '',
        tanqueId: '',
        tanqueNome: '',
        especie: 'Tilápia',
        dataPovoamento: '',
        qtdInicial: '',
        pesoMedioInicial: '',
        previsaoSaida: '',
        metaPesoFinal: '1000',
        tipoSistema: 'Intensivo',
        status: 'Ativa',
        dataAbate: '',
        producaoTotal: '',
        mortalidade: '',
        conversaoAlimentar: '',
        receita: '',
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (user) {
            fetchSafras();
            fetchTanques();
        }
    }, [user, fetchSafras, fetchTanques]);

    const resetForm = () => {
        setFormData(initialForm);
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

        if (!formData.tanqueId || !formData.qtdInicial) {
            toast({
                title: 'Erro',
                description: 'Tanque e quantidade inicial são obrigatórios.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            tanque_id: formData.tanqueId,
            especie: formData.especie || null,
            data_povoamento: formData.dataPovoamento || null,
            quantidade_inicial: formData.qtdInicial ? Number(formData.qtdInicial) : null,
            peso_medio_inicial: formData.pesoMedioInicial ? Number(formData.pesoMedioInicial) : null,
            previsao_saida: formData.previsaoSaida || null,
            meta_peso_final: formData.metaPesoFinal ? Number(formData.metaPesoFinal) : null,
            tipo_sistema: formData.tipoSistema || null,
            data_abate: formData.status === 'Concluída' ? (formData.dataAbate || null) : null,
            producao_total: formData.status === 'Concluída' ? (formData.producaoTotal ? Number(formData.producaoTotal) : null) : null,
            mortalidade: formData.status === 'Concluída' ? (formData.mortalidade ? Number(formData.mortalidade) : null) : null,
            conversao_alimentar: formData.status === 'Concluída' ? (formData.conversaoAlimentar ? Number(formData.conversaoAlimentar) : null) : null,
            receita: formData.status === 'Concluída' ? (formData.receita ? Number(formData.receita) : null) : null,
            status: formData.status || 'Ativa',
        };

        try {
            if (formData.id) {
                await update(formData.id, payload);
                toast({
                    title: 'Sucesso',
                    description: 'Ciclo atualizado.',
                });
            } else {
                await create(payload);
                toast({
                    title: 'Sucesso',
                    description: 'Nova safra iniciada.',
                });
            }

            await fetchSafras();
            resetForm();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao salvar safra.',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir safra?')) return;

        try {
            await remove(id);
            await fetchSafras();
            toast({
                title: 'Sucesso',
                description: 'Safra removida.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao excluir safra.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (item) => {
        const tanque = tanques.find((t) => t.id === item.tanque_id);

        setFormData({
            id: item.id,
            tanqueId: item.tanque_id || '',
            tanqueNome: tanque ? tanque.codigo : '',
            especie: item.especie || 'Tilápia',
            dataPovoamento: item.data_povoamento || '',
            qtdInicial: item.quantidade_inicial ?? '',
            pesoMedioInicial: item.peso_medio_inicial ?? '',
            previsaoSaida: item.previsao_saida || '',
            metaPesoFinal: item.meta_peso_final ?? '1000',
            tipoSistema: item.tipo_sistema || 'Intensivo',
            status: item.status || 'Ativa',
            dataAbate: item.data_abate || '',
            producaoTotal: item.producao_total ?? '',
            mortalidade: item.mortalidade ?? '',
            conversaoAlimentar: item.conversao_alimentar ?? '',
            receita: item.receita ?? '',
        });

        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredSafras = useMemo(() => {
        const ordered = [...safras].sort((a, b) => {
            const da = a.data_povoamento ? new Date(a.data_povoamento).getTime() : 0;
            const db = b.data_povoamento ? new Date(b.data_povoamento).getTime() : 0;
            return db - da;
        });

        return ordered.filter((item) => {
            const tanque = tanques.find((t) => t.id === item.tanque_id);
            const tanqueNome = tanque ? tanque.codigo : '';
            const term = searchTerm.toLowerCase();

            return (
                tanqueNome.toLowerCase().includes(term) ||
                (item.especie || '').toLowerCase().includes(term) ||
                (item.tipo_sistema || '').toLowerCase().includes(term) ||
                (item.status || '').toLowerCase().includes(term)
            );
        });
    }, [safras, tanques, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isEditing ? 'Editar Safra' : 'Nova Safra / Ciclo'}
                    </h2>

                    {isEditing && (
                        <Button variant="ghost" onClick={resetForm} size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        className="p-2 border rounded"
                        value={formData.tanqueId}
                        onChange={handleTanqueChange}
                        required
                        disabled={isEditing}
                    >
                        <option value="">Selecione o Tanque...</option>
                        {tanques.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.codigo} ({t.especie})
                            </option>
                        ))}
                    </select>

                    <input
                        className="p-2 border rounded"
                        placeholder="Espécie"
                        value={formData.especie}
                        onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
                    />

                    <select
                        className="p-2 border rounded"
                        value={formData.tipoSistema}
                        onChange={(e) => setFormData({ ...formData, tipoSistema: e.target.value })}
                    >
                        <option value="Intensivo">Intensivo</option>
                        <option value="Semi-intensivo">Semi-intensivo</option>
                        <option value="Extensivo">Extensivo</option>
                    </select>

                    <div>
                        <label className="text-xs text-slate-500 block">Data Povoamento</label>
                        <input
                            className="w-full p-2 border rounded"
                            type="date"
                            value={formData.dataPovoamento}
                            onChange={(e) => setFormData({ ...formData, dataPovoamento: e.target.value })}
                            required
                        />
                    </div>

                    <input
                        className="p-2 border rounded"
                        type="number"
                        placeholder="Qtd Inicial (peixes)"
                        value={formData.qtdInicial}
                        onChange={(e) => setFormData({ ...formData, qtdInicial: e.target.value })}
                        required
                    />

                    <input
                        className="p-2 border rounded"
                        type="number"
                        step="0.01"
                        placeholder="Peso Médio Inicial (g)"
                        value={formData.pesoMedioInicial}
                        onChange={(e) => setFormData({ ...formData, pesoMedioInicial: e.target.value })}
                    />

                    <div>
                        <label className="text-xs text-slate-500 block">Previsão Saída</label>
                        <input
                            className="w-full p-2 border rounded"
                            type="date"
                            value={formData.previsaoSaida}
                            onChange={(e) => setFormData({ ...formData, previsaoSaida: e.target.value })}
                        />
                    </div>

                    <input
                        className="p-2 border rounded"
                        type="number"
                        step="0.01"
                        placeholder="Meta Peso Final (g)"
                        value={formData.metaPesoFinal}
                        onChange={(e) => setFormData({ ...formData, metaPesoFinal: e.target.value })}
                    />

                    <select
                        className="p-2 border rounded"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="Ativa">Ativa</option>
                        <option value="Concluída">Concluída</option>
                        <option value="Cancelada">Cancelada</option>
                    </select>

                    {formData.status === 'Concluída' && (
                        <div className="md:col-span-3 bg-green-50 p-4 rounded-lg border border-green-200 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            <div className="md:col-span-3 font-bold text-green-800">
                                Encerramento da Safra
                            </div>

                            <input
                                className="p-2 border rounded"
                                type="date"
                                placeholder="Data Abate"
                                value={formData.dataAbate}
                                onChange={(e) => setFormData({ ...formData, dataAbate: e.target.value })}
                            />

                            <input
                                className="p-2 border rounded"
                                type="number"
                                step="0.01"
                                placeholder="Produção Total (kg)"
                                value={formData.producaoTotal}
                                onChange={(e) => setFormData({ ...formData, producaoTotal: e.target.value })}
                            />

                            <input
                                className="p-2 border rounded"
                                type="number"
                                placeholder="Mortalidade (%)"
                                value={formData.mortalidade}
                                onChange={(e) => setFormData({ ...formData, mortalidade: e.target.value })}
                            />

                            <input
                                className="p-2 border rounded"
                                type="number"
                                step="0.01"
                                placeholder="Conversão Alimentar (CA)"
                                value={formData.conversaoAlimentar}
                                onChange={(e) =>
                                    setFormData({ ...formData, conversaoAlimentar: e.target.value })
                                }
                            />

                            <input
                                className="p-2 border rounded"
                                type="number"
                                step="0.01"
                                placeholder="Receita Total (R$)"
                                value={formData.receita}
                                onChange={(e) => setFormData({ ...formData, receita: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="md:col-span-3 flex justify-end mt-2">
                        <Button type="submit" className="bg-[#1e3a8a] text-white">
                            <Save className="w-4 h-4 mr-2" />
                            {isEditing ? 'Atualizar Safra' : 'Iniciar Safra'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <h3 className="font-semibold text-slate-700">
                        Safras Registradas ({filteredSafras.length})
                    </h3>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                            placeholder="Buscar tanque, espécie, status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="p-4">Tanque</th>
                                <th className="p-4">Espécie</th>
                                <th className="p-4">Povoamento</th>
                                <th className="p-4">Qtd. Inicial</th>
                                <th className="p-4">Prev. Saída</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Produção (kg)</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredSafras.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500">
                                        Nenhuma safra encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filteredSafras.map((item) => {
                                    const tanque = tanques.find((t) => t.id === item.tanque_id);
                                    const tanqueNome = tanque ? tanque.codigo : 'Tanque não encontrado';

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="p-4 font-bold text-slate-700">{tanqueNome}</td>
                                            <td className="p-4">{item.especie}</td>
                                            <td className="p-4">
                                                {item.data_povoamento
                                                    ? new Date(item.data_povoamento).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="p-4">{item.quantidade_inicial}</td>
                                            <td className="p-4">
                                                {item.previsao_saida
                                                    ? new Date(item.previsao_saida).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Ativa'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : item.status === 'Concluída'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono">
                                                {item.producao_total ?? '-'}
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

export default SafrasTab;