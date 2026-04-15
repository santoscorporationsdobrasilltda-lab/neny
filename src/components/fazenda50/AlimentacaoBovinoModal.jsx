import React, { useMemo, useState } from 'react';
import { X, Save, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const initialForm = {
  data: new Date().toISOString().split('T')[0],
  tipo_alimentacao: '',
  produto: '',
  quantidade: '',
  unidade: 'kg',
  frequencia: '',
  periodo: '',
  responsavel: '',
  observacoes: '',
};

const fmtDate = (value) => (value ? new Date(value).toLocaleDateString('pt-BR') : '-');

const AlimentacaoBovinoModal = ({ animal, records = [], onClose, onSaved }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { create } = useSupabaseCrud('fazenda50_bovinos_alimentacao_adicional');

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const recentRecords = useMemo(
    () => [...records].sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0)).slice(0, 6),
    [records]
  );

  const handleSave = async () => {
    if (!user || !animal?.id) return;

    if (!formData.data || !formData.tipo_alimentacao || !formData.quantidade) {
      toast({
        title: 'Erro',
        description: 'Preencha a data, o tipo da alimentação e a quantidade.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    const payload = {
      user_id: user.id,
      bovino_id: animal.id,
      fazenda_id: animal.fazenda_id || animal.fazendaData?.id || null,
      data: formData.data,
      tipo_alimentacao: formData.tipo_alimentacao.trim(),
      produto: formData.produto?.trim() || null,
      quantidade: Number(formData.quantidade || 0),
      unidade: formData.unidade || 'kg',
      frequencia: formData.frequencia?.trim() || null,
      periodo: formData.periodo?.trim() || null,
      responsavel: formData.responsavel?.trim() || null,
      observacoes: formData.observacoes?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const saved = await create(payload);
    setSaving(false);

    if (saved) {
      toast({
        title: '✅ Alimentação registrada',
        description: 'O lançamento de alimentação foi salvo com sucesso.',
      });
      onSaved?.();
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[92vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Registrar Alimentação Adicional</h3>
            <p className="text-sm text-slate-500">{animal?.nome || '-'} • Brinco {animal?.brinco || '-'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(92vh-80px)] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data</label>
              <input type="date" className="w-full p-2 border rounded-lg" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo da alimentação</label>
              <input type="text" className="w-full p-2 border rounded-lg" value={formData.tipo_alimentacao} onChange={(e) => setFormData({ ...formData, tipo_alimentacao: e.target.value })} placeholder="Ex: Ração, sal mineral, suplemento" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Produto</label>
              <input type="text" className="w-full p-2 border rounded-lg" value={formData.produto} onChange={(e) => setFormData({ ...formData, produto: e.target.value })} placeholder="Marca ou descrição" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Quantidade</label>
              <input type="number" step="0.01" className="w-full p-2 border rounded-lg" value={formData.quantidade} onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })} placeholder="Ex: 5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Unidade</label>
              <select className="w-full p-2 border rounded-lg" value={formData.unidade} onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="saca">saca</option>
                <option value="litro">litro</option>
                <option value="un">un</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Frequência</label>
              <input type="text" className="w-full p-2 border rounded-lg" value={formData.frequencia} onChange={(e) => setFormData({ ...formData, frequencia: e.target.value })} placeholder="Ex: diária, semanal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Período</label>
              <input type="text" className="w-full p-2 border rounded-lg" value={formData.periodo} onChange={(e) => setFormData({ ...formData, periodo: e.target.value })} placeholder="Ex: 30 dias, seca" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Responsável</label>
              <input type="text" className="w-full p-2 border rounded-lg" value={formData.responsavel} onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })} placeholder="Nome do responsável" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
            <textarea className="w-full p-3 border rounded-lg min-h-[110px]" value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} placeholder="Detalhes adicionais da alimentação" />
          </div>

          <div className="border rounded-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-slate-700 font-semibold">
              <UtensilsCrossed className="w-4 h-4" /> Últimos lançamentos
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b border-slate-100 text-slate-600">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Produto</th>
                    <th className="p-3">Quantidade</th>
                    <th className="p-3">Frequência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRecords.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-slate-500">Nenhum lançamento de alimentação para este animal.</td></tr>
                  ) : recentRecords.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3">{fmtDate(item.data)}</td>
                      <td className="p-3">{item.tipo_alimentacao || '-'}</td>
                      <td className="p-3">{item.produto || '-'}</td>
                      <td className="p-3">{item.quantidade ?? '-'} {item.unidade || ''}</td>
                      <td className="p-3">{item.frequencia || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alimentação'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlimentacaoBovinoModal;
