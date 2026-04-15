import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, FileDown, Printer, X, Save, Edit, Trash2, RotateCcw, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { openPrintWindow, exportTablePdf, ReportExporter } from '@/utils/ReportExporter';
import { getSelectedEmpresaId } from './companyStorage';

const initialForm = { id:'', data:new Date().toISOString().split('T')[0], historico:'', tipo:'Manual', debito:'', credito:'', valorDebito:'', valorCredito:'' };
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const LancamentosContabeis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: entries = [], loading, fetchAll, create, update, remove } = useSupabaseCrud('contabilidade_lancamentos');
  const { data: empresas = [], fetchAll: fetchEmpresas } = useSupabaseCrud('contabilidade_empresas');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState(getSelectedEmpresaId());

  useEffect(() => {
    fetchAll(1, 1000);
    fetchEmpresas(1, 200);
    const handler = () => setSelectedEmpresaId(getSelectedEmpresaId());
    window.addEventListener('neny-contabilidade-empresa-change', handler);
    return () => window.removeEventListener('neny-contabilidade-empresa-change', handler);
  }, [fetchAll, fetchEmpresas]);

  const activeCompany = useMemo(() => empresas.find((empresa) => empresa.id === selectedEmpresaId) || null, [empresas, selectedEmpresaId]);
  const filteredEntries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return [...entries]
      .filter((entry) => !selectedEmpresaId || entry.company_id === selectedEmpresaId)
      .filter((entry) => (tipoFiltro === 'todos' || (entry.tipo || '') === tipoFiltro) && (!term || [entry.numero, entry.historico, entry.debito, entry.credito, entry.tipo].some((v)=>String(v || '').toLowerCase().includes(term))))
      .sort((a,b)=>new Date(`${b.data || 0}T12:00:00`) - new Date(`${a.data || 0}T12:00:00`));
  }, [entries, searchTerm, tipoFiltro, selectedEmpresaId]);
  const totals = useMemo(() => filteredEntries.reduce((acc, item) => { acc.total += 1; acc.debitos += Number(item.valor_debito || 0); acc.creditos += Number(item.valor_credito || 0); acc[item.tipo] = (acc[item.tipo] || 0) + 1; return acc; }, { total:0, debitos:0, creditos:0 }), [filteredEntries]);
  const resetForm = () => { setFormData(initialForm); setIsEditing(false); };

  const handleSave = async () => {
    if (!user) return;
    if (!selectedEmpresaId) return toast({ variant:'destructive', title:'Selecione uma empresa', description:'Defina a empresa ativa antes de lançar registros.' });
    if (!formData.data || !formData.historico || !formData.debito || !formData.credito || formData.valorDebito === '' || formData.valorCredito === '') return toast({ variant:'destructive', title:'Erro', description:'Preencha todos os campos obrigatórios.' });
    const valorDebito = Number(formData.valorDebito || 0), valorCredito = Number(formData.valorCredito || 0);
    if (valorDebito !== valorCredito) return toast({ variant:'destructive', title:'Erro', description:'Débito e crédito precisam ter o mesmo valor.' });
    const payload = { user_id:user.id, company_id:selectedEmpresaId, data:formData.data, historico:formData.historico.trim(), tipo:formData.tipo || 'Manual', debito:formData.debito.trim(), credito:formData.credito.trim(), valor_debito:valorDebito, valor_credito:valorCredito, updated_at:new Date().toISOString() };
    const saved = formData.id ? await update(formData.id, payload) : await create(payload);
    if (saved) { await fetchAll(1,1000); resetForm(); }
  };
  const handleReverse = async (entry) => {
    if (!user) return;
    const reverseEntry = { user_id:user.id, company_id:selectedEmpresaId, data:new Date().toISOString().split('T')[0], historico:`Estorno ref. lançamento #${entry.numero}`, tipo:'Estorno', debito:entry.credito, credito:entry.debito, valor_debito:Number(entry.valor_credito || 0), valor_credito:Number(entry.valor_debito || 0), updated_at:new Date().toISOString() };
    const saved = await create(reverseEntry); if (saved) await fetchAll(1,1000);
  };
  const handleDelete = async (id) => { if (!window.confirm('Deseja realmente excluir este lançamento?')) return; const success = await remove(id); if (success) await fetchAll(1,1000); };
  const handleEdit = (entry) => { setFormData({ id:entry.id, data:entry.data || new Date().toISOString().split('T')[0], historico:entry.historico || '', tipo:entry.tipo || 'Manual', debito:entry.debito || '', credito:entry.credito || '', valorDebito:entry.valor_debito ?? '', valorCredito:entry.valor_credito ?? '' }); setIsEditing(true); window.scrollTo({ top:0, behavior:'smooth' }); };
  const tableRows = filteredEntries.map((ent)=>[`#${ent.numero || '-'}`, ent.data ? new Date(`${ent.data}T12:00:00`).toLocaleDateString('pt-BR') : '-', ent.historico || '-', ent.tipo || '-', ent.debito || '-', ent.credito || '-', formatCurrency(ent.valor_debito)]);
  const summaryRows = [['Empresa', activeCompany?.nome_fantasia || '-'], ['Regime tributário', activeCompany?.regime_tributacao || '-'], ['Débitos', formatCurrency(totals.debitos)], ['Créditos', formatCurrency(totals.creditos)], ['Lançamentos', totals.total]];
  const handlePdf = () => exportTablePdf({ title:'Lançamentos Contábeis', subtitle:`Débitos: ${formatCurrency(totals.debitos)} • Créditos: ${formatCurrency(totals.creditos)}`, columns:['Nº','Data','Histórico','Tipo','Débito','Crédito','Valor'], rows:tableRows, filename:'lancamentos_contabeis.pdf', companyProfile:activeCompany, summaryRows });
  const handlePrint = () => openPrintWindow({ title:'Lançamentos Contábeis', subtitle:`Débitos: ${formatCurrency(totals.debitos)} • Créditos: ${formatCurrency(totals.creditos)}`, columns:['Nº','Data','Histórico','Tipo','Débito','Crédito','Valor'], rows:tableRows, companyProfile:activeCompany, summaryRows });
  const handleExcel = () => ReportExporter.exportToExcel('lancamentos_contabeis', { empresa:activeCompany?.nome_fantasia || '-', tipo:tipoFiltro, busca:searchTerm || '-' }, filteredEntries, [{ key:'numero',label:'Número'},{ key:'data',label:'Data'},{ key:'historico',label:'Histórico'},{ key:'tipo',label:'Tipo'},{ key:'debito',label:'Conta Débito'},{ key:'credito',label:'Conta Crédito'},{ key:'valor_debito',label:'Valor Débito'},{ key:'valor_credito',label:'Valor Crédito'}]);

  return <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">{!isEditing ? (<><div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4"><div><h2 className="text-2xl font-bold text-slate-900">Lançamentos Contábeis</h2><p className="text-slate-500 text-sm mt-1">Controle do diário por empresa, com partida dobrada simplificada.</p></div><div className="flex flex-wrap gap-3"><div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"><Building2 className="w-4 h-4 text-blue-700" /> {activeCompany?.nome_fantasia || 'Nenhuma empresa ativa'}</div><Button variant="outline" onClick={handlePrint} className="text-slate-700 border-slate-300 bg-white hover:bg-slate-50"><Printer className="w-4 h-4 mr-2" /> Imprimir</Button><Button variant="outline" onClick={handlePdf} className="text-slate-700 border-slate-300 bg-white hover:bg-slate-50"><FileDown className="w-4 h-4 mr-2" /> PDF</Button><Button variant="outline" onClick={handleExcel} className="text-slate-700 border-slate-300 bg-white hover:bg-slate-50"><FileDown className="w-4 h-4 mr-2" /> Excel</Button><Button onClick={() => { setFormData(initialForm); setIsEditing(true); }} className="bg-[#3b82f6] text-white"><Plus className="w-4 h-4 mr-2" /> Novo Lançamento</Button></div></div>
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"><div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><p className="text-slate-500 text-sm">Total de Lançamentos</p><p className="text-2xl font-bold text-slate-900 mt-1">{totals.total}</p></div><div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><p className="text-slate-500 text-sm">Débitos</p><p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(totals.debitos)}</p></div><div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><p className="text-slate-500 text-sm">Créditos</p><p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(totals.creditos)}</p></div><div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><p className="text-slate-500 text-sm">Estornos</p><p className="text-2xl font-bold text-amber-500 mt-1">{totals.Estorno || 0}</p></div></div>
  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col lg:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900" placeholder="Buscar número, histórico ou conta..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} /></div><select className="min-w-[200px] px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900" value={tipoFiltro} onChange={(e)=>setTipoFiltro(e.target.value)}><option value="todos">Todos os tipos</option><option value="Manual">Manual</option><option value="Automático">Automático</option><option value="Estorno">Estorno</option></select></div>
  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left text-slate-900"><thead className="bg-slate-50"><tr><th className="p-4">Nº</th><th className="p-4">Data</th><th className="p-4">Histórico</th><th className="p-4">Tipo</th><th className="p-4">Débito</th><th className="p-4">Crédito</th><th className="p-4">Valor</th><th className="p-4">Ações</th></tr></thead><tbody>{filteredEntries.length ? filteredEntries.map((entry)=><tr key={entry.id} className="hover:bg-slate-50 border-b border-white/5"><td className="p-4">#{entry.numero || '-'}</td><td className="p-4">{entry.data ? new Date(`${entry.data}T12:00:00`).toLocaleDateString('pt-BR') : '-'}</td><td className="p-4 max-w-[280px]">{entry.historico}</td><td className="p-4">{entry.tipo}</td><td className="p-4">{entry.debito}</td><td className="p-4">{entry.credito}</td><td className="p-4">{formatCurrency(entry.valor_debito)}</td><td className="p-4"><div className="flex gap-2"><Button size="icon" variant="ghost" onClick={()=>handleEdit(entry)}><Edit className="w-4 h-4" /></Button><Button size="icon" variant="ghost" onClick={()=>handleReverse(entry)}><RotateCcw className="w-4 h-4 text-amber-500" /></Button><Button size="icon" variant="ghost" onClick={()=>handleDelete(entry.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button></div></td></tr>) : <tr><td colSpan="8" className="p-8 text-center text-slate-500">{selectedEmpresaId ? 'Nenhum lançamento encontrado.' : 'Selecione uma empresa na aba Empresas para lançar registros.'}</td></tr>}</tbody></table></div></div></>) : (<div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto"><div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold text-slate-900">{formData.id ? 'Editar' : 'Novo'} Lançamento</h3><Button size="icon" variant="ghost" onClick={resetForm}><X className="w-4 h-4 text-slate-900" /></Button></div><div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 mb-4">Empresa vinculada: <strong>{activeCompany?.nome_fantasia || 'Nenhuma empresa ativa'}</strong>{activeCompany?.regime_tributacao ? ` • ${activeCompany.regime_tributacao}` : ''}</div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><input type="date" value={formData.data || ''} onChange={(e)=>setFormData({...formData,data:e.target.value})} className="input-field" /><select value={formData.tipo || 'Manual'} onChange={(e)=>setFormData({...formData,tipo:e.target.value})} className="input-field"><option value="Manual">Manual</option><option value="Automático">Automático</option><option value="Estorno">Estorno</option></select><input placeholder="Conta Débito *" value={formData.debito || ''} onChange={(e)=>setFormData({...formData,debito:e.target.value})} className="input-field" /><input type="number" step="0.01" min="0" placeholder="Valor Débito *" value={formData.valorDebito || ''} onChange={(e)=>setFormData({...formData,valorDebito:e.target.value})} className="input-field" /><input placeholder="Conta Crédito *" value={formData.credito || ''} onChange={(e)=>setFormData({...formData,credito:e.target.value})} className="input-field" /><input type="number" step="0.01" min="0" placeholder="Valor Crédito *" value={formData.valorCredito || ''} onChange={(e)=>setFormData({...formData,valorCredito:e.target.value})} className="input-field" /><textarea placeholder="Histórico *" value={formData.historico || ''} onChange={(e)=>setFormData({...formData,historico:e.target.value})} className="input-field md:col-span-2 min-h-[100px]" /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={resetForm} className="text-slate-700 border-slate-300 bg-white hover:bg-slate-50">Cancelar</Button><Button disabled={loading} onClick={handleSave} className="bg-[#3b82f6] text-white"><Save className="w-4 h-4 mr-2" />Salvar</Button></div></div>)}</motion.div>;
};

export default LancamentosContabeis;
