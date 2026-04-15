import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, ShoppingCart, Users, Activity, Briefcase, Droplets, MessageSquare
} from 'lucide-react';
import {
    LineChart, Line, PieChart, Pie, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell, CartesianGrid
} from 'recharts';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { Button } from '@/components/ui/button';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
    const { data: clientes, fetchAll: fetchClientes, setData: setClientes } = useSupabaseCrud('sac_crm_clientes');
    const { data: ordens, fetchAll: fetchOrdens, setData: setOrdens } = useSupabaseCrud('ordem_servicos_ordens');
    const { data: bovinos, fetchAll: fetchBovinos, setData: setBovinos } = useSupabaseCrud('fazenda50_bovinos');
    const { data: tanques, fetchAll: fetchTanques, setData: setTanques } = useSupabaseCrud('piscicultura40_tanques');
    const { data: conversas, fetchAll: fetchConversas, setData: setConversas } = useSupabaseCrud('smartzap_conversas');
    const { data: financeiro, fetchAll: fetchFinanceiro, setData: setFinanceiro } = useSupabaseCrud('fazenda50_financeiro');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetchClientes(), fetchOrdens(), fetchBovinos(),
            fetchTanques(), fetchConversas(), fetchFinanceiro()
        ]).finally(() => setLoading(false));
    }, []);

    // Realtime subscriptions
    useRealtimeSubscription('sac_crm_clientes', (n) => setClientes(p => [n, ...p]), (n) => setClientes(p => p.map(x => x.id === n.id ? n : x)), (o) => setClientes(p => p.filter(x => x.id !== o.id)));
    useRealtimeSubscription('ordem_servicos_ordens', (n) => setOrdens(p => [n, ...p]), (n) => setOrdens(p => p.map(x => x.id === n.id ? n : x)), (o) => setOrdens(p => p.filter(x => x.id !== o.id)));
    useRealtimeSubscription('fazenda50_financeiro', (n) => setFinanceiro(p => [n, ...p]), (n) => setFinanceiro(p => p.map(x => x.id === n.id ? n : x)), (o) => setFinanceiro(p => p.filter(x => x.id !== o.id)));

    if (loading) {
        return <div className="p-8 text-center text-slate-500 animate-pulse">Carregando métricas em tempo real...</div>;
    }

    // Calculated Metrics
    const activeConversas = conversas.filter(
        (c) => String(c.status || '').toLowerCase() === 'ativo'
    ).length;

    const currentMonth = new Date().getMonth();
    const finMes = financeiro.filter(f => new Date(f.created_at).getMonth() === currentMonth);
    const receitaMes = finMes.filter(f => f.tipo === 'Receita').reduce((acc, curr) => acc + Number(curr.valor), 0);
    const despesaMes = finMes.filter(f => f.tipo === 'Despesa').reduce((acc, curr) => acc + Number(curr.valor), 0);
    const lucroMes = receitaMes - despesaMes;

    // Chart 1: Receita vs Despesa (Line)
    const financeiroData = finMes.reduce((acc, curr) => {
        const date = new Date(curr.created_at).toLocaleDateString();
        if (!acc[date]) acc[date] = { date, Receita: 0, Despesa: 0 };
        acc[date][curr.tipo] += Number(curr.valor);
        return acc;
    }, {});
    const lineData = Object.values(financeiroData).slice(-15);

    // Chart 2: OS Status (Bar)
    const osStatusCount = ordens.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {});
    const barDataOS = Object.keys(osStatusCount).map(k => ({ name: k, count: osStatusCount[k] }));

    // Chart 3: Client Type (Pie) - using 'tipo' if exists, else mock split for demo
    const clientTypes = clientes.reduce((acc, curr) => {
        const doc = curr.cpf_cnpj || curr.documento || '';
        const tipo = String(doc).replace(/\D/g, '').length > 11 ? 'PJ' : 'PF';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
    }, { PF: 0, PJ: 0 });
    const pieDataClientes = [{ name: 'Pessoa Física', value: clientTypes.PF }, { name: 'Pessoa Jurídica', value: clientTypes.PJ }];

    const metrics = [
        { title: 'Lucro Líquido (Mês)', value: `R$ ${lucroMes.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
        { title: 'Clientes Cadastrados', value: clientes.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Ordens de Serviço', value: ordens.length, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100' },
        { title: 'Conversas Ativas', value: activeConversas, icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-100' },
        { title: 'Rebanho (Bovinos)', value: bovinos.length, icon: Activity, color: 'text-pink-600', bg: 'bg-pink-100' },
        { title: 'Tanques (Piscicultura)', value: tanques.length, icon: Droplets, color: 'text-cyan-600', bg: 'bg-cyan-100' }
    ];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#1e3a8a]">Dashboard Operacional</h1>
                    <p className="text-slate-500">Métricas em tempo real integradas via Supabase</p>
                </div>
            </motion.div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase">{m.title}</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{m.value}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.bg}`}>
                            <m.icon className={`w-6 h-6 ${m.color}`} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Line Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-4">Evolução Financeira (Mês Atual)</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                <Legend />
                                <Line type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="Despesa" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-4">Ordens de Serviço por Status</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barDataOS}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-4">Distribuição de Clientes</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieDataClientes} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label>
                                    {pieDataClientes.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                <Legend verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;