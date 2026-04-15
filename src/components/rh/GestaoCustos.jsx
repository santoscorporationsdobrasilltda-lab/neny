import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Wallet,
  BadgeDollarSign,
  Receipt,
  Search,
  Users,
  Briefcase,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const cardClass = 'bg-white rounded-2xl border border-slate-200 shadow-sm p-5';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));

const formatCompetencia = (mes, ano) => `${String(mes).padStart(2, '0')}/${ano}`;

const StatCard = ({ title, value, subtitle, icon: Icon, tone = 'blue' }) => {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
  };

  return (
    <div className={`${cardClass} flex items-start justify-between gap-4`}>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
        <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${toneMap[tone]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

const GestaoCustos = () => {
  const { user } = useAuth();
  const { data: funcionarios, fetchAll: fetchFuncionarios, loading: loadingFuncionarios } = useSupabaseCrud('rh_funcionarios');
  const { data: folhas, fetchAll: fetchFolhas, loading: loadingFolhas } = useSupabaseCrud('rh_folha_pagamento');

  const [search, setSearch] = useState('');
  const [competencia, setCompetencia] = useState('todas');

  useEffect(() => {
    if (!user) return;
    fetchFuncionarios(1, 1000);
    fetchFolhas(1, 1000);
  }, [user, fetchFuncionarios, fetchFolhas]);

  const loading = loadingFuncionarios || loadingFolhas;

  const competencias = useMemo(() => {
    const uniques = Array.from(
      new Set(folhas.map((item) => `${item.mes}-${item.ano}`))
    )
      .map((key) => {
        const [mes, ano] = key.split('-');
        return {
          key,
          mes: Number(mes),
          ano: Number(ano),
          label: formatCompetencia(mes, ano),
        };
      })
      .sort((a, b) => (b.ano - a.ano) || (b.mes - a.mes));

    return uniques;
  }, [folhas]);

  const folhasFiltradas = useMemo(() => {
    let dataset = [...folhas];

    if (competencia !== 'todas') {
      const [mes, ano] = competencia.split('-');
      dataset = dataset.filter((item) => Number(item.mes) === Number(mes) && Number(item.ano) === Number(ano));
    }

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      dataset = dataset.filter((item) => {
        const funcionario = funcionarios.find((f) => f.id === item.funcionario_id);
        return (
          (funcionario?.nome || '').toLowerCase().includes(term) ||
          (funcionario?.cargo || '').toLowerCase().includes(term) ||
          (item.status || '').toLowerCase().includes(term)
        );
      });
    }

    return dataset;
  }, [folhas, funcionarios, competencia, search]);

  const resumo = useMemo(() => {
    const totalSalarioBase = folhasFiltradas.reduce((acc, item) => acc + Number(item.salario_base || 0), 0);
    const totalProventos = folhasFiltradas.reduce((acc, item) => acc + Number(item.proventos || 0), 0);
    const totalDescontos = folhasFiltradas.reduce((acc, item) => acc + Number(item.descontos || 0), 0);
    const totalLiquido = folhasFiltradas.reduce((acc, item) => acc + Number(item.liquido || 0), 0);
    const totalInss = folhasFiltradas.reduce((acc, item) => acc + Number(item.inss || 0), 0);
    const totalIrrf = folhasFiltradas.reduce((acc, item) => acc + Number(item.irrf || 0), 0);
    const totalFgts = folhasFiltradas.reduce((acc, item) => acc + Number(item.fgts || 0), 0);

    return {
      totalSalarioBase,
      totalProventos,
      totalDescontos,
      totalLiquido,
      totalInss,
      totalIrrf,
      totalFgts,
    };
  }, [folhasFiltradas]);

  const custoPorCargo = useMemo(() => {
    const map = new Map();
    folhasFiltradas.forEach((item) => {
      const funcionario = funcionarios.find((f) => f.id === item.funcionario_id);
      const cargo = funcionario?.cargo || 'Não informado';
      map.set(cargo, (map.get(cargo) || 0) + Number(item.liquido || 0));
    });

    return [...map.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [folhasFiltradas, funcionarios]);

  const custoPorFuncionario = useMemo(() => {
    const map = new Map();
    folhasFiltradas.forEach((item) => {
      const funcionario = funcionarios.find((f) => f.id === item.funcionario_id);
      const nome = funcionario?.nome || 'Colaborador';
      const acumulado = map.get(nome) || { nome, cargo: funcionario?.cargo || '-', total: 0, base: 0, proventos: 0, descontos: 0 };
      acumulado.total += Number(item.liquido || 0);
      acumulado.base += Number(item.salario_base || 0);
      acumulado.proventos += Number(item.proventos || 0);
      acumulado.descontos += Number(item.descontos || 0);
      map.set(nome, acumulado);
    });

    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [folhasFiltradas, funcionarios]);

  const custoPorCompetencia = useMemo(() => {
    const map = new Map();
    folhas.forEach((item) => {
      const key = formatCompetencia(item.mes, item.ano);
      map.set(key, (map.get(key) || 0) + Number(item.liquido || 0));
    });

    return [...map.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => {
        const [am, ay] = a.name.split('/').map(Number);
        const [bm, by] = b.name.split('/').map(Number);
        return by - ay || bm - am;
      })
      .slice(0, 8)
      .reverse();
  }, [folhas]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gestão de Custos de Pessoal</h1>
        <p className="text-slate-500 mt-1">Consolidação real da folha, encargos e custo por colaborador/cargo.</p>
      </div>

      <div className={`${cardClass} flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-2">Buscar colaborador/cargo</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, cargo ou status"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-3 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-2">Competência</label>
            <select
              value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="todas">Todas</option>
              {competencias.map((item) => (
                <option key={item.key} value={item.key}>{item.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-sm text-slate-500">
          <span className="font-medium text-slate-700">{folhasFiltradas.length}</span> registros de folha no filtro atual
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Folha líquida" value={formatCurrency(resumo.totalLiquido)} subtitle="Valor líquido total" icon={DollarSign} tone="green" />
        <StatCard title="Salário base" value={formatCurrency(resumo.totalSalarioBase)} subtitle="Base salarial acumulada" icon={Wallet} tone="blue" />
        <StatCard title="Proventos" value={formatCurrency(resumo.totalProventos)} subtitle="Adicionais e extras" icon={BadgeDollarSign} tone="amber" />
        <StatCard title="Descontos" value={formatCurrency(resumo.totalDescontos)} subtitle={`INSS ${formatCurrency(resumo.totalInss)} • IRRF ${formatCurrency(resumo.totalIrrf)}`} icon={Receipt} tone="violet" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-slate-400" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Custo por cargo</h3>
              <p className="text-sm text-slate-500">Somatório líquido por função.</p>
            </div>
          </div>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-slate-500">Carregando custos...</div>
          ) : custoPorCargo.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-slate-500">Sem registros de folha para exibir.</div>
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={custoPorCargo} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `R$${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Custo líquido']} />
                  <Bar dataKey="total" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Evolução por competência</h3>
              <p className="text-sm text-slate-500">Últimas competências registradas.</p>
            </div>
          </div>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-slate-500">Carregando evolução...</div>
          ) : custoPorCompetencia.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-slate-500">Sem competências registradas.</div>
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={custoPorCompetencia} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `R$${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Folha líquida']} />
                  <Bar dataKey="total" fill="#16a34a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slate-400" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Detalhamento por colaborador</h3>
            <p className="text-sm text-slate-500">Custos individuais no filtro selecionado.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-500">Carregando detalhamento...</div>
        ) : custoPorFuncionario.length === 0 ? (
          <div className="py-10 text-center text-slate-500">Nenhum registro encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Colaborador</th>
                  <th className="py-3 pr-4 font-semibold">Cargo</th>
                  <th className="py-3 pr-4 font-semibold">Salário base</th>
                  <th className="py-3 pr-4 font-semibold">Proventos</th>
                  <th className="py-3 pr-4 font-semibold">Descontos</th>
                  <th className="py-3 pr-0 font-semibold">Líquido</th>
                </tr>
              </thead>
              <tbody>
                {custoPorFuncionario.map((item) => (
                  <tr key={item.nome} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-800">{item.nome}</td>
                    <td className="py-3 pr-4 text-slate-600">{item.cargo}</td>
                    <td className="py-3 pr-4 text-slate-600">{formatCurrency(item.base)}</td>
                    <td className="py-3 pr-4 text-slate-600">{formatCurrency(item.proventos)}</td>
                    <td className="py-3 pr-4 text-slate-600">{formatCurrency(item.descontos)}</td>
                    <td className="py-3 pr-0 font-semibold text-slate-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GestaoCustos;
