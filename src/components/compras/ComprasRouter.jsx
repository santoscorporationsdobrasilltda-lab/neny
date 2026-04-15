import React, { useEffect, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Truck, ShoppingBag, BarChart, Package, Wallet } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const MetricCard = ({ icon: Icon, title, value, helper, accent = 'text-blue-600', bg = 'bg-blue-50 border-blue-100' }) => (
    <div className={`rounded-2xl border p-5 shadow-sm ${bg}`}>
        <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <Icon className={`w-5 h-5 ${accent}`} />
        </div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-sm text-slate-600 mt-1">{helper}</p>
    </div>
);

const ComprasHome = () => {
    const { user } = useAuth();
    const { data: fornecedores, loading: loadingFornecedores, fetchAll: fetchFornecedores } = useSupabaseCrud('estoque_fornecedores');
    const { data: movimentacoes, loading: loadingMovs, fetchAll: fetchMovs } = useSupabaseCrud('estoque_movimentacoes');
    const { data: contasPagar, loading: loadingPagar, fetchAll: fetchPagar } = useSupabaseCrud('gestao_contas_pagar');

    useEffect(() => {
        if (user) {
            fetchFornecedores(1, 1000);
            fetchMovs(1, 1000);
            fetchPagar(1, 1000);
        }
    }, [user, fetchFornecedores, fetchMovs, fetchPagar]);

    const resumo = useMemo(() => {
        const entradas = (movimentacoes || []).filter((item) => (item.tipo || '').toLowerCase() === 'entrada');
        const fornecedoresAtivos = (fornecedores || []).filter((item) => (item.status || '').toLowerCase() !== 'inativo');
        const emAberto = (contasPagar || []).filter((item) => item.status === 'aberto');
        const valorAberto = emAberto.reduce((acc, item) => acc + Number(item.amount || 0), 0);

        return {
            fornecedores: fornecedoresAtivos.length,
            entradas: entradas.length,
            titulosAbertos: emAberto.length,
            valorAberto,
        };
    }, [fornecedores, movimentacoes, contasPagar]);

    const loading = loadingFornecedores || loadingMovs || loadingPagar;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Compras</h1>
                <p className="text-slate-500">Visão resumida de fornecedores, entradas de estoque e compromissos financeiros vinculados às compras.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <MetricCard icon={Truck} title="Fornecedores ativos" value={loading ? '...' : resumo.fornecedores} helper="Base de fornecedores disponíveis para operação." accent="text-orange-600" bg="bg-orange-50 border-orange-100" />
                <MetricCard icon={Package} title="Entradas registradas" value={loading ? '...' : resumo.entradas} helper="Movimentações de entrada no estoque." accent="text-blue-600" bg="bg-blue-50 border-blue-100" />
                <MetricCard icon={ShoppingBag} title="Títulos em aberto" value={loading ? '...' : resumo.titulosAbertos} helper="Contas a pagar relacionadas às aquisições." accent="text-green-600" bg="bg-green-50 border-green-100" />
                <MetricCard icon={Wallet} title="Valor em aberto" value={loading ? '...' : formatCurrency(resumo.valorAberto)} helper="Exposição financeira atual do submódulo." accent="text-purple-600" bg="bg-purple-50 border-purple-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-orange-600" /> Fornecedores recentes</h2>
                    <div className="space-y-3">
                        {(fornecedores || []).slice(0, 6).map((item) => (
                            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                                <div>
                                    <div className="font-medium text-slate-900">{item.nome}</div>
                                    <div className="text-sm text-slate-500">{item.contato || item.email || 'Sem contato informado'}</div>
                                </div>
                                <span className="text-xs font-medium rounded-full px-3 py-1 bg-slate-100 text-slate-700">{item.status || 'Ativo'}</span>
                            </div>
                        ))}
                        {!loading && (fornecedores || []).length === 0 && <div className="text-slate-500">Nenhum fornecedor cadastrado.</div>}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2"><BarChart className="w-5 h-5 text-blue-600" /> Panorama de compras</h2>
                    <div className="space-y-4 text-sm text-slate-600">
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                            <strong className="block text-slate-900 mb-1">O que já está operacional</strong>
                            Entradas de estoque, base de fornecedores e títulos em aberto já ajudam a dar tração ao módulo sem prometer fluxo completo de pedidos ainda.
                        </div>
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                            <strong className="block text-slate-900 mb-1">Próxima evolução natural</strong>
                            Workflow de pedido de compra, cotação comparativa e vínculo direto entre pedido, recebimento e contas a pagar.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ComprasRouter = () => {
    return (
        <>
            <Helmet>
                <title>Compras - Neny Software</title>
            </Helmet>
            <Routes>
                <Route index element={<ComprasHome />} />
            </Routes>
        </>
    );
};

export default ComprasRouter;
