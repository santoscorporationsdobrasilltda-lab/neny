import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Save, Scale, Edit, Search, X } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const BiometriaTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: biometrias,
        fetchAll: fetchBiometrias,
        create,
        update,
        remove,
    } = useSupabaseCrud('piscicultura40_biometrias');

    const {
        data: tanques,
        fetchAll: fetchTanques,
    } = useSupabaseCrud('piscicultura40_tanques');

    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const initialForm = {
        id: '',
        data: new Date().toISOString().split('T')[0],
        tanqueId: '',
        tanqueNome: '',
        amostras: '10',
        pesoMedio: '',
        ganhoPeso: '',
        ajusteRacao: '',
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (user) {
            fetchBiometrias();
            fetchTanques();
        }
    }, [user, fetchBiometrias, fetchTanques]);

    const resetForm = () => {
        setFormData({
            ...initialForm,
            data: new Date().toISOString().split('T')[0],
        });
        setIsEditing(false);
    };

    const getPreviousBiometria = (tanqueId, currentId = '') => {
        return [...biometrias]
            .filter((b) => b.tanque_id === tanqueId && b.id !== currentId)
            .sort((a, b) => {
                const da = a.data ? new Date(a.data).getTime() : 0;
                const db = b.data ? new Date(b.data).getTime() : 0;
                return db - da;
            })[0];
    };

    const calculateMetrics = (tanqueId, pesoMedio, currentId = '') => {
        const peso = parseFloat(pesoMedio || 0);
        if (!tanqueId || !peso) {
            return {
                ganhoPeso: '',
                ajusteRacao: '',
            };
        }

        const previous = getPreviousBiometria(tanqueId, currentId);

        if (!previous || previous.peso_medio == null) {
            return {
                ganhoPeso: '0',
                ajusteRacao: 'Primeira biometria',
            };
        }

        const ganho = peso - Number(previous.peso_medio);

        let ajuste = 'Manter';
        if (ganho > 0) ajuste = '+5%';
        if (ganho <= 0) ajuste = 'Reavaliar';

        return {
            ganhoPeso: ganho.toFixed(2),
            ajusteRacao: ajuste,
        };
    };

    const handleTanqueChange = (e) => {
        const id = e.target.value;
        const tanque = tanques.find((item) => item.id === id);

        const metrics = calculateMetrics(id, formData.pesoMedio, formData.id);

        setFormData((prev) => ({
            ...prev,
            tanqueId: id,
            tanqueNome: tanque ? tanque.codigo : '',
            ganhoPeso: metrics.ganhoPeso,
            ajusteRacao: metrics.ajusteRacao,
        }));
    };

    const handlePesoChange = (e) => {
        const value = e.target.value;
        const metrics = calculateMetrics(formData.tanqueId, value, formData.id);

        setFormData((prev) => ({
            ...prev,
            pesoMedio: value,
            ganhoPeso: metrics.ganhoPeso,
            ajusteRacao: metrics.ajusteRacao,
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

        if (!formData.tanqueId || !formData.pesoMedio) {
            toast({
                title: 'Erro',
                description: 'Tanque e peso médio são obrigatórios.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            tanque_id: formData.tanqueId,
            data: formData.data || null,
            amostras: formData.amostras ? Number(formData.amostras) : null,
            peso_medio: formData.pesoMedio ? Number(formData.pesoMedio) : null,
            ganho_peso: formData.ganhoPeso ? Number(formData.ganhoPeso) : 0,
            ajuste_racao: formData.ajusteRacao || null,
        };

        try {
            if (formData.id) {
                await update(formData.id, payload);
                toast({
                    title: 'Sucesso',
                    description: `Biometria atualizada. Ganho: ${payload.ganho_peso ?? 0} g`,
                });
            } else {
                await create(payload);
                toast({
                    title: 'Biometria registrada',
                    description: `Ganho: ${payload.ganho_peso ?? 0} g`,
                });
            }

            await fetchBiometrias();
            resetForm();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao salvar biometria.',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir registro?')) return;

        try {
            await remove(id);
            await fetchBiometrias();
            toast({
                title: 'Sucesso',
                description: 'Biometria excluída.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao excluir biometria.',
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
            amostras: item.amostras ?? '10',
            pesoMedio: item.peso_medio ?? '',
            ganhoPeso: item.ganho_peso ?? '',
            ajusteRacao: item.ajuste_racao || '',
        });

        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredBiometrias = useMemo(() => {
        const ordered = [...biometrias].sort((a, b) => {
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
                String(item.amostras ?? '').toLowerCase().includes(term) ||
                String(item.peso_medio ?? '').toLowerCase().includes(term) ||
                String(item.ajuste_racao ?? '').toLowerCase().includes(term)
            );
        });
    }, [biometrias, tanques, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-purple-600" />
                        {isEditing ? 'Editar Biometria' : 'Registro de Biometria'}
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

                    <input
                        className="p-2 border rounded"
                        type="number"
                        placeholder="Nº Amostras"
                        value={formData.amostras}
                        onChange={(e) => setFormData({ ...formData, amostras: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        type="number"
                        step="0.01"
                        placeholder="Peso Médio (g)"
                        value={formData.pesoMedio}
                        onChange={handlePesoChange}
                        required
                    />

                    <div className="p-2 border rounded bg-slate-50 text-slate-600 text-sm flex items-center">
                        Ganho: {formData.ganhoPeso || 0} g
                    </div>

                    <div className="p-2 border rounded bg-slate-50 text-slate-600 text-sm flex items-center">
                        Ajuste Ração: {formData.ajusteRacao || '-'}
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                        <Button type="submit" className="bg-[#1e3a8a] text-white w-full">
                            <Save className="w-4 h-4 mr-2" />
                            {isEditing ? 'Atualizar Biometria' : 'Salvar Biometria'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <h3 className="font-semibold text-slate-700">
                        Biometrias Registradas ({filteredBiometrias.length})
                    </h3>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                            placeholder="Buscar tanque, peso, ajuste..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                        <tr>
                            <th className="p-4">Data</th>
                            <th className="p-4">Tanque</th>
                            <th className="p-4">Amostras</th>
                            <th className="p-4">Peso Médio (g)</th>
                            <th className="p-4">Ganho (g)</th>
                            <th className="p-4">Ajuste Rec.</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {filteredBiometrias.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-slate-500">
                                    Nenhuma biometria registrada.
                                </td>
                            </tr>
                        ) : (
                            filteredBiometrias.map((item) => {
                                const tanque = tanques.find((t) => t.id === item.tanque_id);
                                const tanqueNome = tanque ? tanque.codigo : 'Tanque não encontrado';

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="p-4 text-slate-500">
                                            {item.data ? new Date(item.data).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="p-4 font-bold text-slate-700">{tanqueNome}</td>
                                        <td className="p-4">{item.amostras}</td>
                                        <td className="p-4 font-mono text-blue-600 font-bold">{item.peso_medio}</td>
                                        <td className="p-4 text-green-600">
                                            {Number(item.ganho_peso || 0) > 0 ? '+' : ''}
                                            {item.ganho_peso ?? 0}
                                        </td>
                                        <td className="p-4">{item.ajuste_racao || '-'}</td>
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
    );
};

export default BiometriaTab;