import React, { useMemo, useState } from 'react';
import { X, Save, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const initialForm = {
  data_prevista: new Date().toISOString().split('T')[0],
  finalidade: '',
  origem: '',
  destino: '',
  transportador: '',
  motorista: '',
  placa_veiculo: '',
  quantidade_animais: '1',
  status: 'Rascunho',
  observacoes: '',
};

const fmtDate = (value) => (value ? new Date(value).toLocaleDateString('pt-BR') : '-');

const PreGtaBovinoModal = ({ animal, records = [], onClose, onSaved }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { create } = useSupabaseCrud('fazenda50_bovinos_pre_gta');

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const recentRecords = useMemo(
    () => [...records].sort((a, b) => new Date(b.data_prevista || 0) - new Date(a.data_prevista || 0)).slice(0, 6),
    [records]
  );

  const handleSave = async () => {
    if (!user || !animal?.id) return;

    if (!formData.data_prevista || !formData.finalidade) {
      toast({
        title: 'Erro',
        description: 'Preencha a data prevista e a finalidade da pré-GTA.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    const payload = {
      user_id: user.id,
      bovino_id: animal.id,
      fazenda_id: animal.fazenda_id || animal.fazendaData?.id || null,
      data_prevista: formData.data_prevista,
      finalidade: formData.finalidade.trim(),
      origem: formData.origem?.trim() || null,
      destino: formData.destino?.trim() || null,
      transportador: formData.transportador?.trim() || null,
      motorista: formData.motorista?.trim() || null,
      placa_veiculo: formData.placa_veiculo?.trim() || null,
      quantidade_animais: Number(formData.quantidade_animais || 1),
      status: formData.status || 'Rascunho',
      observacoes: formData.observacoes?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const saved = await create(payload);
    setSaving(false);

    if (saved) {
      toast({
        title: '✅ Pré-GTA registrada',
        description: 'O pré-registro de GTA foi salvo com sucesso.',
      });
      onSaved?.();
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[92vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Pré-Registro de GTA</h3>
            <p className="text-sm text-slate-500">{animal?.nome || '-'} • Brinco {animal?.brinco || '-'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(92vh-80px)] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data prevista</label>
              <input type="date" className="w-full p-2 border rounded-lg" value={formData.data_prevista} onChange={(e) => setFormData({ ...formData, data_prevista: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Finalidade</label>
              <input type="text" className="w-full p-2 border rounded-lg" value={formData.finalidade} onChange={(e) => setFormData({ ...formData, finalidade: e.target.value })} placeholder="Ex: venda, transferência, abate" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select className="w-full p-2 border rounded-lg" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option>Rascunho</option>
                <option>Pendente</option>
                <option>Emitida</option>
                <option>Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Origem</label>
              <input type="text" className="w-full p-2 border rounded-lg" value={formData.origem} onChange={(e) => setFormData({ ...formData, origem: e.target.value })} placeholder="Origem do transporte" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Destino</label>
              <input type="text" className="w-full p-2 border rounded-lg" value={formData.destino} onChange={(e) => setFormData({ ...formData, destino: e.target.value })} placeholder="Destino do transporte" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Quantidade de animais</label>
              <input type="number" min="1" className="w-full p-2 border rounded-lg" value={formData.quantidade_animais} onChange={(e) => setFormData({ ...formData, quantidade_animais: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Transportador</label>
              <input type="text" className="w-full p-2 border rounded-lg" value={formData.transportador} onChange={(e) => setFormData({ ...formData, transportador: e.target.value })} placeholder="Nome da empresa ou pessoa" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Motorista</label>
              <input type="text" className="w-full p-2 border rounded-lg" value={formData.motorista} onChange={(e) => setFormData({ ...formData, motorista: e.target.value })} placeholder="Nome do motorista" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Placa do veículo</label>
              <input type="text" className="w-full p-2 border rounded-lg" value={formData.placa_veiculo} onChange={(e) => setFormData({ ...formData, placa_veiculo: e.target.value.toUpperCase() })} placeholder="ABC1D23" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
            <textarea className="w-full p-3 border rounded-lg min-h-[110px]" value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} placeholder="Detalhes adicionais da pré-GTA" />
          </div>

          <div className="border rounded-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-slate-700 font-semibold">
              <Truck className="w-4 h-4" /> Últimos pré-registros
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white border-b border-slate-100 text-slate-600">
                  <tr>
                    <th className="p-3">Data prevista</th>
                    <th className="p-3">Finalidade</th>
                    <th className="p-3">Origem</th>
                    <th className="p-3">Destino</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRecords.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-slate-500">Nenhum pré-registro de GTA para este animal.</td></tr>
                  ) : recentRecords.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3">{fmtDate(item.data_prevista)}</td>
                      <td className="p-3">{item.finalidade || '-'}</td>
                      <td className="p-3">{item.origem || '-'}</td>
                      <td className="p-3">{item.destino || '-'}</td>
                      <td className="p-3">{item.status || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Pré-GTA'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreGtaBovinoModal;
