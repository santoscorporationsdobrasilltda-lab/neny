import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const initialForm = {
    id: '',
    date: '',
    description: '',
    costCenter: '',
    type: 'entrada',
    amount: '',
    account: '',
};

const formatCurrency = (value) => {
    const number = Number(value || 0);
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(number);
};

const SaldosFinancas = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState(initialForm);
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: entries,
        loading,
        fetchAll,
        create,
        update,
        remove,
    } = useSupabaseCrud('gestao_saldos_financas');

    useEffect(() => {
        if (user) {
            fetchAll(1, 1000);
        }
    }, [user, fetchAll]);

    const filteredEntries = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...entries]
            .filter((entry) => {
                return (
                    (entry.description || '').toLowerCase().includes(term) ||
                    (entry.cost_center || '').toLowerCase().includes(term) ||
                    (entry.account || '').toLowerCase().includes(term) ||
                    (entry.type || '').toLowerCase().includes(term)
                );
            })
            .sort((a, b) => {
                const da = a.date ? new Date(`${a.date}T12:00:00`).getTime() : 0;
                const db = b.date ? new Date(`${b.date}T12:00:00`).getTime() : 0;
                return db - da;
            });
    }, [entries, searchTerm]);

    const totalEntradas = useMemo(() => {
        return entries
            .filter((e) => e.type === 'entrada')
            .reduce((acc, e) => acc + Number(e.amount || 0), 0);
    }, [entries]);

    const totalSaidas = useMemo(() => {
        return entries
            .filter((e) => e.type === 'saida')
            .reduce((acc, e) => acc + Number(e.amount || 0), 0);
    }, [entries]);

    const saldo = totalEntradas - totalSaidas;

    const resetForm = () => {
        setFormData(initialForm);
        setIsFormOpen(false);
    };

    const handleOpenNew = () => {
        setFormData(initialForm);
        setIsFormOpen(true);
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

        if (!formData.date || !formData.description || !formData.costCenter || formData.amount === '') {
            toast({
                title: 'Erro',
                description: 'Preencha os campos obrigatórios.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            date: formData.date,
            description: formData.description.trim(),
            cost_center: formData.costCenter.trim(),
            type: formData.type || 'entrada',
            amount: Number(formData.amount || 0),
            account: formData.account?.trim() || null,
            updated_at: new Date().toISOString(),
        };

        const saved = formData.id
            ? await update(formData.id, payload)
            : await create(payload);

        if (saved) {
            await fetchAll(1, 1000);
            toast({
                title: formData.id ? '✅ Lançamento atualizado!' : '✅ Lançamento cadastrado!',
            });
            resetForm();
        }
    };

    const handleEdit = (entry) => {
        setFormData({
            id: entry.id,
            date: entry.date || '',
            description: entry.description || '',
            costCenter: entry.cost_center || '',
            type: entry.type || 'entrada',
            amount: entry.amount ?? '',
            account: entry.account || '',
        });
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Deseja realmente excluir este lançamento?');
        if (!confirmed) return;

        const success = await remove(id);
        if (success) {
            await fetchAll(1, 1000);
            toast({ title: '🗑️ Lançamento excluído!' });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Saldos e Finanças</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 rounded-xl p-6">
                    <h3 className="text-green-300 text-sm font-medium mb-2">Total Entradas</h3>
                    <p className="text-3xl font-bold text-white">{formatCurrency(totalEntradas)}</p>
                </div>

                <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-xl p-6">
                    <h3 className="text-red-300 text-sm font-medium mb-2">Total Saídas</h3>
                    <p className="text-3xl font-bold text-white">{formatCurrency(totalSaidas)}</p>
                </div>

                <div className={`${saldo >= 0 ? 'bg-blue-500/20 border-blue-500/30' : 'bg-orange-500/20 border-orange-500/30'} backdrop-blur-md border rounded-xl p-6`}>
                    <h3 className={`${saldo >= 0 ? 'text-blue-300' : 'text-orange-300'} text-sm font-medium mb-2`}>
                        Saldo
                    </h3>
                    <p className="text-3xl font-bold text-white">{formatCurrency(saldo)}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar lançamentos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <Button
                    onClick={handleOpenNew}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Lançamento
                </Button>
            </div>

            {isFormOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Data</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="entrada">Entrada</option>
                                    <option value="saida">Saída</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Centro de Custo</label>
                                <input
                                    type="text"
                                    value={formData.costCenter}
                                    onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Conta</label>
                                <input
                                    type="text"
                                    value={formData.account}
                                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Valor (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button type="button" variant="outline" onClick={resetForm} className="border-white/20 text-white">
                                <X className="w-4 h-4 mr-2" />
                                Cancelar
                            </Button>

                            <Button type="submit" className="bg-gradient-to-r from-green-500 to-green-600">
                                <Save className="w-4 h-4 mr-2" />
                                {formData.id ? 'Atualizar' : 'Salvar'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Descrição</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Centro de Custo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Conta</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">Valor</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase">Ações</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/10">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                                        Carregando lançamentos...
                                    </td>
                                </tr>
                            ) : filteredEntries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4 text-sm text-white">
                                        {entry.date
                                            ? new Date(`${entry.date}T12:00:00`).toLocaleDateString('pt-BR')
                                            : '-'}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-white">{entry.description}</td>

                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${entry.type === 'entrada'
                                                    ? 'bg-green-500/20 text-green-300'
                                                    : 'bg-red-500/20 text-red-300'
                                                }`}
                                        >
                                            {entry.type === 'entrada' ? 'Entrada' : 'Saída'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-white">{entry.cost_center}</td>

                                    <td className="px-6 py-4 text-sm text-white">{entry.account || '-'}</td>

                                    <td className="px-6 py-4 text-sm text-right text-white font-semibold">
                                        {formatCurrency(entry.amount)}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(entry)}
                                                className="border-white/20 text-white"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDelete(entry.id)}
                                                className="border-red-500/50 text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredEntries.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <p>Nenhum lançamento encontrado</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SaldosFinancas;