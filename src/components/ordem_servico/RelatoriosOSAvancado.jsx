import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Printer, TrendingUp, Activity, Wrench, Banknote } from 'lucide-react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from 'recharts';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useReportFilters } from '@/hooks/useReportFilters';
import { ReportExporter } from '@/utils/ReportExporter';
import DataTable from '@/components/ui/DataTable';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const money = (value) =>
    Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const RelatoriosOSAvancado = () => {
    const { data: ordens, fetchAll: fetchOrdens, setData: setOrdens } = useSupabaseCrud('ordem_servicos_ordens');
    const { data: tecnicos, fetchAll: fetchTecnicos } = useSupabaseCrud('ordem_servicos_tecnicos');
    const { data: atividades, fetchAll: fetchAtividades } = useSupabaseCrud('ordem_servicos_atividades');
    const { data: financeiro, fetchAll: fetchFinanceiro } = useSupabaseCrud('ordem_servicos_financeiro');
    const { data: materiais, fetchAll: fetchMateriais } = useSupabaseCrud('ordem_servicos_materiais_utilizados');
    const { data: anexos, fetchAll: fetchAnexos } = useSupabaseCrud('ordem_servicos_anexos');
    const { filters, setFilter } = useReportFilters();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetchOrdens(1, 2000),
            fetchTecnicos(1, 1000),
            fetchAtividades(1, 3000),
            fetchFinanceiro(1, 3000),
            fetchMateriais(1, 3000),
            fetchAnexos(1, 3000),
        ]).finally(() => setLoading(false));
    }, [fetchOrdens, fetchTecnicos, fetchAtividades, fetchFinanceiro, fetchMateriais, fetchAnexos]);

    useRealtimeSubscription(
        'ordem_servicos_ordens',
        (n) => setOrdens((p) => [n, ...p]),
        (n) => setOrdens((p) => p.map((x) => (x.id === n.id ? n : x))),
        (o) => setOrdens((p) => p.filter((x) => x.id !== o.id))
    );

    const startDate = filters.data_inicio ? new Date(filters.data_inicio) : null;
    const endDate = filters.data_fim ? new Date(filters.data_fim) : null;

    const filteredOrdens = useMemo(() => {
        return ordens.filter((ordem) => {
            const createdAt = ordem.created_at ? new Date(ordem.created_at) : null;
            const matchStart = !startDate || (createdAt && createdAt >= startDate);
            const matchEnd = !endDate || (createdAt && createdAt <= new Date(endDate.getTime() + 86400000));
            const matchStatus = !filters.status || filters.status === 'Todos' || ordem.status === filters.status;
            return matchStart && matchEnd && matchStatus;
        });
    }, [ordens, startDate, endDate, filters.status]);

    const filteredIds = new Set(filteredOrdens.map((o) => o.id));
    const filteredAtividades = atividades.filter((a) => filteredIds.has(a.ordem_id));
    const filteredFinanceiro = financeiro.filter((f) => filteredIds.has(f.ordem_id));
    const filteredMateriais = materiais.filter((m) => filteredIds.has(m.ordem_id));
    const filteredAnexos = anexos.filter((a) => filteredIds.has(a.ordem_id));

    const totalCustos = filteredFinanceiro.reduce((acc, item) => acc + Number(item.valor_total || 0), 0);
    const totalMateriais = filteredMateriais.reduce((acc, item) => acc + Number(item.valor_total || 0), 0);
    const totalAtividades = filteredAtividades.length;
    const totalAnexos = filteredAnexos.length;

    const byStatus = filteredOrdens.reduce((acc, curr) => {
        const s = curr.status || 'Sem status';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});
    const pieData = Object.keys(byStatus).map((k) => ({ name: k, value: byStatus[k] }));

    const technicianMap = new Map(tecnicos.map((t) => [t.id, t.nome]));

    const productivityData = Object.entries(
        filteredOrdens.reduce((acc, ordem) => {
            const key = technicianMap.get(ordem.tecnico_id) || 'Sem técnico';
            if (!acc[key]) acc[key] = { name: key, ordens: 0, custos: 0, atividades: 0 };
            acc[key].ordens += 1;
            acc[key].custos += filteredFinanceiro
                .filter((f) => f.ordem_id === ordem.id)
                .reduce((sum, item) => sum + Number(item.valor_total || 0), 0);
            acc[key].atividades += filteredAtividades.filter((a) => a.ordem_id === ordem.id).length;
            return acc;
        }, {})
    ).map(([, value]) => ({ ...value, custosLabel: money(value.custos) }));

    const costTypeData = Object.entries(
        filteredFinanceiro.reduce((acc, item) => {
            const key = item.tipo_custo || 'outro';
            acc[key] = (acc[key] || 0) + Number(item.valor_total || 0);
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    const osRows = filteredOrdens.map((ordem) => {
        const tecnico = technicianMap.get(ordem.tecnico_id) || '-';
        const custo = filteredFinanceiro
            .filter((f) => f.ordem_id === ordem.id)
            .reduce((acc, item) => acc + Number(item.valor_total || 0), 0);
        const qtdAtividades = filteredAtividades.filter((a) => a.ordem_id === ordem.id).length;
        const qtdMateriais = filteredMateriais.filter((m) => m.ordem_id === ordem.id).length;
        return {
            id: ordem.id,
            created_at: ordem.created_at,
            cliente: ordem.cliente,
            tecnico,
            prioridade: ordem.prioridade || '-',
            status: ordem.status || '-',
            custo_total: custo,
            atividades: qtdAtividades,
            materiais: qtdMateriais,
        };
    });

    const columns = [
        {
            header: 'Data',
            accessor: 'created_at',
            cell: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : '-'),
            exportValue: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString('pt-BR') : '-'),
        },
        { header: 'Cliente', accessor: 'cliente' },
        { header: 'Técnico', accessor: 'tecnico' },
        { header: 'Prioridade', accessor: 'prioridade' },
        { header: 'Status', accessor: 'status' },
        { header: 'Atividades', accessor: 'atividades' },
        { header: 'Materiais', accessor: 'materiais' },
        {
            header: 'Custo total',
            accessor: 'custo_total',
            cell: (r) => money(r.custo_total),
            exportValue: (r) => money(r.custo_total),
        },
    ];

    const handleExportPDF = () => ReportExporter.exportToPDF('Relatório de Ordens de Serviço', filters, osRows, columns);
    const handleExportExcel = () => ReportExporter.exportToExcel('Relatorio_OS_Gerencial', filters, osRows, columns);
    const handlePrint = () =>
        ReportExporter.openPrintWindow({
            title: 'Relatório Gerencial de Ordens de Serviço',
            subtitle: `Total de OS: ${filteredOrdens.length} | Custo total: ${money(totalCustos)} | Atividades: ${totalAtividades}`,
            columns: columns.map((c) => c.header),
            rows: osRows.map((row) => [
                row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : '-',
                row.cliente || '-',
                row.tecnico || '-',
                row.prioridade || '-',
                row.status || '-',
                row.atividades ?? 0,
                row.materiais ?? 0,
                money(row.custo_total),
            ]),
            footer: `Gerado em ${new Date().toLocaleString('pt-BR')}`,
        });

    if (loading) return <div className="p-8 text-center animate-pulse">Carregando relatório...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-end flex-1">
                        <div>
                            <label className="text-xs font-semibold text-slate-500">Data Início</label>
                            <input type="date" className="p-2 border rounded text-sm w-full" value={filters.data_inicio} onChange={(e) => setFilter('data_inicio', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500">Data Fim</label>
                            <input type="date" className="p-2 border rounded text-sm w-full" value={filters.data_fim} onChange={(e) => setFilter('data_fim', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500">Status</label>
                            <select className="p-2 border rounded text-sm w-full" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
                                <option value="Todos">Todos</option>
                                <option value="Aberta">Aberta</option>
                                <option value="Em Andamento">Em Andamento</option>
                                <option value="Concluída">Concluída</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" />Imprimir</Button>
                        <Button variant="outline" onClick={handleExportExcel} className="text-green-700 border-green-200 hover:bg-green-50"><FileText className="w-4 h-4 mr-2" />Excel</Button>
                        <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700 text-white"><Download className="w-4 h-4 mr-2" />PDF</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                        <div className="flex items-center gap-2 text-slate-500 text-sm"><Wrench className="w-4 h-4" /> Ordens</div>
                        <div className="text-2xl font-bold text-slate-900 mt-1">{filteredOrdens.length}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                        <div className="flex items-center gap-2 text-slate-500 text-sm"><Activity className="w-4 h-4" /> Atividades</div>
                        <div className="text-2xl font-bold text-slate-900 mt-1">{totalAtividades}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                        <div className="flex items-center gap-2 text-slate-500 text-sm"><Banknote className="w-4 h-4" /> Custos</div>
                        <div className="text-2xl font-bold text-slate-900 mt-1">{money(totalCustos)}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                        <div className="flex items-center gap-2 text-slate-500 text-sm"><TrendingUp className="w-4 h-4" /> Evidências</div>
                        <div className="text-2xl font-bold text-slate-900 mt-1">{totalAnexos}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="h-72 border rounded-xl p-4">
                        <h4 className="text-sm font-bold text-slate-600 mb-2">Produtividade por técnico</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productivityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="ordens" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Ordens" />
                                <Bar dataKey="atividades" fill="#10b981" radius={[4, 4, 0, 0]} name="Atividades" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="h-72 border rounded-xl p-4">
                        <h4 className="text-sm font-bold text-slate-600 mb-2">Custos por tipo</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={costTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label>
                                    {costTypeData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v) => money(v)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <h3 className="font-bold text-slate-800 mb-4">Detalhamento das Ordens</h3>
                <DataTable columns={columns} data={osRows} loading={false} />
            </div>
        </div>
    );
};

export default RelatoriosOSAvancado;
