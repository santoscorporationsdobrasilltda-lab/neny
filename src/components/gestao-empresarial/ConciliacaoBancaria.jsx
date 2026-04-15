import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ConciliacaoBancaria = () => {
    const { toast } = useToast();
    // Mock Data simulating bank import
    const [bankTransactions, setBankTransactions] = useState([
        { id: 1, date: '2025-01-20', description: 'PIX RECEBIDO JOAO', amount: 150.00, status: 'pendente' },
        { id: 2, date: '2025-01-21', description: 'PGTO FORNECEDOR XYZ', amount: -500.00, status: 'pendente' },
        { id: 3, date: '2025-01-22', description: 'TARIFA BANCARIA', amount: -15.90, status: 'pendente' },
    ]);

    const conciliate = (id) => {
        setBankTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'conciliado' } : t));
        toast({ title: '✅ Transação Conciliada' });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Conciliação Bancária</h1>
            <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                <h2 className="text-xl text-white mb-4">Extrato Importado</h2>
                <div className="space-y-2">
                    {bankTransactions.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
                            <div>
                                <p className="text-white font-medium">{t.description}</p>
                                <p className="text-xs text-slate-400">{t.date}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={t.amount > 0 ? 'text-green-400' : 'text-red-400'}>
                                    R$ {t.amount.toFixed(2)}
                                </span>
                                {t.status === 'pendente' ? (
                                    <Button size="sm" onClick={() => conciliate(t.id)} variant="outline" className="text-green-400 border-green-500/50">
                                        Conciliar
                                    </Button>
                                ) : (
                                    <span className="flex items-center text-green-500 text-sm">
                                        <CheckCircle2 className="w-4 h-4 mr-1" /> Conciliado
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ConciliacaoBancaria;