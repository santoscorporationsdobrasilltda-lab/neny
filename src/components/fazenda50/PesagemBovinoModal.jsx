import React, { useMemo, useState } from 'react';
import { X, Save, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const initialForm = {
  data: new Date().toISOString().split('T')[0],
  peso: '',
  unidade: 'kg',
  tipo_pesagem: 'Curral',
  ganho_peso: '',
  responsavel: '',
  observacoes: '',
};

const fmtDate = (value) => (value ? new Date(value).toLocaleDateString('pt-BR') : '-');

const PesagemBovinoModal = ({ animal, records = [], onClose, onSaved }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { create } = useSupabaseCrud('fazenda50_bovinos_pesagens');

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const recentRecords = useMemo(
    () => [...records].sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0)).slice(0, 6),
    [records]
  );

  const handleSave = async () => {
    if (!user || !animal?.id) return;

    if (!formData.data || !formData.peso) {
      toast({
        title: 'Erro',
        description: 'Preencha a data e o peso do animal.',
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
      peso: Number(formData.peso || 0),
      unidade: formData.unidade || 'kg',
      tipo_pesagem: formData.tipo_pesagem || 'Curral',
      ganho_peso: formData.ganho_peso === '' ? null : Number(formData.ganho_peso),
      responsavel: formData.responsavel?.trim() || null,
      observacoes: formData.observacoes?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const saved = await create(payload);
    setSaving(false);

    if (saved) {
      toast({
        title: '✅ Pesagem registrada',
        description: 'A pesagem do bovino foi salva com sucesso.',
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
            <h3 className="text-lg font-bold text-slate-800">Registrar Pesagem</h3>
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Peso</label>
              <input type="number" step="0.01" className="w-full p-2 border rounded-lg" value={formData.peso} onChange={(e) => setFormData({ ...formData, peso: e.target.value })} placeholder="Ex: 420" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Unidade</label>
              <select className="w-full p-2 border rounded-lg" value={formData.unidade} onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}>
                <option value="kg">kg</option>
                <option value="@">@</option>
                <option value="g">g</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de pesagem</label>
              <select className="w-full p-2 border rounded-lg" value={formData.tipo_pesagem} onChange={(e) => setFormData({ ...formData, tipo_pesagem: e.target.value })}>
                <option>Curral</option>
                <option>Balança</option>
                <option>Estimativa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Ganho de peso</label>
              <input type="number" step="0.01" className="w-full p-2 border rounded-lg" value={formData.ganho_peso} onChange={(e) => setFormData({ ...formData, ganho_peso: e.target.value })} placeholder="Opcional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Responsável</label>
              <input type="text" className="w-full p-2 border rounded-lg" value={formData.responsavel} onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })} placeholder="Nome do responsável" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
            <textarea className="w-full p-3 border rounded-lg min-h-[110px]" value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} placeholder="Detalhes adicionais da pesagem" />
          </div>

          <div className="border rounded-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-slate-700 font-semibold">
              <Scale className="w-4 h-4" /> Últimas pesagens
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b border-slate-100 text-slate-600">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Peso</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Ganho</th>
                    <th className="p-3">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRecords.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-slate-500">Nenhuma pesagem registrada para este animal.</td></tr>
                  ) : recentRecords.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3">{fmtDate(item.data)}</td>
                      <td className="p-3">{item.peso ?? '-'} {item.unidade || ''}</td>
                      <td className="p-3">{item.tipo_pesagem || '-'}</td>
                      <td className="p-3">{item.ganho_peso ?? '-'}</td>
                      <td className="p-3">{item.responsavel || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Pesagem'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PesagemBovinoModal;
