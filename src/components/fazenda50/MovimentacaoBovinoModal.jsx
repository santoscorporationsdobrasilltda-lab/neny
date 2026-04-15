import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const initialForm = {
  data: new Date().toISOString().split('T')[0],
  tipo_movimentacao: 'Entrada',
  origem: '',
  destino: '',
  motivo: '',
  observacoes: '',
};

const MovimentacaoBovinoModal = ({ animal, onClose, onSaved }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { create } = useSupabaseCrud('fazenda50_movimentacoes_bovinos');

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !animal?.id) return;

    if (!formData.data || !formData.tipo_movimentacao) {
      toast({
        title: 'Erro',
        description: 'Preencha a data e o tipo da movimentação.',
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
      tipo_movimentacao: formData.tipo_movimentacao,
      origem: formData.origem?.trim() || null,
      destino: formData.destino?.trim() || null,
      motivo: formData.motivo?.trim() || null,
      observacoes: formData.observacoes?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const saved = await create(payload);
    setSaving(false);

    if (saved) {
      toast({
        title: '✅ Movimentação registrada',
        description: 'A movimentação do bovino foi salva com sucesso.',
      });
      onSaved?.();
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Movimentar Bovino</h3>
            <p className="text-sm text-slate-500">
              {animal?.nome || '-'} • Brinco {animal?.brinco || '-'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data</label>
              <input
                type="date"
                className="w-full p-2 border rounded-lg"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={formData.tipo_movimentacao}
                onChange={(e) => setFormData({ ...formData, tipo_movimentacao: e.target.value })}
              >
                <option>Entrada</option>
                <option>Transferência</option>
                <option>Venda</option>
                <option>Descarte</option>
                <option>Óbito</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Origem</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={formData.origem}
                onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                placeholder="Ex: Compra, Lote A, Pasto 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Destino</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={formData.destino}
                onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                placeholder="Ex: Lote B, Venda, Pasto 2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Motivo</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              placeholder="Ex: ajuste de lote, comercialização, descarte técnico"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Observações</label>
            <textarea
              className="w-full p-3 border rounded-lg min-h-[110px]"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Detalhes adicionais da movimentação"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Movimentação'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovimentacaoBovinoModal;
