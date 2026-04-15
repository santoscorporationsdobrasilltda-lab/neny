import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Save, X, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const initialForm = {
  id: '',
  nome: '',
  categoria: '',
  exemplos: '',
  resposta_sugerida: '',
  status: 'Ativa',
};

const IntencoesTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, loading, fetchAll, create, update, remove } = useSupabaseCrud('smartzap_intencoes');

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
        (i.categoria || '').toLowerCase().includes(term) ||
        (i.exemplos || '').toLowerCase().includes(term)
      )
      .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
  }, [data, searchTerm]);

  const resetForm = () => {
    setFormData(initialForm);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.nome.trim()) {
      toast({ title: 'Erro', description: 'Informe o nome da intenção.', variant: 'destructive' });
      return;
    }

    const payload = {
      user_id: user.id,
      nome: formData.nome.trim(),
      categoria: formData.categoria?.trim() || null,
      exemplos: formData.exemplos?.trim() || null,
      resposta_sugerida: formData.resposta_sugerida?.trim() || null,
      status: formData.status || 'Ativa',
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
                <Brain className="w-5 h-5 text-purple-600" />
                Intenções IA
              </h2>
              <p className="text-sm text-slate-500">Cadastro de intenções e respostas sugeridas.</p>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="pl-10 pr-3 py-2 border rounded-lg w-72" placeholder="Buscar intenções..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Button onClick={() => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Resposta sugerida</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-500">Carregando...</td></tr>
                ) : itens.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-500">Nenhuma intenção encontrada.</td></tr>
                ) : itens.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-4 font-medium text-slate-800">{item.nome}</td>
                    <td className="p-4">{item.categoria || '-'}</td>
                    <td className="p-4">{item.status || '-'}</td>
                    <td className="p-4 max-w-[340px] truncate">{item.resposta_sugerida || '-'}</td>
                    <td className="p-4 flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => {
                        setFormData({
                          id: item.id,
                          nome: item.nome || '',
                          categoria: item.categoria || '',
                          exemplos: item.exemplos || '',
                          resposta_sugerida: item.resposta_sugerida || '',
                          status: item.status || 'Ativa',
                        });
                        setIsEditing(true);
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-red-600" onClick={async () => {
                        if (!window.confirm('Deseja excluir esta intenção?')) return;
                        const ok = await remove(item.id);
                        if (ok) await fetchAll(1, 1000);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">{formData.id ? 'Editar intenção' : 'Nova intenção'}</h3>
            <Button variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>

          <input className="w-full p-2 border rounded-lg" placeholder="Nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
          <input className="w-full p-2 border rounded-lg" placeholder="Categoria" value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} />
          <textarea className="w-full p-2 border rounded-lg min-h-[90px]" placeholder="Exemplos de mensagens" value={formData.exemplos} onChange={(e) => setFormData({ ...formData, exemplos: e.target.value })} />
          <textarea className="w-full p-2 border rounded-lg min-h-[120px]" placeholder="Resposta sugerida" value={formData.resposta_sugerida} onChange={(e) => setFormData({ ...formData, resposta_sugerida: e.target.value })} />
          <select className="w-full p-2 border rounded-lg" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
            <option>Ativa</option>
            <option>Inativa</option>
          </select>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntencoesTab;