import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, FileDown, Printer, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { openPrintWindow, exportTablePdf, ReportExporter } from '@/utils/ReportExporter';
import { getSelectedEmpresaId } from './companyStorage';

const initialForm = { id: '', codigo: '', nome: '', tipo: 'Ativo', saldo: '' };
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const PlanoContas = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: accounts = [], loading, fetchAll, create, update, remove } = useSupabaseCrud('contabilidade_contas');
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

  const filteredAccounts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return [...accounts]
      .filter((acc) => !selectedEmpresaId || acc.company_id === selectedEmpresaId)
      .filter((acc) => {
        const matchesTipo = tipoFiltro === 'todos' || (acc.tipo || '') === tipoFiltro;
        const matchesSearch = !term || [acc.codigo, acc.nome, acc.tipo].some((value) => String(value || '').toLowerCase().includes(term));
        return matchesTipo && matchesSearch;
      })
      .sort((a, b) => (a.codigo || '').localeCompare(b.codigo || ''));
  }, [accounts, searchTerm, tipoFiltro, selectedEmpresaId]);

  const resumo = useMemo(() => filteredAccounts.reduce((acc, item) => {
    const saldo = Number(item.saldo || 0); acc.total += 1; acc.saldo += saldo; acc[item.tipo] = (acc[item.tipo] || 0) + 1; return acc;
  }, { total: 0, saldo: 0 }), [filteredAccounts]);

  const resetForm = () => { setFormData(initialForm); setIsEditing(false); };

  const handleSave = async () => {
    if (!user) return;
    if (!selectedEmpresaId) {
      toast({ variant: 'destructive', title: 'Selecione uma empresa', description: 'Defina a empresa ativa na aba Empresas antes de cadastrar contas.' });
      return;
    }
    if (!formData.codigo || !formData.nome) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Preencha código e nome da conta.' });
      return;
    }
    const payload = { user_id: user.id, company_id: selectedEmpresaId, codigo: formData.codigo.trim(), nome: formData.nome.trim(), tipo: formData.tipo || null, saldo: formData.saldo === '' ? null : Number(formData.saldo || 0), updated_at: new Date().toISOString() };
    const saved = formData.id ? await update(formData.id, payload) : await create(payload);
    if (saved) { await fetchAll(1, 1000); resetForm(); }
  };

  const handleDelete = async (id) => { if (!window.confirm('Deseja excluir esta conta?')) return; const ok = await remove(id); if (ok) await fetchAll(1, 1000); };

  const summaryRows = [
    ['Empresa', activeCompany?.nome_fantasia || '-'],
    ['Regime tributário', activeCompany?.regime_tributacao || '-'],
    ['Saldo consolidado', formatCurrency(resumo.saldo)],
    ['Total de contas', resumo.total],
  ];

  const tableRows = filteredAccounts.map((acc) => [acc.codigo || '-', acc.nome || '-', acc.tipo || '-', formatCurrency(acc.saldo)]);

  const handlePrint = () => openPrintWindow({ title: 'Plano de Contas', subtitle: `Contas: ${filteredAccounts.length}`, columns: ['Código', 'Conta', 'Tipo', 'Saldo'], rows: tableRows, companyProfile: activeCompany, summaryRows });
  const handlePdf = () => exportTablePdf({ title: 'Plano de Contas', subtitle: `Contas: ${filteredAccounts.length}`, columns: ['Código', 'Conta', 'Tipo', 'Saldo'], rows: tableRows, filename: 'plano_contas.pdf', companyProfile: activeCompany, summaryRows });
  const handleExcel = () => ReportExporter.exportToExcel('plano_contas', { empresa: activeCompany?.nome_fantasia || '-', tipo: tipoFiltro, busca: searchTerm || '-' }, filteredAccounts, [{ key:'codigo',label:'Código'},{key:'nome',label:'Conta'},{key:'tipo',label:'Tipo'},{key:'saldo',label:'Saldo'}]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {!isEditing ? (
        <>
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Plano de Contas</h2>
              <p className="text-slate-500 text-sm mt-1">Estrutura de contas por empresa, incluindo o regime tributário nos relatórios.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"><Building2 className="w-4 h-4 text-blue-700" /> {activeCompany?.nome_fantasia || 'Nenhuma empresa ativa'}</div>
              <Button variant="outline" onClick={handlePrint} className="text-slate-700 border-slate-300 bg-white hover:bg-slate-50"><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
              <Button variant="outline" onClick={handlePdf} className="text-slate-700 border-slate-300 bg-white hover:bg-slate-50"><FileDown className="w-4 h-4 mr-2" /> PDF</Button>
              <Button variant="outline" onClick={handleExcel} className="text-slate-700 border-slate-300 bg-white hover:bg-slate-50"><FileDown className="w-4 h-4 mr-2" /> Excel</Button>
              <Button onClick={() => { setFormData(initialForm); setIsEditing(true); }} className="bg-[#3b82f6] text-white"><Plus className="w-4 h-4 mr-2" /> Nova Conta</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><p className="text-slate-500 text-sm">Total de Contas</p><p className="text-2xl font-bold text-slate-900 mt-1">{resumo.total}</p></div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><p className="text-slate-500 text-sm">Ativo</p><p className="text-2xl font-bold text-blue-700 mt-1">{resumo.Ativo || 0}</p></div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><p className="text-slate-500 text-sm">Passivo</p><p className="text-2xl font-bold text-rose-700 mt-1">{resumo.Passivo || 0}</p></div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"><p className="text-slate-500 text-sm">Saldo Consolidado</p><p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(resumo.saldo)}</p></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900" placeholder="Buscar por código, nome ou tipo..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} /></div>
            <select className="min-w-[200px] px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900" value={tipoFiltro} onChange={(e)=>setTipoFiltro(e.target.value)}><option value="todos">Todos os tipos</option><option value="Ativo">Ativo</option><option value="Passivo">Passivo</option><option value="Receita">Receita</option><option value="Despesa">Despesa</option><option value="Patrimônio Líquido">Patrimônio Líquido</option></select>
          </div>
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            {loading ? <p className="p-4 text-slate-900">Carregando...</p> : <div className="overflow-x-auto"><table className="w-full text-left text-slate-900"><thead className="bg-slate-50"><tr><th className="p-4">Código</th><th className="p-4">Conta</th><th className="p-4">Tipo</th><th className="p-4">Saldo</th><th className="p-4">Ações</th></tr></thead><tbody>{filteredAccounts.length ? filteredAccounts.map((acc)=><tr key={acc.id} className="hover:bg-slate-50 border-b border-white/5"><td className="p-4">{acc.codigo}</td><td className="p-4">{acc.nome}</td><td className="p-4">{acc.tipo}</td><td className="p-4">{formatCurrency(acc.saldo)}</td><td className="p-4"><div className="flex gap-2"><Button size="icon" variant="ghost" onClick={()=>{setFormData({ id: acc.id, codigo: acc.codigo||'', nome: acc.nome||'', tipo: acc.tipo||'Ativo', saldo: acc.saldo ?? '' }); setIsEditing(true);}}><Edit className="w-4 h-4"/></Button><Button size="icon" variant="ghost" onClick={()=>handleDelete(acc.id)}><Trash2 className="w-4 h-4 text-red-400"/></Button></div></td></tr>) : <tr><td colSpan="5" className="p-8 text-center text-slate-500">{selectedEmpresaId ? 'Nenhuma conta encontrada.' : 'Selecione uma empresa na aba Empresas para visualizar o plano de contas.'}</td></tr>}</tbody></table></div>}
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold text-slate-900">{formData.id ? 'Editar' : 'Nova'} Conta</h3><Button size="icon" variant="ghost" onClick={resetForm}><X className="w-4 h-4 text-slate-900" /></Button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input placeholder="Código *" value={formData.codigo} onChange={(e)=>setFormData({...formData,codigo:e.target.value})} className="input-field" />
            <input placeholder="Nome da conta *" value={formData.nome} onChange={(e)=>setFormData({...formData,nome:e.target.value})} className="input-field" />
            <select value={formData.tipo} onChange={(e)=>setFormData({...formData,tipo:e.target.value})} className="input-field"><option>Ativo</option><option>Passivo</option><option>Receita</option><option>Despesa</option><option>Patrimônio Líquido</option></select>
            <input type="number" step="0.01" placeholder="Saldo inicial" value={formData.saldo} onChange={(e)=>setFormData({...formData,saldo:e.target.value})} className="input-field" />
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 mb-4">Empresa vinculada: <strong>{activeCompany?.nome_fantasia || 'Nenhuma empresa ativa'}</strong>{activeCompany?.regime_tributacao ? ` • ${activeCompany.regime_tributacao}` : ''}</div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={resetForm}>Cancelar</Button><Button disabled={loading} onClick={handleSave} className="bg-[#3b82f6] text-white">Salvar</Button></div>
        </div>
      )}
    </motion.div>
  );
};

export default PlanoContas;
