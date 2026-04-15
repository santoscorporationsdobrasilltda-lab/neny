import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { DollarSign, Edit, Save, Trash2, X } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import RelatorioFinanceiroTab from './RelatorioFinanceiroTab';
import { useFazendaContext } from './FazendaContext';

const initialFormBase = {
  id: '',
  data: new Date().toISOString().split('T')[0],
  tipo: 'Despesa',
  categoria: 'Outro',
  descricao: '',
  valor: '',
  formaPagamento: 'Dinheiro',
  centroCusto: 'Geral',
  fazendaId: '',
  fazenda: '',
  observacoes: '',
};

const FinanceiroFazendaTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: transactions, fetchAll, create, update, remove } = useSupabaseCrud('fazenda50_financeiro');
  const { fazendas, selectedFarm, selectedFarmId, matchesSelectedFarm, getFarmByRecord } = useFazendaContext();

  const [showReport, setShowReport] = useState(false);
  const [formData, setFormData] = useState({ ...initialFormBase, fazendaId: selectedFarmId || '', fazenda: selectedFarm?.nome || '' });

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  useEffect(() => {
    if (!formData.id && selectedFarmId) {
      setFormData((prev) => ({ ...prev, fazendaId: prev.fazendaId || selectedFarmId, fazenda: prev.fazenda || selectedFarm?.nome || '' }));
    }
  }, [selectedFarmId, selectedFarm, formData.id]);

  const resetForm = () => setFormData({ ...initialFormBase, fazendaId: selectedFarmId || '', fazenda: selectedFarm?.nome || '' });
  const resolveFarm = (record) => {
    if (record?.fazendaId) return fazendas.find((item) => item.id === record.fazendaId) || null;
    if (record?.fazenda_id) return fazendas.find((item) => item.id === record.fazenda_id) || getFarmByRecord(record);
    if (record?.fazenda) return fazendas.find((item) => item.nome === record.fazenda) || null;
    return null;
  };

  const visibleTransactions = useMemo(() => transactions.filter((item) => matchesSelectedFarm(item)), [transactions, matchesSelectedFarm]);

  const financialSummary = useMemo(() => {
    const receitas = visibleTransactions.filter((item) => item.tipo === 'Receita').reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const despesas = visibleTransactions.filter((item) => item.tipo === 'Despesa').reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const byActivity = visibleTransactions.reduce((acc, item) => {
      const key = item.centro_custo || item.categoria || 'Geral';
      acc[key] = (acc[key] || 0) + Number(item.valor || 0);
      return acc;
    }, {});
    return { receitas, despesas, saldo: receitas - despesas, byActivity: Object.entries(byActivity).sort((a, b) => b[1] - a[1]).slice(0, 4) };
  }, [visibleTransactions]);

  const orderedTransactions = useMemo(() => [...visibleTransactions].sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0)), [visibleTransactions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.valor || !formData.descricao) {
      toast({ title: 'Erro', description: 'Descrição e valor são obrigatórios.', variant: 'destructive' });
      return;
    }

    const fazendaData = resolveFarm(formData) || selectedFarm;
    const payload = {
      user_id: user.id,
      data: formData.data || null,
      tipo: formData.tipo,
      categoria: formData.categoria || null,
      descricao: formData.descricao,
      valor: formData.valor ? Number(formData.valor) : 0,
      forma_pagamento: formData.formaPagamento || null,
      centro_custo: formData.centroCusto || null,
      fazenda_id: fazendaData?.id || null,
      fazenda: fazendaData?.nome || formData.fazenda || null,
      observacoes: formData.observacoes || null,
      updated_at: new Date().toISOString(),
    };

    const saved = formData.id ? await update(formData.id, payload) : await create(payload);
    if (!saved) return;
    await fetchAll();
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir transação?')) return;
    const ok = await remove(id);
    if (ok) await fetchAll();
  };

  const handleEdit = (item) => {
    const farm = resolveFarm(item);
    setFormData({
      id: item.id,
      data: item.data ? String(item.data).slice(0, 10) : new Date().toISOString().split('T')[0],
      tipo: item.tipo || 'Despesa',
      categoria: item.categoria || 'Outro',
      descricao: item.descricao || '',
      valor: item.valor ?? '',
      formaPagamento: item.forma_pagamento || 'Dinheiro',
      centroCusto: item.centro_custo || 'Geral',
      fazendaId: item.fazenda_id || farm?.id || '',
      fazenda: item.fazenda || farm?.nome || '',
      observacoes: item.observacoes || '',
    });
    setShowReport(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-end">
        <Button variant={!showReport ? 'default' : 'outline'} onClick={() => setShowReport(false)}>Lançamentos</Button>
        <Button variant={showReport ? 'default' : 'outline'} onClick={() => setShowReport(true)}>Relatórios</Button>
      </div>

      {showReport ? (
        <RelatorioFinanceiroTab transactions={orderedTransactions} selectedFarm={selectedFarm} />
      ) : (
        <>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl bg-green-50 border border-green-200 p-4"><p className="text-sm text-green-700">Receitas</p><p className="text-2xl font-bold text-green-800">R$ {financialSummary.receitas.toFixed(2)}</p></div>
              <div className="rounded-xl bg-red-50 border border-red-200 p-4"><p className="text-sm text-red-700">Despesas</p><p className="text-2xl font-bold text-red-800">R$ {financialSummary.despesas.toFixed(2)}</p></div>
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4"><p className="text-sm text-blue-700">Saldo</p><p className="text-2xl font-bold text-blue-800">R$ {financialSummary.saldo.toFixed(2)}</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {financialSummary.byActivity.map(([atividade, total]) => (
                <div key={atividade} className="rounded-xl bg-slate-50 border border-slate-200 p-4"><p className="text-sm text-slate-500">{atividade}</p><p className="text-lg font-bold text-slate-800 mt-1">R$ {Number(total).toFixed(2)}</p></div>
              ))}
            </div>

            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" />{formData.id ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
                <p className="text-sm text-slate-500">{selectedFarm ? `A fazenda ${selectedFarm.nome} está em foco.` : 'Lançamento consolidado entre fazendas.'}</p>
              </div>
              {formData.id && <Button variant="ghost" size="sm" onClick={resetForm}><X className="w-4 h-4 mr-2" />Cancelar</Button>}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Tipo</label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" checked={formData.tipo === 'Receita'} onChange={() => setFormData({ ...formData, tipo: 'Receita' })} /><span className="text-green-600 font-bold">Receita</span></label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" checked={formData.tipo === 'Despesa'} onChange={() => setFormData({ ...formData, tipo: 'Despesa' })} /><span className="text-red-600 font-bold">Despesa</span></label>
                </div>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Data</label><input className="w-full p-2 border rounded" type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Categoria</label><input className="w-full p-2 border rounded" value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Valor</label><input className="w-full p-2 border rounded" type="number" step="0.01" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="text-sm font-medium mb-1 block">Descrição</label><input className="w-full p-2 border rounded" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Forma de pagamento</label><input className="w-full p-2 border rounded" value={formData.formaPagamento} onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Centro de custo</label><input className="w-full p-2 border rounded" value={formData.centroCusto} onChange={(e) => setFormData({ ...formData, centroCusto: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Fazenda</label><select className="w-full p-2 border rounded" value={formData.fazendaId} onChange={(e) => { const farm = fazendas.find((item) => item.id === e.target.value) || null; setFormData((prev) => ({ ...prev, fazendaId: e.target.value, fazenda: farm?.nome || '' })); }}><option value="">Selecione a fazenda</option>{fazendas.filter((item) => item.ativo !== false).map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div>
              <div className="md:col-span-4"><label className="text-sm font-medium mb-1 block">Observações</label><textarea className="w-full p-2 border rounded min-h-[90px]" value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} /></div>
              <div className="md:col-span-4 flex justify-end"><Button type="submit"><Save className="w-4 h-4 mr-2" />Salvar lançamento</Button></div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-700">Movimentações ({orderedTransactions.length})</h3>
                <p className="text-sm text-slate-500">{selectedFarm ? `Mostrando somente ${selectedFarm.nome}.` : 'Consolidado financeiro rural.'}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200"><tr><th className="p-4">Data</th><th className="p-4">Tipo</th><th className="p-4">Categoria</th><th className="p-4">Descrição</th><th className="p-4">Fazenda</th><th className="p-4">Valor</th><th className="p-4 text-right">Ações</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {orderedTransactions.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-slate-500">Nenhuma movimentação encontrada.</td></tr> : orderedTransactions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-4">{item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}</td>
                      <td className="p-4">{item.tipo}</td>
                      <td className="p-4">{item.categoria || '-'}</td>
                      <td className="p-4">{item.descricao || '-'}</td>
                      <td className="p-4">{item.fazenda || resolveFarm(item)?.nome || '-'}</td>
                      <td className="p-4 font-semibold">R$ {Number(item.valor || 0).toFixed(2)}</td>
                      <td className="p-4 text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button><Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinanceiroFazendaTab;
