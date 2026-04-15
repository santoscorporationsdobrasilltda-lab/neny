import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    UserCheck,
    UserX,
    DollarSign,
    BookOpen,
    TrendingUp,
    ShieldAlert,
    HardHat,
    FileText,
    Star,
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(Number(value || 0));

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
};

const daysUntil = (date) => {
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${date}T00:00:00`);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const cardClass = 'bg-white rounded-2xl border border-slate-200 shadow-sm p-5';

const StatCard = ({ title, value, subtitle, icon: Icon, tone = 'blue' }) => {
    const toneMap = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        red: 'bg-red-50 text-red-700 border-red-100',
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

const EmptyState = ({ text }) => (
    <div className="h-[280px] flex items-center justify-center text-sm text-slate-500">
        {text}
    </div>
);

const RHDashboard = () => {
    const { user } = useAuth();

    const { data: funcionarios, fetchAll: fetchFuncionarios, loading: loadingFuncionarios } = useSupabaseCrud('rh_funcionarios');
    const { data: folhas, fetchAll: fetchFolhas, loading: loadingFolhas } = useSupabaseCrud('rh_folha_pagamento');
    const { data: avaliacoes, fetchAll: fetchAvaliacoes, loading: loadingAvaliacoes } = useSupabaseCrud('rh_avaliacoes');
    const { data: promocoes, fetchAll: fetchPromocoes, loading: loadingPromocoes } = useSupabaseCrud('rh_promocoes');
    const { data: treinamentos, fetchAll: fetchTreinamentos, loading: loadingTreinamentos } = useSupabaseCrud('rh_treinamentos');
    const { data: acidentes, fetchAll: fetchAcidentes, loading: loadingAcidentes } = useSupabaseCrud('rh_sst_acidentes');
    const { data: epis, fetchAll: fetchEpis, loading: loadingEpis } = useSupabaseCrud('rh_sst_epis');
    const { data: asos, fetchAll: fetchAsos, loading: loadingAsos } = useSupabaseCrud('rh_sst_aso');

    useEffect(() => {
        if (!user) return;
        fetchFuncionarios(1, 1000);
        fetchFolhas(1, 1000);
        fetchAvaliacoes(1, 1000);
        fetchPromocoes(1, 1000);
        fetchTreinamentos(1, 1000);
        fetchAcidentes(1, 1000);
        fetchEpis(1, 1000);
        fetchAsos(1, 1000);
    }, [user, fetchFuncionarios, fetchFolhas, fetchAvaliacoes, fetchPromocoes, fetchTreinamentos, fetchAcidentes, fetchEpis, fetchAsos]);

    const loading =
        loadingFuncionarios ||
        loadingFolhas ||
        loadingAvaliacoes ||
        loadingPromocoes ||
        loadingTreinamentos ||
        loadingAcidentes ||
        loadingEpis ||
        loadingAsos;

    const indicadores = useMemo(() => {
        const ativos = funcionarios.filter((item) => (item.status || '').toLowerCase() === 'ativo');
        const inativos = funcionarios.length - ativos.length;
        const folhaTotal = folhas.reduce((acc, item) => acc + Number(item.liquido || 0), 0);
        const asosVencendo = asos.filter((item) => {
            const dias = daysUntil(item.data_validade);
            return dias !== null && dias >= 0 && dias <= 30;
        }).length;
        const episVencendo = epis.filter((item) => {
            const dias = daysUntil(item.validade);
            return dias !== null && dias >= 0 && dias <= 30;
        }).length;
        const acidentesAbertos = acidentes.filter((item) => (item.status || '').toLowerCase() !== 'fechado').length;

        return {
            totalFuncionarios: funcionarios.length,
            ativos: ativos.length,
            inativos,
            folhaTotal,
            totalAvaliacoes: avaliacoes.length,
            totalPromocoes: promocoes.length,
            totalTreinamentos: treinamentos.length,
            acidentesAbertos,
            asosVencendo,
            episVencendo,
        };
    }, [funcionarios, folhas, avaliacoes, promocoes, treinamentos, acidentes, asos, epis]);

    const funcionariosPorCargo = useMemo(() => {
        const map = new Map();
        funcionarios.forEach((item) => {
            const key = item.cargo || 'Não informado';
            map.set(key, (map.get(key) || 0) + 1);
        });
        return [...map.entries()]
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [funcionarios]);

    const distribuicaoStatus = useMemo(() => {
        const map = new Map();
        funcionarios.forEach((item) => {
            const key = item.status || 'Não informado';
            map.set(key, (map.get(key) || 0) + 1);
        });
        return [...map.entries()].map(([name, value]) => ({ name, value }));
    }, [funcionarios]);

    const treinamentosPorStatus = useMemo(() => {
        const map = new Map();
        treinamentos.forEach((item) => {
            const key = item.status || 'Não informado';
            map.set(key, (map.get(key) || 0) + 1);
        });
        return [...map.entries()].map(([name, value]) => ({ name, value }));
    }, [treinamentos]);

    const recentes = useMemo(() => {
        const funcionarioNome = (id) => funcionarios.find((f) => f.id === id)?.nome || 'Colaborador';

        const promocoesRecentes = [...promocoes]
            .sort((a, b) => new Date(b.data_promocao || 0) - new Date(a.data_promocao || 0))
            .slice(0, 5)
            .map((item) => ({
                id: item.id,
                titulo: funcionarioNome(item.funcionario_id),
                descricao: `${item.cargo_anterior || '-'} → ${item.cargo_novo || '-'}`,
                data: item.data_promocao,
            }));

        const asosProximos = [...asos]
            .filter((item) => {
                const dias = daysUntil(item.data_validade);
                return dias !== null && dias >= 0 && dias <= 60;
            })
            .sort((a, b) => new Date(a.data_validade || 0) - new Date(b.data_validade || 0))
            .slice(0, 5)
            .map((item) => ({
                id: item.id,
                titulo: funcionarioNome(item.funcionario_id),
                descricao: `${item.tipo_aso || 'ASO'} • validade ${formatDate(item.data_validade)}`,
                data: item.data_validade,
            }));

        return { promocoesRecentes, asosProximos };
    }, [promocoes, asos, funcionarios]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard de RH</h1>
                <p className="text-slate-500 mt-1">Indicadores consolidados de pessoas, folha e SST.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <StatCard title="Funcionários" value={indicadores.totalFuncionarios} subtitle={`${indicadores.ativos} ativos • ${indicadores.inativos} inativos`} icon={Users} tone="blue" />
                <StatCard title="Folha líquida" value={formatCurrency(indicadores.folhaTotal)} subtitle="Somatório dos registros de folha" icon={DollarSign} tone="green" />
                <StatCard title="Treinamentos" value={indicadores.totalTreinamentos} subtitle="Registros no banco" icon={BookOpen} tone="violet" />
                <StatCard title="Avaliações" value={indicadores.totalAvaliacoes} subtitle={`${indicadores.totalPromocoes} promoções registradas`} icon={Star} tone="amber" />
                <StatCard title="SST" value={indicadores.acidentesAbertos} subtitle={`${indicadores.asosVencendo} ASOs e ${indicadores.episVencendo} EPIs vencendo`} icon={ShieldAlert} tone="red" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className={`${cardClass} xl:col-span-2`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Colaboradores por cargo</h3>
                            <p className="text-sm text-slate-500">Distribuição do quadro atual por função.</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-slate-400" />
                    </div>
                    {loading ? (
                        <EmptyState text="Carregando indicadores..." />
                    ) : funcionariosPorCargo.length === 0 ? (
                        <EmptyState text="Sem dados de cargos cadastrados." />
                    ) : (
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funcionariosPorCargo} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                                    <Tooltip formatter={(value) => [value, 'Colaboradores']} />
                                    <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className={cardClass}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Status do quadro</h3>
                            <p className="text-sm text-slate-500">Funcionários por situação.</p>
                        </div>
                        <UserCheck className="w-5 h-5 text-slate-400" />
                    </div>
                    {loading ? (
                        <EmptyState text="Carregando indicadores..." />
                    ) : distribuicaoStatus.length === 0 ? (
                        <EmptyState text="Sem dados de status disponíveis." />
                    ) : (
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={distribuicaoStatus} dataKey="value" nameKey="name" outerRadius={96} innerRadius={54} paddingAngle={3}>
                                        {distribuicaoStatus.map((entry, index) => (
                                            <Cell key={`status-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [value, 'Colaboradores']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {distribuicaoStatus.map((item, index) => (
                                    <div key={item.name} className="inline-flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-full px-3 py-1">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        {item.name}: {item.value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className={cardClass}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Treinamentos por status</h3>
                            <p className="text-sm text-slate-500">Panorama dos treinamentos cadastrados.</p>
                        </div>
                        <BookOpen className="w-5 h-5 text-slate-400" />
                    </div>
                    {loading ? (
                        <EmptyState text="Carregando treinamentos..." />
                    ) : treinamentosPorStatus.length === 0 ? (
                        <EmptyState text="Nenhum treinamento cadastrado." />
                    ) : (
                        <div className="space-y-3">
                            {treinamentosPorStatus.map((item, index) => {
                                const total = Math.max(treinamentos.length, 1);
                                const percent = (item.value / total) * 100;
                                return (
                                    <div key={item.name}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-700">{item.name}</span>
                                            <span className="text-slate-500">{item.value}</span>
                                        </div>
                                        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={`${cardClass} grid grid-cols-1 md:grid-cols-2 gap-4`}>
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-slate-400" />
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">ASOs próximos</h3>
                                <p className="text-sm text-slate-500">Exames com vencimento próximo.</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {recentes.asosProximos.length === 0 ? (
                                <p className="text-sm text-slate-500">Nenhum ASO vencendo nos próximos 60 dias.</p>
                            ) : (
                                recentes.asosProximos.map((item) => (
                                    <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                                        <div className="font-medium text-slate-800">{item.titulo}</div>
                                        <div className="text-sm text-slate-500 mt-1">{item.descricao}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <HardHat className="w-5 h-5 text-slate-400" />
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Promoções recentes</h3>
                                <p className="text-sm text-slate-500">Últimas movimentações de carreira.</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {recentes.promocoesRecentes.length === 0 ? (
                                <p className="text-sm text-slate-500">Nenhuma promoção registrada.</p>
                            ) : (
                                recentes.promocoesRecentes.map((item) => (
                                    <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                                        <div className="font-medium text-slate-800">{item.titulo}</div>
                                        <div className="text-sm text-slate-500 mt-1">{item.descricao}</div>
                                        <div className="text-xs text-slate-400 mt-2">{formatDate(item.data)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RHDashboard;
