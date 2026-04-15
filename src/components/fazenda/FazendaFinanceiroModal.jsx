import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

const CATEGORIES = {
    Receita: ['Contas a Receber', 'Venda de Ativo'],
    Despesa: ['Custos Fixos', 'Custos Variáveis', 'Contas a Pagar', 'Empréstimos Bancários', 'Investimento'],
};

const FazendaFinanceiroModal = ({ transaction, onSave, onClose }) => {
    const [type, setType] = useState(transaction?.type || 'Despesa');
    const [category, setCategory] = useState(transaction?.category || 'Custos Fixos');
    const [description, setDescription] = useState(transaction?.description || '');
    const [amount, setAmount] = useState(transaction?.amount || '');
    const [date, setDate] = useState(transaction?.date || new Date().toISOString().slice(0, 10));

    useEffect(() => {
        if (!CATEGORIES[type].includes(category)) {
            setCategory(CATEGORIES[type][0]);
        }
    }, [type, category]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            type,
            category,
            description,
            amount: parseFloat(amount),
            date,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="glass-effect rounded-2xl p-8 w-full max-w-lg" 
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold gradient-text mb-6">{transaction ? 'Editar' : 'Novo'} Lançamento Financeiro</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="input-field">
                                <option value="Receita">Receita</option>
                                <option value="Despesa">Despesa</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
                                {CATEGORIES[type].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="input-field" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Valor (R$)</label>
                            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Data</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" required />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" onClick={onClose} variant="outline" className="btn-secondary">Cancelar</Button>
                        <Button type="submit" className="btn-primary"><Save className="w-4 h-4 mr-2" />Salvar</Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default FazendaFinanceiroModal;