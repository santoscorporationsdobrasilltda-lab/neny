import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, CreditCard, Wallet } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import FinanceiroTransacoes from './financeiro/FinanceiroTransacoes';
import FinanceiroContas from './financeiro/FinanceiroContas';

const summaryCards = [
    { title: 'Receitas', icon: TrendingUp, accent: 'text-green-600', bg: 'bg-green-50 border-green-100', text: 'Lançamentos operacionais e entradas do caixa.' },
    { title: 'Despesas', icon: TrendingDown, accent: 'text-red-600', bg: 'bg-red-50 border-red-100', text: 'Saídas operacionais, administrativas e custos do dia a dia.' },
    { title: 'Contas a Pagar', icon: CreditCard, accent: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', text: 'Controle de compromissos financeiros futuros.' },
    { title: 'Contas a Receber', icon: Wallet, accent: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', text: 'Acompanhamento de recebíveis e previsões de entrada.' },
];

const Financeiro = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900">Financeiro</h1>
                <p className="text-slate-500 max-w-3xl">
                    Painel operacional para receitas, despesas, contas a pagar e contas a receber.
                    A proposta aqui é manter visibilidade do fluxo financeiro sem confundir o usuário com excesso de contraste.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {summaryCards.map((card) => (
                    <div key={card.title} className={`rounded-2xl border p-5 shadow-sm ${card.bg}`}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-900">{card.title}</h3>
                            <card.icon className={`w-5 h-5 ${card.accent}`} />
                        </div>
                        <p className="text-sm text-slate-600">{card.text}</p>
                    </div>
                ))}
            </div>

            <Tabs defaultValue="receitas" className="w-full space-y-6">
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm inline-flex">
                    <TabsList className="bg-transparent p-0 flex flex-wrap gap-2 h-auto">
                        <TabsTrigger value="receitas" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200 border border-transparent rounded-lg px-4 py-2">
                            <TrendingUp className="w-4 h-4 mr-2" /> Receitas
                        </TabsTrigger>
                        <TabsTrigger value="despesas" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:border-red-200 border border-transparent rounded-lg px-4 py-2">
                            <TrendingDown className="w-4 h-4 mr-2" /> Despesas
                        </TabsTrigger>
                        <TabsTrigger value="pagar" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-200 border border-transparent rounded-lg px-4 py-2">
                            <CreditCard className="w-4 h-4 mr-2" /> Contas a Pagar
                        </TabsTrigger>
                        <TabsTrigger value="receber" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent rounded-lg px-4 py-2">
                            <Wallet className="w-4 h-4 mr-2" /> Contas a Receber
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="receitas" className="outline-none">
                    <FinanceiroTransacoes type="Receita" />
                </TabsContent>
                <TabsContent value="despesas" className="outline-none">
                    <FinanceiroTransacoes type="Despesa" />
                </TabsContent>
                <TabsContent value="pagar" className="outline-none">
                    <FinanceiroContas type="Pagar" />
                </TabsContent>
                <TabsContent value="receber" className="outline-none">
                    <FinanceiroContas type="Receber" />
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default Financeiro;
