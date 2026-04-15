import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Filter } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useReportFilters } from '@/hooks/useReportFilters';
import { ReportExporter } from '@/utils/ReportExporter';
import DataTable from '@/components/ui/DataTable';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const RelatoriosSACAvancado = () => {
    const { data: atendimentos, fetchAll, setData } = useSupabaseCrud('sac_crm_atendimentos');
    const { filters, setFilter, applyFilters } = useReportFilters();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll().finally(() => setLoading(false));
    }, [fetchAll]);

    useRealtimeSubscription('sac_crm_atendimentos', 
        (n) => setData(p => [n, ...p]), 
        (n) => setData(p => p.map(x => x.id === n.id ? n : x)), 
        (o) => setData(p => p.filter(x => x.id !== o.id))
    );

    const filteredData = applyFilters(atendimentos, 'created_at');

    // Chart Data calculations
    const byStatus = filteredData.reduce((acc, curr) => {
        const s = curr.status || 'aberto';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});
    const pieData = Object.keys(byStatus).map(k => ({ name: k, value: byStatus[k] }));

    const byDate = filteredData.reduce((acc, curr) => {
        const d = new Date(curr.created_at).toLocaleDateString();
        acc[d] = (acc[d] || 0) + 1;
        return acc;
    }, {});
    const lineData = Object.keys(byDate).map(k => ({ date: k, count: byDate[k] }));

    const columns = [
        { header: 'Data', accessor: 'created_at', cell: (r) => new Date(r.created_at).toLocaleDateString(), exportValue: (r) => new Date(r.created_at).toLocaleDateString() },
        { header: 'Assunto', accessor: 'assunto' },
        { header: 'Status', accessor: 'status' },
    ];

    const handleExportPDF = () => ReportExporter.exportToPDF('Relatório de Atendimentos SAC', filters, filteredData, columns);
    const handleExportExcel = () => ReportExporter.exportToExcel('Relatorio_SAC', filters, filteredData, columns);

    if (loading) return <div className="p-8 text-center animate-pulse">Carregando relatório...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-end flex-1">
                        <div>
                            <label className="text-xs font-semibold text-slate-500">Data Início</label>
                            <input type="date" className="p-2 border rounded text-sm w-full" value={filters.data_inicio} onChange={e => setFilter('data_inicio', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500">Data Fim</label>
                            <input type="date" className="p-2 border rounded text-sm w-full" value={filters.data_fim} onChange={e => setFilter('data_fim', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500">Status</label>
                            <select className="p-2 border rounded text-sm w-full" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
                                <option value="Todos">Todos</option>
                                <option value="aberto">Aberto</option>
                                <option value="em_atendimento">Em Atendimento</option>
                                <option value="resolvido">Resolvido</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportExcel} className="text-green-700 border-green-200 hover:bg-green-50"><FileText className="w-4 h-4 mr-2"/> Excel</Button>
                        <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700 text-white"><Download className="w-4 h-4 mr-2"/> PDF</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="h-64 border rounded-xl p-4">
                        <h4 className="text-sm font-bold text-slate-600 mb-2">Volume de Atendimentos</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="date" tick={{fontSize: 10}}/>
                                <YAxis tick={{fontSize: 10}}/>
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="h-64 border rounded-xl p-4">
                        <h4 className="text-sm font-bold text-slate-600 mb-2">Por Status</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                                    {pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                                </Pie>
                                <Tooltip/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <h3 className="font-bold text-slate-800 mb-4">Detalhamento dos Dados</h3>
                <DataTable columns={columns} data={filteredData} loading={false} />
            </div>
        </div>
    );
};

export default RelatoriosSACAvancado;