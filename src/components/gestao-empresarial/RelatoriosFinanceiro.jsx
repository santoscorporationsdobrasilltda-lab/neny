import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PdfGenerator } from '@/utils/PdfGenerator';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const RelatoriosFinanceiro = () => {
    const [filters, setFilters] = useState({ startDate: '', endDate: '', category: 'all' });
    
    // Mock Data
    const data = [
        { id: 1, date: '2024-01-15', description: 'Venda Consultoria', category: 'Receita', type: 'receita', amount: 5000 },
        { id: 2, date: '2024-01-16', description: 'Pagamento Aluguel', category: 'Despesa Fixa', type: 'despesa', amount: 2000 },
        { id: 3, date: '2024-01-18', description: 'Venda Licença', category: 'Receita', type: 'receita', amount: 1500 },
    ];

    const handleExport = () => {
        PdfGenerator.generateRelatorioFinanceiro(data, filters);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Relatório Financeiro</h1>
                <Button onClick={handleExport} className="btn-primary"><Download className="w-4 h-4 mr-2"/> Exportar PDF</Button>
            </div>

            <div className="glass-effect p-6 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="date" className="input-field" onChange={e => setFilters({...filters, startDate: e.target.value})}/>
                    <input type="date" className="input-field" onChange={e => setFilters({...filters, endDate: e.target.value})}/>
                    <select className="input-field" onChange={e => setFilters({...filters, category: e.target.value})}>
                        <option value="all">Todas Categorias</option>
                        <option value="Receita">Receita</option>
                        <option value="Despesa">Despesa</option>
                    </select>
                    <Button variant="outline" className="btn-secondary h-10 mt-1">Filtrar</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-effect p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Evolução Financeira</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                             <XAxis dataKey="date" stroke="#94a3b8"/>
                             <YAxis stroke="#94a3b8"/>
                             <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px'}}/>
                             <Legend />
                             <Bar dataKey="amount" fill="#6366f1" name="Valor" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="glass-effect p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Resumo do Período</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                            <p className="text-sm text-green-400">Total Receitas</p>
                            <p className="text-2xl font-bold text-green-300">R$ 6.500,00</p>
                        </div>
                         <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                            <p className="text-sm text-red-400">Total Despesas</p>
                            <p className="text-2xl font-bold text-red-300">R$ 2.000,00</p>
                        </div>
                         <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <p className="text-sm text-blue-400">Saldo Líquido</p>
                            <p className="text-2xl font-bold text-blue-300">R$ 4.500,00</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RelatoriosFinanceiro;