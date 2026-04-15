import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useReportFilters } from '@/hooks/useReportFilters';
import { ReportExporter } from '@/utils/ReportExporter';
import DataTable from '@/components/ui/DataTable';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const RelatoriosPisciculturaAvancado = () => {
    const { data: safras, fetchAll, setData } = useSupabaseCrud('piscicultura40_safras');
    const { filters, setFilter, applyFilters } = useReportFilters();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll().finally(() => setLoading(false));
    }, [fetchAll]);

    useRealtimeSubscription('piscicultura40_safras', 
        (n) => setData(p => [n, ...p]), 
        (n) => setData(p => p.map(x => x.id === n.id ? n : x)), 
        (o) => setData(p => p.filter(x => x.id !== o.id))
    );

    const filteredData = applyFilters(safras, 'created_at');

    const byEspecie = filteredData.reduce((acc, curr) => {
        const s = curr.especie || 'Desconhecida';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});
    const pieData = Object.keys(byEspecie).map(k => ({ name: k, value: byEspecie[k] }));

    const columns = [
        { header: 'Data Povoamento', accessor: 'data_inicio', cell: (r) => r.data_inicio ? new Date(r.data_inicio).toLocaleDateString() : '-', exportValue: (r) => r.data_inicio ? new Date(r.data_inicio).toLocaleDateString() : '-' },
        { header: 'Espécie', accessor: 'especie' },
        { header: 'Qtd Inicial', accessor: 'quantidade_inicial' },
    ];

    const handleExportPDF = () => ReportExporter.exportToPDF('Relatório de Piscicultura', filters, filteredData, columns);
    const handleExportExcel = () => ReportExporter.exportToExcel('Relatorio_Piscicultura', filters, filteredData, columns);

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
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportExcel} className="text-green-700 border-green-200 hover:bg-green-50"><FileText className="w-4 h-4 mr-2"/> Excel</Button>
                        <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700 text-white"><Download className="w-4 h-4 mr-2"/> PDF</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="h-64 border rounded-xl p-4">
                        <h4 className="text-sm font-bold text-slate-600 mb-2">Distribuição por Espécie</h4>
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

                <h3 className="font-bold text-slate-800 mb-4">Detalhamento de Safras</h3>
                <DataTable columns={columns} data={filteredData} loading={false} />
            </div>
        </div>
    );
};

export default RelatoriosPisciculturaAvancado;