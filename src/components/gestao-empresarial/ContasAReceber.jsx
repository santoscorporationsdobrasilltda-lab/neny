import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Trash2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const initialBill = {
    description: '',
    amount: '',
    dueDate: '',
    status: 'aberto',
};

const formatCurrency = (value) => {
    const number = Number(value || 0);
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(number);
};

const ContasAReceber = () => {
    const [newBill, setNewBill] = useState(initialBill);
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: bills,
        loading,
        fetchAll,
        create,
        update,
        remove,
    } = useSupabaseCrud('gestao_contas_receber');

    useEffect(() => {
        if (user) {
            fetchAll(1, 1000);
        }
    }, [user, fetchAll]);

    const orderedBills = useMemo(() => {
        return [...bills].sort((a, b) => {
            const da = a.due_date ? new Date(`${a.due_date}T12:00:00`).getTime() : 0;
            const db = b.due_date ? new Date(`${b.due_date}T12:00:00`).getTime() : 0;
            return da - db;
        });
    }, [bills]);

    const totalAberto = useMemo(() => {
        return bills
            .filter((bill) => bill.status === 'aberto')
            .reduce((acc, bill) => acc + Number(bill.amount || 0), 0);
    }, [bills]);

    const totalRecebido = useMemo(() => {
        return bills
            .filter((bill) => bill.status === 'recebido')
            .reduce((acc, bill) => acc + Number(bill.amount || 0), 0);
    }, [bills]);

    const addBill = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!newBill.description.trim() || !newBill.amount || !newBill.dueDate) {
            toast({
                title: 'Erro',
                description: 'Preencha descrição, valor e vencimento.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            description: newBill.description.trim(),
            amount: Number(newBill.amount || 0),
            due_date: newBill.dueDate,
            status: 'aberto',
            updated_at: new Date().toISOString(),
        };

        const saved = await create(payload);

        if (saved) {
            await fetchAll(1, 1000);
            setNewBill(initialBill);
            toast({ title: '✅ Título adicionado!' });
        }
    };

    const markAsReceived = async (id) => {
        const saved = await update(id, {
            status: 'recebido',
            received_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        if (saved) {
            await fetchAll(1, 1000);
            toast({ title: '💰 Valor recebido!' });
        }
    };

    const deleteBill = async (id) => {
        const confirmed = window.confirm('Deseja realmente excluir este título?');
        if (!confirmed) return;

        const success = await remove(id);
        if (success) {
            await fetchAll(1, 1000);
            toast({ title: '🗑️ Título removido.' });
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <h1 className="text-3xl font-bold text-white">Contas a Receber</h1>

                <div className="flex gap-3 flex-wrap">
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl px-4 py-3">
                        <p className="text-xs text-blue-200">Em aberto</p>
                        <p className="text-lg font-bold text-white">{formatCurrency(totalAberto)}</p>
                    </div>

                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-3">
                        <p className="text-xs text-green-200">Recebido</p>
                        <p className="text-lg font-bold text-white">{formatCurrency(totalRecebido)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                <form onSubmit={addBill} className="flex flex-col md:flex-row gap-4">
                    <input
                        placeholder="Cliente / Descrição"
                        required
                        className="flex-1 p-2 rounded bg-white/5 text-white border border-white/10"
                        value={newBill.description}
                        onChange={(e) => setNewBill({ ...newBill, description: e.target.value })}
                    />

                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Valor"
                        required
                        className="w-full md:w-32 p-2 rounded bg-white/5 text-white border border-white/10"
                        value={newBill.amount}
                        onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                    />

                    <input
                        type="date"
                        required
                        className="w-full md:w-40 p-2 rounded bg-white/5 text-white border border-white/10"
                        value={newBill.dueDate}
                        onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                    />

                    <Button type="submit" className="bg-blue-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                    </Button>
                </form>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="bg-white/5 p-6 rounded-lg border border-white/10 text-slate-300 text-center">
                        Carregando títulos...
                    </div>
                ) : orderedBills.length === 0 ? (
                    <div className="bg-white/5 p-6 rounded-lg border border-white/10 text-slate-300 text-center">
                        Nenhum título cadastrado.
                    </div>
                ) : (
                    orderedBills.map((bill) => (
                        <div
                            key={bill.id}
                            className="bg-white/5 p-4 rounded-lg flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 border border-white/10"
                        >
                            <div className="flex items-start gap-3">
                                <Wallet className="w-5 h-5 text-emerald-400 mt-1" />
                                <div>
                                    <h3 className="text-white font-medium">{bill.description}</h3>
                                    <p className="text-sm text-slate-400">
                                        Vencimento:{' '}
                                        {bill.due_date
                                            ? new Date(`${bill.due_date}T12:00:00`).toLocaleDateString('pt-BR')
                                            : '-'}
                                    </p>
                                    {bill.received_at && (
                                        <p className="text-xs text-green-300 mt-1">
                                            Recebido em {new Date(bill.received_at).toLocaleString('pt-BR')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 flex-wrap">
                                <span className="text-white font-bold">{formatCurrency(bill.amount)}</span>

                                <span
                                    className={`px-2 py-1 rounded text-xs ${bill.status === 'recebido'
                                            ? 'bg-green-500/20 text-green-300'
                                            : bill.status === 'cancelado'
                                                ? 'bg-red-500/20 text-red-300'
                                                : 'bg-blue-500/20 text-blue-300'
                                        }`}
                                >
                                    {String(bill.status || 'aberto').toUpperCase()}
                                </span>

                                {bill.status !== 'recebido' && (
                                    <Button
                                        size="sm"
                                        onClick={() => markAsReceived(bill.id)}
                                        className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                )}

                                <Button
                                    size="sm"
                                    onClick={() => deleteBill(bill.id)}
                                    variant="destructive"
                                    className="h-8 w-8 p-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

export default ContasAReceber;