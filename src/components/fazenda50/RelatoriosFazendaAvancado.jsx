import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Printer } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { PdfEngine } from '@/utils/PdfEngine';
import { useFazendaContext } from './FazendaContext';

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString('pt-BR') : '-');
const currency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));

const csvDownload = (filename, headers, rows) => {
  const content = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.map((x) => `"${String(x ?? '').replace(/"/g, '""')}"`).join(';'))].join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const RelatoriosFazendaAvancado = () => {
  const { user } = useAuth();
  const { selectedFarm, matchesSelectedFarm } = useFazendaContext();
  const { data: rawBovinos, fetchAll: fetchBovinos } = useSupabaseCrud('fazenda50_bovinos');
  const { data: rawSanidade, fetchAll: fetchSanidade } = useSupabaseCrud('fazenda50_sanidade');
  const { data: rawLavouras, fetchAll: fetchLavouras } = useSupabaseCrud('fazenda50_lavouras');
  const { data: rawDefensivos, fetchAll: fetchDefensivos } = useSupabaseCrud('fazenda50_defensivos');
  const { data: rawFinanceiro, fetchAll: fetchFinanceiro } = useSupabaseCrud('fazenda50_financeiro');

  const [reportType, setReportType] = useState('bovinos');
  const [search, setSearch] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    if (user) {
      fetchBovinos(1, 2000);
      fetchSanidade(1, 5000);
      fetchLavouras(1, 2000);
      fetchDefensivos(1, 5000);
      fetchFinanceiro(1, 5000);
    }
  }, [user, fetchBovinos, fetchSanidade, fetchLavouras, fetchDefensivos, fetchFinanceiro]);

  const bovinos = useMemo(() => rawBovinos.filter((item) => matchesSelectedFarm(item)), [rawBovinos, matchesSelectedFarm]);
  const bovinoMap = useMemo(() => new Map(rawBovinos.map((item) => [item.id, item])), [rawBovinos]);
  const lavouraMap = useMemo(() => new Map(rawLavouras.map((item) => [item.id, item])), [rawLavouras]);
  const sanidade = useMemo(() => rawSanidade.filter((item) => matchesSelectedFarm(item) || matchesSelectedFarm(bovinoMap.get(item.bovino_id))), [rawSanidade, matchesSelectedFarm, bovinoMap]);
  const lavouras = useMemo(() => rawLavouras.filter((item) => matchesSelectedFarm(item)), [rawLavouras, matchesSelectedFarm]);
  const defensivos = useMemo(() => rawDefensivos.filter((item) => matchesSelectedFarm(item) || matchesSelectedFarm(lavouraMap.get(item.lavoura_id))), [rawDefensivos, matchesSelectedFarm, lavouraMap]);
  const financeiro = useMemo(() => rawFinanceiro.filter((item) => matchesSelectedFarm(item)), [rawFinanceiro, matchesSelectedFarm]);

  const inPeriod = (value) => {
    if (!dataInicio && !dataFim) return true;
    if (!value) return false;
    const d = new Date(value);
    if (dataInicio && d < new Date(dataInicio)) return false;
    if (dataFim) {
      const end = new Date(dataFim);
      end.setHours(23, 59, 59, 999);
      if (d > end) return false;
    }
    return true;
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    const applyText = (text) => String(text || '').toLowerCase().includes(term);
    switch (reportType) {
      case 'sanitario':
        return sanidade.filter((i) => inPeriod(i.data || i.proxima_data) && [i.tipo_evento, i.produto, i.responsavel, i.observacoes].some(applyText));
      case 'agricola':
        return defensivos.filter((i) => inPeriod(i.data) && [i.produto, i.operador, i.equipamento, i.observacoes].some(applyText));
      case 'financeiro':
        return financeiro.filter((i) => inPeriod(i.data || i.created_at) && [i.tipo, i.categoria, i.descricao, i.centro_custo, i.fazenda].some(applyText));
      default:
        return bovinos.filter((i) => [i.nome, i.brinco, i.categoria, i.raca, i.lote, i.fazenda].some(applyText));
    }
  }, [reportType, search, dataInicio, dataFim, bovinos, sanidade, defensivos, financeiro]);

  const farmRows = selectedFarm ? [
    ['Fazenda', selectedFarm.nome || '-'],
    ['Sigla / código', [selectedFarm.sigla, selectedFarm.codigo].filter(Boolean).join(' • ') || '-'],
    ['Localização', [selectedFarm.cidade, selectedFarm.estado].filter(Boolean).join(' / ') || '-'],
    ['Responsável', selectedFarm.responsavel || '-'],
    ['Características', selectedFarm.observacoes || '-'],
  ] : [];

  const config = useMemo(() => {
    switch (reportType) {
      case 'sanitario':
        return {
          title: 'Relatório Sanitário',
          headers: ['Data', 'Animal', 'Evento', 'Produto', 'Próxima', 'Responsável'],
          rows: filtered.map((i) => {
            const animal = bovinoMap.get(i.bovino_id);
            return [fmtDate(i.data), animal ? `${animal.brinco || '-'} • ${animal.nome || '-'}` : '-', i.tipo_evento || '-', i.produto || '-', fmtDate(i.proxima_data), i.responsavel || '-'];
          }),
        };
      case 'agricola':
        return {
          title: 'Controle Agrícola',
          headers: ['Data', 'Talhão', 'Produto', 'Dose', 'Área', 'Operador'],
          rows: filtered.map((i) => {
            const lavoura = lavouraMap.get(i.lavoura_id);
            return [fmtDate(i.data), lavoura?.talhao || '-', i.produto || '-', i.dose || '-', Number(i.area_aplicada || 0).toFixed(2), i.operador || '-'];
          }),
        };
      case 'financeiro':
        return {
          title: 'Demonstrativo Financeiro Rural',
          headers: ['Data', 'Tipo', 'Categoria', 'Descrição', 'Fazenda', 'Valor'],
          rows: filtered.map((i) => [fmtDate(i.data), i.tipo || '-', i.categoria || '-', i.descricao || '-', i.fazenda || '-', currency(i.valor)]),
        };
      default:
        return {
          title: 'Ficha Técnica de Bovinos',
          headers: ['Brinco', 'Nome', 'Categoria', 'Raça', 'Lote', 'Fazenda', 'Status'],
          rows: filtered.map((i) => [i.brinco || '-', i.nome || '-', i.categoria || '-', i.raca || '-', i.lote || '-', i.fazenda || '-', i.status || '-']),
        };
    }
  }, [reportType, filtered, bovinoMap, lavouraMap]);

  const handlePdf = () => {
    const { doc, startY } = PdfEngine.createDocument({
      title: config.title,
      subtitle: `${selectedFarm ? `Fazenda: ${selectedFarm.nome}. ` : ''}Total de registros: ${config.rows.length}`,
    });

    let currentY = startY;
    if (farmRows.length) {
      currentY = PdfEngine.addLabeledTable(doc, farmRows, { startY, head: ['Dados da Fazenda', 'Informações'], tableWidth: 182, headColor: PdfEngine.BRAND.secondary }) + 8;
    }

    PdfEngine.addDataTable(doc, config.headers, config.rows.length ? config.rows : [['Sem registros para o filtro atual.']], { startY: currentY, headColor: PdfEngine.BRAND.primary });
    PdfEngine.finalize(doc, `${config.title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  const handleCsv = () => {
    csvDownload(`${config.title.replace(/\s+/g, '_').toLowerCase()}.csv`, config.headers, config.rows);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${config.title}</title><style>
      body{font-family:Arial,sans-serif;font-size:12px;color:#111827;padding:24px}
      h1{font-size:22px;margin-bottom:8px} table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #cbd5e1;padding:8px;text-align:left} th{background:#f8fafc}
      .box{border:1px solid #cbd5e1;border-radius:12px;padding:12px;margin:12px 0;background:#f8fafc}
      </style></head><body>
      <h1>${config.title}</h1>
      <p>${selectedFarm ? `Fazenda: <strong>${selectedFarm.nome}</strong><br/>` : ''}Total de registros: <strong>${config.rows.length}</strong></p>
      ${farmRows.length ? `<div class="box">${farmRows.map((row) => `<div><strong>${row[0]}:</strong> ${row[1]}</div>`).join('')}</div>` : ''}
      <table><thead><tr>${config.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${config.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <script>window.onload=()=>window.print()</script></body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FileText className="w-5 h-5 text-[#1e3a8a]" />Relatórios Agro</h2>
            <p className="text-sm text-slate-500">{selectedFarm ? `Consolidados da fazenda ${selectedFarm.nome}.` : 'Consolidados gerais do módulo Fazenda 5.0.'}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" />Imprimir</Button>
            <Button variant="outline" onClick={handleCsv}><Download className="w-4 h-4 mr-2" />CSV</Button>
            <Button onClick={handlePdf}><Download className="w-4 h-4 mr-2" />PDF</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select className="p-2 border rounded" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="bovinos">Bovinos</option>
            <option value="sanitario">Sanidade</option>
            <option value="agricola">Agrícola</option>
            <option value="financeiro">Financeiro</option>
          </select>
          <input className="p-2 border rounded" placeholder="Buscar no relatório" value={search} onChange={(e) => setSearch(e.target.value)} />
          <input className="p-2 border rounded" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          <input className="p-2 border rounded" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50 text-sm text-slate-600">{config.title} • {config.rows.length} registro(s)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200"><tr>{config.headers.map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {config.rows.length === 0 ? <tr><td colSpan={config.headers.length} className="p-8 text-center text-slate-500">Sem registros para o filtro atual.</td></tr> : config.rows.map((row, idx) => <tr key={`${config.title}-${idx}`}>{row.map((cell, cellIdx) => <td key={`${idx}-${cellIdx}`} className="p-3">{cell}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosFazendaAvancado;
