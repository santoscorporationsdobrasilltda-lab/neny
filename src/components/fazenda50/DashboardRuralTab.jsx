import React, { useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  ShieldCheck,
  Sprout,
  Droplets,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useFazendaContext } from './FazendaContext';

const StatCard = ({ title, value, tone = 'slate', subtitle, icon }) => {
  const tones = {
    slate: 'text-slate-800', red: 'text-red-600', amber: 'text-amber-600', green: 'text-green-600', blue: 'text-blue-600', emerald: 'text-emerald-600', violet: 'text-violet-600',
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-500">{title}</div>
          <div className={`text-2xl font-bold mt-1 ${tones[tone] || tones.slate}`}>{value}</div>
          {subtitle ? <div className="text-xs text-slate-500 mt-1">{subtitle}</div> : null}
        </div>
        <div className="text-slate-400">{icon}</div>
      </div>
    </div>
  );
};

const normalizeDate = (value) => {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

const getComplianceStatus = (item) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDate = normalizeDate(item.proxima_data);
  if (!nextDate) return 'sem_agendamento';
  const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return 'vencido';
  if (diffDays <= 7) return 'proximos_7';
  if (diffDays <= 30) return 'monitorar_30';
  return 'em_dia';
};

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
const getActivityKey = (item) => item.centro_custo || item.categoria || 'Geral';

const DashboardRuralTab = () => {
  const { user } = useAuth();
  const { selectedFarm, matchesSelectedFarm } = useFazendaContext();
  const { data: rawBovinos, fetchAll: fetchBovinos } = useSupabaseCrud('fazenda50_bovinos');
  const { data: rawSanidade, fetchAll: fetchSanidade } = useSupabaseCrud('fazenda50_sanidade');
  const { data: rawLavouras, fetchAll: fetchLavouras } = useSupabaseCrud('fazenda50_lavouras');
  const { data: rawDefensivos, fetchAll: fetchDefensivos } = useSupabaseCrud('fazenda50_defensivos');
  const { data: rawFinanceiro, fetchAll: fetchFinanceiro } = useSupabaseCrud('fazenda50_financeiro');

  useEffect(() => {
    if (user) {
      fetchBovinos(1, 1000);
      fetchSanidade(1, 2000);
      fetchLavouras(1, 1000);
      fetchDefensivos(1, 2000);
      fetchFinanceiro(1, 2000);
    }
  }, [user, fetchBovinos, fetchSanidade, fetchLavouras, fetchDefensivos, fetchFinanceiro]);

  const bovinos = useMemo(() => rawBovinos.filter((item) => matchesSelectedFarm(item)), [rawBovinos, matchesSelectedFarm]);
  const bovinoMap = useMemo(() => new Map(rawBovinos.map((item) => [item.id, item])), [rawBovinos]);
  const lavouraMap = useMemo(() => new Map(rawLavouras.map((item) => [item.id, item])), [rawLavouras]);

  const sanidade = useMemo(() => rawSanidade.filter((item) => matchesSelectedFarm(item) || matchesSelectedFarm(bovinoMap.get(item.bovino_id))), [rawSanidade, matchesSelectedFarm, bovinoMap]);
  const lavouras = useMemo(() => rawLavouras.filter((item) => matchesSelectedFarm(item)), [rawLavouras, matchesSelectedFarm]);
  const defensivos = useMemo(() => rawDefensivos.filter((item) => matchesSelectedFarm(item) || matchesSelectedFarm(lavouraMap.get(item.lavoura_id))), [rawDefensivos, matchesSelectedFarm, lavouraMap]);
  const financeiro = useMemo(() => rawFinanceiro.filter((item) => matchesSelectedFarm(item)), [rawFinanceiro, matchesSelectedFarm]);

  const compliance = useMemo(() => ({
    vencidos: sanidade.filter((item) => getComplianceStatus(item) === 'vencido'),
    proximos7: sanidade.filter((item) => getComplianceStatus(item) === 'proximos_7'),
    monitorar30: sanidade.filter((item) => getComplianceStatus(item) === 'monitorar_30'),
    emDia: sanidade.filter((item) => getComplianceStatus(item) === 'em_dia'),
  }), [sanidade]);

  const ruralStats = useMemo(() => {
    const receitas = financeiro.filter((i) => String(i.tipo || '').toLowerCase() === 'receita').reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const despesas = financeiro.filter((i) => String(i.tipo || '').toLowerCase() === 'despesa').reduce((acc, item) => acc + Number(item.valor || 0), 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }, [financeiro]);

  const agriculturalExpenses = useMemo(() => financeiro.filter((item) => {
    const key = `${item.centro_custo || ''} ${item.categoria || ''} ${item.descricao || ''}`.toLowerCase();
    return String(item.tipo || '').toLowerCase() === 'despesa' && (key.includes('lavoura') || key.includes('insumo') || key.includes('defensivo') || key.includes('plantio'));
  }), [financeiro]);

  const costByActivity = useMemo(() => {
    const grouped = new Map();
    financeiro.forEach((item) => {
      const key = getActivityKey(item);
      if (!grouped.has(key)) grouped.set(key, { atividade: key, receitas: 0, despesas: 0 });
      const ref = grouped.get(key);
      if (String(item.tipo || '').toLowerCase() === 'receita') ref.receitas += Number(item.valor || 0); else ref.despesas += Number(item.valor || 0);
    });
    return Array.from(grouped.values()).map((item) => ({ ...item, saldo: item.receitas - item.despesas })).sort((a, b) => Math.abs(b.saldo) - Math.abs(a.saldo));
  }, [financeiro]);

  const productivityBySafra = useMemo(() => {
    const totalAgriculturalExpense = agriculturalExpenses.reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const totalArea = lavouras.reduce((acc, item) => acc + Number(item.area || 0), 0);
    const grouped = lavouras.reduce((acc, lavoura) => {
      const key = lavoura.safra || 'Sem safra';
      if (!acc[key]) acc[key] = { safra: key, areaTotal: 0, totalAplicacoes: 0, aplicacoesPorHectare: 0, custoEstimado: 0, custoPorHectare: 0, talhoes: new Set() };
      const row = acc[key];
      const area = Number(lavoura.area || 0);
      const aplicacoes = defensivos.filter((d) => d.lavoura_id === lavoura.id);
      row.areaTotal += area;
      row.totalAplicacoes += aplicacoes.length;
      if (lavoura.talhao) row.talhoes.add(lavoura.talhao);
      return acc;
    }, {});
    return Object.values(grouped).map((item) => {
      const area = Number(item.areaTotal || 0);
      const custoEstimado = totalArea > 0 ? (totalAgriculturalExpense * area) / totalArea : 0;
      return { ...item, talhoes: item.talhoes.size, custoEstimado, aplicacoesPorHectare: area > 0 ? item.totalAplicacoes / area : 0, custoPorHectare: area > 0 ? custoEstimado / area : 0 };
    }).sort((a, b) => String(a.safra).localeCompare(String(b.safra), 'pt-BR'));
  }, [lavouras, defensivos, agriculturalExpenses]);

  const resultByLote = useMemo(() => {
    const grouped = new Map();
    bovinos.forEach((animal) => {
      const key = animal.lote || 'Sem lote';
      if (!grouped.has(key)) grouped.set(key, { lote: key, bovinos: 0, eventos: 0, proximosCuidados: 0 });
      grouped.get(key).bovinos += 1;
    });
    sanidade.forEach((item) => {
      const animal = bovinos.find((b) => b.id === item.bovino_id);
      const key = animal?.lote || 'Sem lote';
      if (!grouped.has(key)) grouped.set(key, { lote: key, bovinos: 0, eventos: 0, proximosCuidados: 0 });
      const ref = grouped.get(key);
      ref.eventos += 1;
      const status = getComplianceStatus(item);
      if (status === 'vencido' || status === 'proximos_7') ref.proximosCuidados += 1;
    });
    return Array.from(grouped.values()).sort((a, b) => b.bovinos - a.bovinos);
  }, [bovinos, sanidade]);

  const recentSanitaryEvents = useMemo(() => [...sanidade].sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0)).slice(0, 8).map((item) => {
    const animal = bovinos.find((b) => b.id === item.bovino_id);
    return { ...item, animalNome: animal?.nome || '-', brinco: animal?.brinco || '-', lote: animal?.lote || '-', fazenda: animal?.fazenda || '-' };
  }), [sanidade, bovinos]);

  const nextSanitaryCare = useMemo(() => [...sanidade].filter((item) => !!item.proxima_data).sort((a, b) => new Date(a.proxima_data).getTime() - new Date(b.proxima_data).getTime()).slice(0, 8).map((item) => {
    const animal = bovinos.find((b) => b.id === item.bovino_id);
    return { ...item, animalNome: animal?.nome || '-', brinco: animal?.brinco || '-', lote: animal?.lote || '-', compliance: getComplianceStatus(item) };
  }), [sanidade, bovinos]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Rural</h1>
        <p className="text-slate-500">{selectedFarm ? `Produtividade e conformidade da fazenda ${selectedFarm.nome}.` : 'Produtividade, conformidade sanitária e resultado rural consolidado.'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Bovinos" value={bovinos.length} icon={<ShieldCheck className="w-5 h-5" />} />
        <StatCard title="Eventos sanitários" value={sanidade.length} icon={<CalendarClock className="w-5 h-5" />} />
        <StatCard title="Lavouras" value={lavouras.length} subtitle="Áreas cadastradas" icon={<Sprout className="w-5 h-5" />} />
        <StatCard title="Aplicações" value={defensivos.length} subtitle="Defensivos registrados" icon={<Droplets className="w-5 h-5" />} />
        <StatCard title="Alertas vencidos" value={compliance.vencidos.length} tone="red" icon={<AlertTriangle className="w-5 h-5" />} />
        <StatCard title="Próximos 7 dias" value={compliance.proximos7.length} tone="amber" icon={<CalendarClock className="w-5 h-5" />} />
        <StatCard title="Monitorar 30 dias" value={compliance.monitorar30.length} tone="blue" icon={<CalendarClock className="w-5 h-5" />} />
        <StatCard title="Em dia" value={compliance.emDia.length} tone="green" icon={<CheckCircle2 className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Receitas" value={formatCurrency(ruralStats.receitas)} tone="green" icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard title="Despesas" value={formatCurrency(ruralStats.despesas)} tone="red" icon={<TrendingDown className="w-5 h-5" />} />
        <StatCard title="Saldo rural" value={formatCurrency(ruralStats.saldo)} tone={ruralStats.saldo >= 0 ? 'green' : 'red'} icon={<DollarSign className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-slate-800">Custos e resultado por atividade</h2><span className="text-sm text-slate-500">Centro de custo / categoria</span></div>
          {costByActivity.length === 0 ? <div className="text-center text-slate-500 py-8">Sem movimentações suficientes para consolidar.</div> : <div className="space-y-3">{costByActivity.slice(0, 8).map((item) => <div key={item.atividade} className="border rounded-xl p-4 bg-slate-50"><div className="flex items-center justify-between gap-3 mb-2"><div className="font-semibold text-slate-800">{item.atividade}</div><div className={`text-sm font-bold ${item.saldo >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(item.saldo)}</div></div><div className="grid grid-cols-3 gap-3 text-sm"><div><div className="text-slate-500">Receitas</div><div className="font-medium text-green-700">{formatCurrency(item.receitas)}</div></div><div><div className="text-slate-500">Despesas</div><div className="font-medium text-red-700">{formatCurrency(item.despesas)}</div></div><div><div className="text-slate-500">Saldo</div><div className={`font-medium ${item.saldo >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(item.saldo)}</div></div></div></div>)}</div>}
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-slate-800">Produtividade por safra</h2><span className="text-sm text-slate-500">Área, aplicações e custo estimado</span></div>
          {productivityBySafra.length === 0 ? <div className="text-center text-slate-500 py-8">Sem dados de safra para consolidar.</div> : <div className="space-y-3">{productivityBySafra.map((item) => <div key={item.safra} className="border rounded-xl p-4"><div className="flex items-center justify-between gap-3 mb-3"><div className="font-semibold text-slate-800">{item.safra}</div><div className="text-sm text-slate-500">{item.talhoes} talhão(ões)</div></div><div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm"><div><div className="text-slate-500">Área total</div><div className="font-medium text-slate-800">{Number(item.areaTotal || 0).toFixed(2)} ha</div></div><div><div className="text-slate-500">Aplicações</div><div className="font-medium text-slate-800">{item.totalAplicacoes}</div></div><div><div className="text-slate-500">Aplic./ha</div><div className="font-medium text-slate-800">{Number(item.aplicacoesPorHectare || 0).toFixed(2)}</div></div><div><div className="text-slate-500">Custo/ha estimado</div><div className="font-medium text-slate-800">{formatCurrency(item.custoPorHectare)}</div></div></div></div>)}</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-slate-800">Resultados por lote</h2><span className="text-sm text-slate-500">Visão operacional do rebanho</span></div>
          {resultByLote.length === 0 ? <div className="text-center text-slate-500 py-8">Sem dados por lote.</div> : <div className="space-y-3">{resultByLote.slice(0, 8).map((item) => <div key={item.lote} className="border rounded-xl p-4 bg-slate-50"><div className="flex items-center justify-between gap-3 mb-2"><div className="font-semibold text-slate-800">{item.lote}</div><div className="text-sm text-slate-500">{item.bovinos} bovino(s)</div></div><div className="grid grid-cols-3 gap-3 text-sm"><div><div className="text-slate-500">Eventos</div><div className="font-medium text-slate-800">{item.eventos}</div></div><div><div className="text-slate-500">Pendências</div><div className="font-medium text-amber-700">{item.proximosCuidados}</div></div><div><div className="text-slate-500">Índice evento/animal</div><div className="font-medium text-slate-800">{item.bovinos > 0 ? (item.eventos / item.bovinos).toFixed(2) : '0.00'}</div></div></div></div>)}</div>}
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-slate-800">Próximos cuidados sanitários</h2><span className="text-sm text-slate-500">Base para conformidade</span></div>
          {nextSanitaryCare.length === 0 ? <div className="text-center text-slate-500 py-8">Nenhum cuidado agendado.</div> : <div className="space-y-3">{nextSanitaryCare.map((item) => <div key={item.id} className="border rounded-xl p-4"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"><div><div className="font-semibold text-slate-800">{item.brinco} - {item.animalNome}</div><div className="text-sm text-slate-500">{item.tipo_evento || 'Evento'} • {item.produto || '-'}</div></div><div className="text-right"><div className="text-sm text-slate-600">{item.proxima_data ? new Date(item.proxima_data).toLocaleDateString('pt-BR') : '-'}</div><span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${item.compliance === 'vencido' ? 'bg-red-100 text-red-700' : item.compliance === 'proximos_7' ? 'bg-amber-100 text-amber-700' : item.compliance === 'monitorar_30' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{item.compliance === 'vencido' ? 'Vencido' : item.compliance === 'proximos_7' ? 'Próx. 7 dias' : item.compliance === 'monitorar_30' ? 'Monitorar' : 'Em dia'}</span></div></div></div>)}</div>}
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-slate-800">Eventos sanitários recentes</h2><span className="text-sm text-slate-500">Últimos registros operacionais</span></div>
        {recentSanitaryEvents.length === 0 ? <div className="text-center text-slate-500 py-8">Sem eventos recentes.</div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 border-b border-slate-200"><tr><th className="p-3">Data</th><th className="p-3">Animal</th><th className="p-3">Lote</th><th className="p-3">Evento</th><th className="p-3">Produto</th><th className="p-3">Fazenda</th><th className="p-3">Responsável</th></tr></thead><tbody className="divide-y divide-slate-100">{recentSanitaryEvents.map((item) => <tr key={item.id}><td className="p-3">{item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}</td><td className="p-3">{item.brinco} - {item.animalNome}</td><td className="p-3">{item.lote}</td><td className="p-3">{item.tipo_evento || '-'}</td><td className="p-3">{item.produto || '-'}</td><td className="p-3">{item.fazenda || '-'}</td><td className="p-3">{item.responsavel || '-'}</td></tr>)}</tbody></table></div>}
      </div>
    </div>
  );
};

export default DashboardRuralTab;
