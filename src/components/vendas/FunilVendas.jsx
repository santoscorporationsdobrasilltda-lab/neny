import React, { useEffect, useMemo } from 'react';
import { TrendingUp, BarChart3, Users, FileText, AlertCircle } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const stageStyles = {
    Rascunho: 'bg-slate-50 border-slate-200 text-slate-700',
    Enviada: 'bg-blue-50 border-blue-200 text-blue-700',
    Aceita: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    Recusada: 'bg-red-50 border-red-200 text-red-700',
    Cancelada: 'bg-amber-50 border-amber-200 text-amber-700',
};

const StageCard = ({ title, count, value, proposals }) => (
    <div className={`rounded-2xl border p-5 shadow-sm ${stageStyles[title] || stageStyles.Rascunho}`}>
        <div className="flex items-start justify-between gap-3">
            <div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-1 text-sm opacity-80">{count} oportunidade(s)</p>
            </div>
            <div className="rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold">{formatCurrency(value)}</div>
        </div>

        <div className="mt-4 space-y-2">
            {proposals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-current/20 bg-white/60 p-4 text-sm opacity-70">
                    Nenhuma proposta neste estágio.
                </div>
            ) : (
                proposals.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-xl bg-white/80 p-3 text-sm shadow-sm">
                        <div className="font-semibold text-slate-900">{item.cliente || 'Cliente'}</div>
                        <div className="mt-1 flex items-center justify-between gap-2 text-slate-600">
                            <span>{Array.isArray(item.itens) ? item.itens.length : 0} item(ns)</span>
                            <strong>{formatCurrency(item.total || 0)}</strong>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

const MiniMetric = ({ icon: Icon, label, value }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 text-slate-500">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700"><Icon className="h-4 w-4" /></div>
            <div>
                <p className="text-xs uppercase tracking-wide">{label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    </div>
);

const FunilVendas = () => {
    const { user } = useAuth();
    const { data: propostas, fetchAll, loading } = useSupabaseCrud('vendas_propostas');

    useEffect(() => {
        if (user) fetchAll(1, 1000);
    }, [user, fetchAll]);

    const grouped = useMemo(() => {
        const statuses = ['Rascunho', 'Enviada', 'Aceita', 'Recusada', 'Cancelada'];
        return statuses.map((status) => {
            const items = (propostas || []).filter((item) => (item.status || 'Rascunho') === status);
            return {
                status,
                count: items.length,
                value: items.reduce((acc, item) => acc + Number(item.total || 0), 0),
                items,
            };
        });
    }, [propostas]);

    const metrics = useMemo(() => {
        const total = (propostas || []).length;
        const aceitas = (propostas || []).filter((item) => item.status === 'Aceita').length;
        const enviadas = (propostas || []).filter((item) => item.status === 'Enviada').length;
        const valorTotal = (propostas || []).reduce((acc, item) => acc + Number(item.total || 0), 0);
        const conversao = total ? `${Math.round((aceitas / total) * 100)}%` : '0%';
        return { total, aceitas, enviadas, valorTotal, conversao };
    }, [propostas]);

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Pipeline de Vendas</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Leitura simples do funil comercial com base no status real das propostas cadastradas.
                        </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        Conversão atual: {metrics.conversao}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={FileText} label="Propostas totais" value={metrics.total} />
                <MiniMetric icon={Users} label="Aceitas" value={metrics.aceitas} />
                <MiniMetric icon={AlertCircle} label="Enviadas" value={metrics.enviadas} />
                <MiniMetric icon={BarChart3} label="Valor em pipeline" value={formatCurrency(metrics.valorTotal)} />
            </div>

            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                    Carregando pipeline...
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                    {grouped.map((stage) => (
                        <StageCard
                            key={stage.status}
                            title={stage.status}
                            count={stage.count}
                            value={stage.value}
                            proposals={stage.items}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FunilVendas;
