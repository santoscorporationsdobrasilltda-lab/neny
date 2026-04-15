import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, FileDown, Printer, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { exportTablePdf, openPrintWindow } from '@/utils/ReportExporter';
import { getSelectedEmpresaId } from './companyStorage';

const money = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(Number(v || 0));

const DemonstracoesContabeis = () => {
  const { data: contas = [], fetchAll: fetchContas } = useSupabaseCrud('contabilidade_contas');
  const { data: empresas = [], fetchAll: fetchEmpresas } = useSupabaseCrud('contabilidade_empresas');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState(getSelectedEmpresaId());
  const [view, setView] = useState('dre');

  useEffect(() => {
    fetchContas(1,1000); fetchEmpresas(1,200);
    const handler = () => setSelectedEmpresaId(getSelectedEmpresaId());
    window.addEventListener('neny-contabilidade-empresa-change', handler);
    return () => window.removeEventListener('neny-contabilidade-empresa-change', handler);
  }, [fetchContas, fetchEmpresas]);

  const activeCompany = useMemo(() => empresas.find((empresa)=>empresa.id===selectedEmpresaId) || null, [empresas, selectedEmpresaId]);
  const companyAccounts = useMemo(() => contas.filter((acc)=>!selectedEmpresaId || acc.company_id === selectedEmpresaId), [contas, selectedEmpresaId]);

  const metrics = useMemo(() => {
    const receita = companyAccounts.filter((c)=>(c.tipo||'').toLowerCase()==='receita').reduce((s,c)=>s+Number(c.saldo || 0),0);
    const despesa = companyAccounts.filter((c)=>(c.tipo||'').toLowerCase()==='despesa').reduce((s,c)=>s+Number(c.saldo || 0),0);
    const ativo = companyAccounts.filter((c)=>(c.tipo||'').toLowerCase()==='ativo').reduce((s,c)=>s+Number(c.saldo || 0),0);
    const passivo = companyAccounts.filter((c)=>(c.tipo||'').toLowerCase()==='passivo').reduce((s,c)=>s+Number(c.saldo || 0),0);
    const pl = companyAccounts.filter((c)=>(c.tipo||'').toLowerCase().includes('patrim')).reduce((s,c)=>s+Number(c.saldo || 0),0);
    return { receita, despesa, resultado: receita - despesa, ativo, passivo, pl };
  }, [companyAccounts]);

  const dreRows = [
    ['Receitas', money(metrics.receita)],
    ['Despesas', money(metrics.despesa)],
    ['Resultado Líquido', money(metrics.resultado)],
  ];
  const balancoRows = [
    ['Ativo', money(metrics.ativo)],
    ['Passivo', money(metrics.passivo)],
    ['Patrimônio Líquido', money(metrics.pl)],
  ];

  const exportCurrent = (type) => {
    const isDre = type === 'dre';
    const rows = isDre ? dreRows : balancoRows;
    const title = isDre ? 'DRE Simplificada' : 'Balanço Simplificado';
    const summaryRows = [['Empresa', activeCompany?.nome_fantasia || '-'], ['Regime tributário', activeCompany?.regime_tributacao || '-']];
    exportTablePdf({ title, subtitle:`Demonstração consolidada por empresa`, columns:['Descrição','Valor'], rows, filename:`${title.toLowerCase().replace(/\s+/g,'_')}.pdf`, companyProfile:activeCompany, summaryRows });
  };
  const printCurrent = (type) => {
    const isDre = type === 'dre';
    const rows = isDre ? dreRows : balancoRows;
    const title = isDre ? 'DRE Simplificada' : 'Balanço Simplificado';
    const summaryRows = [['Empresa', activeCompany?.nome_fantasia || '-'], ['Regime tributário', activeCompany?.regime_tributacao || '-']];
    openPrintWindow({ title, subtitle:`Demonstração consolidada por empresa`, columns:['Descrição','Valor'], rows, companyProfile:activeCompany, summaryRows });
  };

  return <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6"><div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4"><div><h2 className="text-2xl font-bold text-slate-900">Demonstrações Contábeis</h2><p className="text-slate-500 text-sm mt-1">DRE e balanço simplificados com identificação da empresa e regime tributário.</p></div><div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"><Building2 className="w-4 h-4 text-blue-700" /> {activeCompany?.nome_fantasia || 'Nenhuma empresa ativa'}</div></div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4"><p className="text-sm text-slate-500">Receitas</p><p className="mt-1 text-2xl font-bold text-emerald-700">{money(metrics.receita)}</p></div><div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4"><p className="text-sm text-slate-500">Despesas</p><p className="mt-1 text-2xl font-bold text-rose-700">{money(metrics.despesa)}</p></div><div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4"><p className="text-sm text-slate-500">Resultado</p><p className="mt-1 text-2xl font-bold text-blue-700">{money(metrics.resultado)}</p></div></div>
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"><div className="flex flex-wrap items-center gap-3 justify-between mb-4"><div className="flex items-center gap-2 text-slate-900 font-semibold"><Landmark className="w-4 h-4 text-blue-700" /> Demonstrações</div><div className="flex gap-2"><Button variant={view==='dre'?'default':'outline'} onClick={()=>setView('dre')}>DRE</Button><Button variant={view==='balanco'?'default':'outline'} onClick={()=>setView('balanco')}>Balanço</Button><Button variant="outline" onClick={()=>printCurrent(view)}><Printer className="w-4 h-4 mr-2" />Imprimir</Button><Button variant="outline" onClick={()=>exportCurrent(view)}><FileDown className="w-4 h-4 mr-2" />PDF</Button></div></div><div className="rounded-xl border border-slate-200 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50"><tr><th className="p-4">Descrição</th><th className="p-4">Valor</th></tr></thead><tbody>{(view==='dre'?dreRows:balancoRows).map((row, idx)=><tr key={idx} className="border-b border-slate-100"><td className="p-4 text-slate-800">{row[0]}</td><td className="p-4 font-semibold text-slate-900">{row[1]}</td></tr>)}</tbody></table></div></div></motion.div>;
};

export default DemonstracoesContabeis;
