import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PdfGenerator } from '@/utils/PdfGenerator';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const formatCurrency = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
};

const DRE = () => {
  const { user } = useAuth();

  const {
    data: entries,
    loading,
    fetchAll,
  } = useSupabaseCrud('gestao_saldos_financas');

  const [period, setPeriod] = useState({ start: '', end: '' });

  useEffect(() => {
    if (user) {
      fetchAll(1, 5000);
    }
  }, [user, fetchAll]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (!entry.date) return false;

      const entryDate = new Date(`${entry.date}T12:00:00`).getTime();

      if (period.start) {
        const start = new Date(`${period.start}T00:00:00`).getTime();
        if (entryDate < start) return false;
      }

      if (period.end) {
        const end = new Date(`${period.end}T23:59:59`).getTime();
        if (entryDate > end) return false;
      }

      return true;
    });
  }, [entries, period]);

  const data = useMemo(() => {
    const revenue = filteredEntries
      .filter((e) => e.type === 'entrada')
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const costs = filteredEntries
      .filter(
        (e) =>
          e.type === 'saida' &&
          (e.description || '').toLowerCase().includes('custo')
      )
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const expenses = filteredEntries
      .filter(
        (e) =>
          e.type === 'saida' &&
          !(e.description || '').toLowerCase().includes('custo')
      )
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    return { revenue, costs, expenses };
  }, [filteredEntries]);

  const grossProfit = data.revenue - data.costs;
  const netProfit = grossProfit - data.expenses;

  const exportPDF = () => {
    PdfGenerator.generateDRE(
      {
        revenue: data.revenue,
        costs: data.costs,
        expenses: data.expenses,
        netProfit,
      },
      `${period.start || 'Início'} até ${period.end || 'Hoje'}`
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">D.R.E.</h1>
        <Button onClick={exportPDF} className="bg-indigo-600 hover:bg-indigo-700">
          <FileDown className="w-4 h-4 mr-2" /> Exportar PDF
        </Button>
      </div>

      <div className="flex gap-4 items-center bg-white/5 p-4 rounded-lg">
        <Calendar className="text-slate-400" />
        <input
          type="date"
          className="bg-transparent text-white border-b border-white/20 focus:outline-none"
          value={period.start}
          onChange={(e) => setPeriod({ ...period, start: e.target.value })}
        />
        <span className="text-slate-400">até</span>
        <input
          type="date"
          className="bg-transparent text-white border-b border-white/20 focus:outline-none"
          value={period.end}
          onChange={(e) => setPeriod({ ...period, end: e.target.value })}
        />
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 max-w-3xl mx-auto">
        {loading ? (
          <div className="text-center text-slate-300 py-8">Carregando dados financeiros...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-green-400 text-lg">
              <span>Receita Bruta de Vendas</span>
              <span>{formatCurrency(data.revenue)}</span>
            </div>

            <div className="flex justify-between items-center text-red-300">
              <span>(-) Custos das Vendas/Serviços</span>
              <span>{formatCurrency(data.costs)}</span>
            </div>

            <div className="h-px bg-white/20 my-2"></div>

            <div className="flex justify-between items-center text-white font-bold text-xl">
              <span>(=) Lucro Bruto</span>
              <span>{formatCurrency(grossProfit)}</span>
            </div>

            <div className="flex justify-between items-center text-red-300 mt-4">
              <span>(-) Despesas Operacionais</span>
              <span>{formatCurrency(data.expenses)}</span>
            </div>

            <div className="h-px bg-white/20 my-2"></div>

            <div
              className={`flex justify-between items-center font-bold text-2xl p-4 rounded-lg ${netProfit >= 0
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
                }`}
            >
              <span>(=) Resultado Líquido</span>
              <span>{formatCurrency(netProfit)}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DRE;