import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Save, X, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const emptyStep = () => ({ titulo: '', acao: '' });

const initialForm = {
  id: '',
  nome: '',
  objetivo: '',
  status: 'Ativo',
  passos: [emptyStep()],
};

const FluxosTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, loading, fetchAll, create, update, remove } = useSupabaseCrud('smartzap_fluxos');

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (user) fetchAll(1, 1000);
  }, [user, fetchAll]);

  const itens = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return [...data]
      .filter((i) =>
        (i.nome || '').toLowerCase().includes(term) ||
        (i.objetivo || '').toLowerCase().includes(term) ||
        (i.status || '').toLowerCase().includes(term)
      )
      .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
  }, [data, searchTerm]);

  const resetForm = () => {
    setFormData(initialForm);
    setIsEditing(false);
  };

  const updateStep = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      passos: prev.passos.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  };

  const addStep = () => {
    setFormData((prev) => ({ ...prev, passos: [...prev.passos, emptyStep()] }));
  };

  const removeStep = (index) => {
    setFormData((prev) => ({
      ...prev,
      passos: prev.passos.length > 1 ? prev.passos.filter((_, i) => i !== index) : [emptyStep()],
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.nome.trim()) {
      toast({ title: 'Erro', description: 'Informe o nome do fluxo.', variant: 'destructive' });
      return;
    }

    const passosValidos = formData.passos.filter((p) => p.titulo?.trim() || p.acao?.trim());

    const payload = {
      user_id: user.id,
      nome: formData.nome.trim(),
      objetivo: formData.objetivo?.trim() || null,
      status: formData.status || 'Ativo',
      passos: passosValidos,
      updated_at: new Date().toISOString(),
    };

    const saved = formData.id ? await update(formData.id, payload) : await create(payload);
    if (saved) {
      await fetchAll(1, 1000);
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Workflow className="w-5 h-5 text-indigo-600" />
                Fluxos Automáticos
              </h2>
              <p className="text-sm text-slate-500">Mapeamento de jornadas e automações.</p>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="pl-10 pr-3 py-2 border rounded-lg w-72" placeholder="Buscar fluxos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Button onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full bg-white p-8 rounded-xl border shadow-sm text-center text-slate-500">Carregando...</div>
            ) : itens.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-xl border shadow-sm text-center text-slate-500">Nenhum fluxo encontrado.</div>
            ) : itens.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="font-semibold text-slate-800">{item.nome}</div>
                    <div className="text-sm text-slate-500 mt-1">{item.objetivo || '-'}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{item.status || 'Ativo'}</span>
                </div>

                <div className="mt-4 space-y-2">
                  {Array.isArray(item.passos) && item.passos.length > 0 ? item.passos.map((p, i) => (
                    <div key={i} className="text-sm border rounded-lg p-2 bg-slate-50">
                      <strong>Passo {i + 1}:</strong> {p.titulo || '-'} {p.acao ? `• ${p.acao}` : ''}
                    </div>
                  )) : (
                    <div className="text-sm text-slate-400">Sem passos definidos.</div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                  <Button size="icon" variant="ghost" onClick={() => {
                    setFormData({
                      id: item.id,
                      nome: item.nome || '',
                      objetivo: item.objetivo || '',
                      status: item.status || 'Ativo',
                      passos: Array.isArray(item.passos) && item.passos.length > 0 ? item.passos : [emptyStep()],
                    });
                    setIsEditing(true);
                  }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-red-600" onClick={async () => {
                    if (!window.confirm('Deseja excluir este fluxo?')) return;
                    const ok = await remove(item.id);
                    if (ok) await fetchAll(1, 1000);
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">{formData.id ? 'Editar fluxo' : 'Novo fluxo'}</h3>
            <Button variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>

          <input className="w-full p-2 border rounded-lg" placeholder="Nome do fluxo" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
          <textarea className="w-full p-2 border rounded-lg min-h-[90px]" placeholder="Objetivo" value={formData.objetivo} onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })} />
          <select className="w-full p-2 border rounded-lg" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
            <option>Ativo</option>
            <option>Inativo</option>
          </select>

          <div className="space-y-3">
            <div className="font-medium text-slate-800">Passos</div>
            {formData.passos.map((step, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                <input className="p-2 border rounded-lg" placeholder="Título do passo" value={step.titulo} onChange={(e) => updateStep(index, 'titulo', e.target.value)} />
                <input className="p-2 border rounded-lg" placeholder="Ação" value={step.acao} onChange={(e) => updateStep(index, 'acao', e.target.value)} />
                <Button variant="outline" className="text-red-600" onClick={() => removeStep(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button variant="outline" onClick={addStep}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar passo
            </Button>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FluxosTab;