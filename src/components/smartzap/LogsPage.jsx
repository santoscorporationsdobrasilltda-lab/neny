import React, { useEffect, useState } from 'react';
import { FileText, Download, Search } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import DataTable from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { ReportExporter } from '@/utils/ReportExporter';

const LogsPage = () => {
    const { data: logs, fetchAll, loading } = useSupabaseCrud('smartzap_logs');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const filtered = logs.filter(l => l.mensagem?.toLowerCase().includes(searchTerm.toLowerCase()) || l.modulo?.toLowerCase().includes(searchTerm.toLowerCase()));

    const columns = [
        { header: 'Data/Hora', accessor: 'timestamp', cell: (r) => new Date(r.timestamp || r.created_at).toLocaleString(), exportValue: (r) => new Date(r.timestamp || r.created_at).toLocaleString() },
        { header: 'Módulo', accessor: 'modulo', cell: (r) => <span className="uppercase text-xs font-bold text-slate-500">{r.modulo}</span> },
        {
            header: 'Tipo', accessor: 'tipo', cell: (r) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${r.tipo === 'error' ? 'bg-red-100 text-red-700' : r.tipo === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                    {r.tipo}
                </span>
            )
        },
        { header: 'Mensagem', accessor: 'mensagem' },
    ];

    const exportCsv = () => {
        ReportExporter.exportToExcel('Logs_SmartZap', {}, filtered, columns);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Logs do Sistema</h2>
                    <p className="text-sm text-slate-500">Auditoria e rastreamento de integrações.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input className="w-full pl-9 p-2 border rounded-lg text-sm" placeholder="Buscar logs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <Button variant="outline" onClick={exportCsv}><Download className="w-4 h-4 mr-2" /> Exportar</Button>
                </div>
            </div>

            <DataTable columns={columns} data={filtered} loading={loading} />
        </div>
    );
};

export default LogsPage;