import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Plus, ArrowUpRight, ArrowDownLeft, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import FazendaFinanceiroModal from '@/components/fazenda/FazendaFinanceiroModal';

const FazendaFinanceiro = () => {
    const { toast } = useToast();
    const [transactions, setTransactions] = useLocalStorage('fazenda_transactions', [
      { id: uuidv4(), type: 'Receita', category: 'Contas a Receber', description: 'Venda de 50 sacas de soja', amount: 7500, date: '2025-09-15' },
      { id: uuidv4(), type: 'Despesa', category: 'Custos Variáveis', description: 'Compra de fertilizantes', amount: 1200, date: '2025-09-10' },
      { id: uuidv4(), type: 'Despesa', category: 'Custos Fixos', description: 'Manutenção de trator', amount: 800, date: '2025-09-05' },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const handleOpenModal = (transaction = null) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleSaveTransaction = (transactionData) => {
        if (editingTransaction) {
            setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...transactionData } : t));
            toast({ title: "✅ Lançamento Atualizado", description: "A movimentação financeira foi atualizada com sucesso." });
        } else {
            setTransactions(prev => [...prev, { id: uuidv4(), ...transactionData }]);
            toast({ title: "✅ Lançamento Criado", description: "A nova movimentação financeira foi adicionada." });
        }
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleDeleteTransaction = (transactionId) => {
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        toast({ title: "🗑️ Lançamento Excluído", description: "A movimentação financeira foi removida." });
    };

    const totalReceitas = transactions.filter(t => t.type === 'Receita').reduce((acc, t) => acc + t.amount, 0);
    const totalDespesas = transactions.filter(t => t.type === 'Despesa').reduce((acc, t) => acc + t.amount, 0);
    const saldo = totalReceitas - totalDespesas;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Financeiro da Fazenda</h2>
                <Button onClick={() => handleOpenModal()} className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="metric-card">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Receitas</p>
                            <p className="text-2xl font-bold text-green-600">R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"><ArrowUpRight className="text-white" /></div>
                    </div>
                </div>
                 <div className="metric-card">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Despesas</p>
                            <p className="text-2xl font-bold text-red-600">R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center"><ArrowDownLeft className="text-white" /></div>
                    </div>
                </div>
                 <div className="metric-card">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Saldo Atual</p>
                            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                         <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><TrendingUp className="text-white" /></div>
                    </div>
                </div>
            </div>

            <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Últimos Lançamentos</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="th-cell">Data</th>
                                <th className="th-cell">Descrição</th>
                                <th className="th-cell">Categoria</th>
                                <th className="th-cell text-right">Valor</th>
                                <th className="th-cell">Tipo</th>
                                <th className="th-cell">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => (
                                <tr key={t.id} className="table-row">
                                    <td className="td-cell text-slate-600">{new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                    <td className="td-cell font-medium text-slate-800">{t.description}</td>
                                    <td className="td-cell text-slate-600">{t.category}</td>
                                    <td className={`td-cell text-right font-semibold ${t.type === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'Despesa' ? '-' : ''} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="td-cell">
                                        <span className={`status-badge ${t.type === 'Receita' ? 'status-success' : 'status-danger'}`}>{t.type}</span>
                                    </td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(t)}><Edit className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(t.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && <FazendaFinanceiroModal transaction={editingTransaction} onSave={handleSaveTransaction} onClose={() => setIsModalOpen(false)} />}

            <p className="text-center text-sm text-slate-500 pt-4">
              Para uma visão mais detalhada e cruzamento de dados, acesse a aba de <span className="font-bold">Conciliação Bancária</span>.
            </p>
        </motion.div>
    );
};

export default FazendaFinanceiro;