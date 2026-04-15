import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, FileDown, Printer, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { exportTablePdf, openPrintWindow, ReportExporter } from '@/utils/ReportExporter';
import { getSelectedEmpresaId } from './companyStorage';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(Number(value || 0));
const formatDate = (value) => (value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : '-');

const RelatoriosContabeis = () => {
  const { data: accounts = [], fetchAll: fetchAccounts } = useSupabaseCrud('contabilidade_contas');
  const { data: entries = [], loading, fetchAll: fetchEntries } = useSupabaseCrud('contabilidade_lancamentos');
  const { data: empresas = [], fetchAll: fetchEmpresas } = useSupabaseCrud('contabilidade_empresas');
  const [reportType, setReportType] = useState('balancete');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState(getSelectedEmpresaId());

  useEffect(() => {
    fetchAccounts(1,1000); fetchEntries(1,2000); fetchEmpresas(1,200);
    const handler = () => setSelectedEmpresaId(getSelectedEmpresaId());
    window.addEventListener('neny-contabilidade-empresa-change', handler);
    return () => window.removeEventListener('neny-contabilidade-empresa-change', handler);
  }, [fetchAccounts, fetchEntries, fetchEmpresas]);

  const activeCompany = useMemo(() => empresas.find((empresa)=>empresa.id===selectedEmpresaId) || null, [empresas, selectedEmpresaId]);
  const companyAccounts = useMemo(() => accounts.filter((acc)=>!selectedEmpresaId || acc.company_id === selectedEmpresaId), [accounts, selectedEmpresaId]);
  const companyEntries = useMemo(() => entries.filter((ent)=>!selectedEmpresaId || ent.company_id === selectedEmpresaId), [entries, selectedEmpresaId]);

  const contaResumo = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const grouped = new Map();
    companyAccounts.forEach((acc)=> grouped.set(acc.nome, { codigo: acc.codigo, conta: acc.nome, tipo: acc.tipo || '-', saldo_inicial: Number(acc.saldo || 0), debitos: 0, creditos: 0 }));
    companyEntries.forEach((entry)=> {
      const debitoKey = entry.debito || 'Conta não informada';
      const creditoKey = entry.credito || 'Conta não informada';
      if (!grouped.has(debitoKey)) grouped.set(debitoKey, { codigo:'-', conta:debitoKey, tipo:'-', saldo_inicial:0, debitos:0, creditos:0 });
      if (!grouped.has(creditoKey)) grouped.set(creditoKey, { codigo:'-', conta:creditoKey, tipo:'-', saldo_inicial:0, debitos:0, creditos:0 });
      grouped.get(debitoKey).debitos += Number(entry.valor_debito || 0);
      grouped.get(creditoKey).creditos += Number(entry.valor_credito || 0);
    });
    return [...grouped.values()].map((item)=>({...item, saldo_final:item.saldo_inicial + item.debitos - item.creditos})).filter((item)=>!term || [item.codigo, item.conta, item.tipo].some((v)=>String(v || '').toLowerCase().includes(term))).sort((a,b)=>String(a.codigo||'').localeCompare(String(b.codigo||'')));
  }, [companyAccounts, companyEntries, searchTerm]);

  const diario = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return [...companyEntries].filter((entry)=>!term || [entry.historico, entry.debito, entry.credito, entry.tipo, entry.numero].some((v)=>String(v || '').toLowerCase().includes(term))).sort((a,b)=>new Date(`${b.data || 0}T12:00:00`) - new Date(`${a.data || 0}T12:00:00`));
  }, [companyEntries, searchTerm]);

  const razao = useMemo(() => diario.flatMap((entry)=>([{ conta: entry.debito || '-', lado:'Débito', historico:entry.historico || '-', data:entry.data, numero:entry.numero, valor:Number(entry.valor_debito || 0) }, { conta: entry.credito || '-', lado:'Crédito', historico:entry.historico || '-', data:entry.data, numero:entry.numero, valor:Number(entry.valor_credito || 0) }])), [diario]);

  const buildReport = () => {
    if (reportType === 'balancete') return { title:'Balancete de Verificação', columns:['Código','Conta','Tipo','Saldo Inicial','Débitos','Créditos','Saldo Final'], rows:contaResumo.map((item)=>[item.codigo || '-', item.conta || '-', item.tipo || '-', formatCurrency(item.saldo_inicial), formatCurrency(item.debitos), formatCurrency(item.creditos), formatCurrency(item.saldo_final)]), summaryRows:[['Empresa', activeCompany?.nome_fantasia || '-'], ['Regime tributário', activeCompany?.regime_tributacao || '-'], ['Total de contas', contaResumo.length]] };
    if (reportType === 'razao') return { title:'Livro Razão Simplificado', columns:['Conta','Lado','Data','Nº','Histórico','Valor'], rows:razao.map((item)=>[item.conta, item.lado, formatDate(item.data), `#${item.numero || '-'}`, item.historico, formatCurrency(item.valor)]), summaryRows:[['Empresa', activeCompany?.nome_fantasia || '-'], ['Regime tributário', activeCompany?.regime_tributacao || '-'], ['Movimentos', razao.length]] };
    return { title:'Livro Diário Simplificado', columns:['Nº','Data','Histórico','Tipo','Débito','Crédito','Valor'], rows:diario.map((item)=>[`#${item.numero || '-'}`, formatDate(item.data), item.historico || '-', item.tipo || '-', item.debito || '-', item.credito || '-', formatCurrency(item.valor_debito)]), summaryRows:[['Empresa', activeCompany?.nome_fantasia || '-'], ['Regime tributário', activeCompany?.regime_tributacao || '-'], ['Lançamentos', diario.length]] };
  };

  const handlePdf = () => { const report = buildReport(); exportTablePdf({ ...report, subtitle:`Empresa: ${activeCompany?.nome_fantasia || '-'} • Registros: ${report.rows.length}`, filename:`${report.title.toLowerCase().replace(/\s+/g,'_')}.pdf`, companyProfile:activeCompany }); };
  const handlePrint = () => { const report = buildReport(); openPrintWindow({ ...report, subtitle:`Empresa: ${activeCompany?.nome_fantasia || '-'} • Registros: ${report.rows.length}`, companyProfile:activeCompany }); };
  const handleExcel = () => { const report = buildReport(); const csvLines = [report.columns.join(';'), ...report.rows.map((row)=>row.map((cell)=>`"${String(cell ?? '').replace(/"/g,'""')}"`).join(';'))]; const blob = new Blob(['\uFEFF' + csvLines.join('\n')], { type:'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${report.title.toLowerCase().replace(/\s+/g,'_')}.csv`; link.click(); URL.revokeObjectURL(url); };

  return <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6"><div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4"><div><h2 className="text-2xl font-bold text-slate-900">Relatórios Contábeis</h2><p className="text-slate-500 text-sm mt-1">Relatórios emitidos por empresa com identificação fiscal no cabeçalho.</p></div><div className="flex flex-wrap gap-3"><div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"><Building2 className="w-4 h-4 text-blue-700" /> {activeCompany?.nome_fantasia || 'Nenhuma empresa ativa'}</div><Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-2"/> Imprimir</Button><Button variant="outline" onClick={handlePdf}><FileDown className="w-4 h-4 mr-2"/> PDF</Button><Button variant="outline" onClick={handleExcel}><FileDown className="w-4 h-4 mr-2"/> Excel</Button></div></div>
  <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-3"><select className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900" value={reportType} onChange={(e)=>setReportType(e.target.value)}><option value="balancete">Balancete de Verificação</option><option value="diario">Livro Diário Simplificado</option><option value="razao">Livro Razão Simplificado</option></select><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900" placeholder="Buscar registros..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} /></div></div>
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"><div className="flex items-center gap-2 text-slate-900 font-semibold mb-4"><FileText className="w-4 h-4 text-blue-700" /> {buildReport().title}</div><div className="text-sm text-slate-500 mb-4">Empresa ativa: <strong>{activeCompany?.nome_fantasia || 'Nenhuma'}</strong>{activeCompany?.regime_tributacao ? ` • ${activeCompany.regime_tributacao}` : ''}</div><div className="overflow-x-auto"><table className="w-full text-left text-slate-900"><thead className="bg-slate-50"><tr>{buildReport().columns.map((col)=><th key={col} className="p-3">{col}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={buildReport().columns.length} className="p-8 text-center text-slate-500">Carregando...</td></tr> : buildReport().rows.length ? buildReport().rows.slice(0, 50).map((row, idx)=><tr key={idx} className="border-b border-slate-100">{row.map((cell, cellIdx)=><td key={cellIdx} className="p-3">{cell}</td>)}</tr>) : <tr><td colSpan={buildReport().columns.length} className="p-8 text-center text-slate-500">{selectedEmpresaId ? 'Nenhum registro encontrado.' : 'Selecione uma empresa na aba Empresas para emitir relatórios.'}</td></tr>}</tbody></table></div></div></motion.div>;
};

export default RelatoriosContabeis;
