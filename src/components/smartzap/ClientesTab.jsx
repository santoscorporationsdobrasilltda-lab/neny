import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Save, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const initialForm = {
  id: '',
  nome: '',
  telefone: '',
  origem: 'WhatsApp',
  tags: '',
  estagio: 'Novo',
  notas: '',
};

const ClientesTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, loading, fetchAll, create, update, remove } = useSupabaseCrud('smartzap_clientes');

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (user) fetchAll(1, 1000);
  }, [user, fetchAll]);

  const clientes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return [...data]
      .filter((c) =>
        (c.nome || '').toLowerCase().includes(term) ||
        (c.telefone || '').toLowerCase().includes(term) ||
        (c.tags || '').toLowerCase().includes(term) ||
        (c.estagio || '').toLowerCase().includes(term)
      )
      .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));
  }, [data, searchTerm]);

  const resetForm = () => {
    setFormData(initialForm);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.nome.trim() || !formData.telefone.trim()) {
      toast({ title: 'Erro', description: 'Preencha nome e telefone.', variant: 'destructive' });
      return;
    }

    const payload = {
      user_id: user.id,
      nome: formData.nome.trim(),
      telefone: formData.telefone.trim(),
      origem: formData.origem || 'WhatsApp',
      tags: formData.tags?.trim() || null,
      estagio: formData.estagio || 'Novo',
      notas: formData.notas?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const saved = formData.id ? await update(formData.id, payload) : await create(payload);
    if (saved) {
      await fetchAll(1, 1000);
      resetForm();
    }
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      nome: item.nome || '',
      telefone: item.telefone || '',
      origem: item.origem || 'WhatsApp',
      tags: item.tags || '',
      estagio: item.estagio || 'Novo',
      notas: item.notas || '',
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir este cliente?')) return;
    const ok = await remove(id);
    if (ok) await fetchAll(1, 1000);
  };

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Clientes SmartZap
              </h2>
              <p className="text-sm text-slate-500">Base comercial e relacionamento.</p>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="pl-10 pr-3 py-2 border rounded-lg w-72"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button
                onClick={() => {
                  setFormData(initialForm);
                  setIsEditing(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4">Origem</th>
                  <th className="p-4">Estágio</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-500">Carregando...</td></tr>
                ) : clientes.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-500">Nenhum cliente encontrado.</td></tr>
                ) : clientes.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-4 font-medium text-slate-800">{c.nome}</td>
                    <td className="p-4">{c.telefone}</td>
                    <td className="p-4">{c.origem || '-'}</td>
                    <td className="p-4">{c.estagio || '-'}</td>
                    <td className="p-4">{c.tags || '-'}</td>
                    <td className="p-4 flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(c)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-red-600" onClick={() => handleDelete(c.id)}>
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
            <h3 className="text-lg font-bold text-slate-800">{formData.id ? 'Editar cliente' : 'Novo cliente'}</h3>
            <Button variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="p-2 border rounded-lg" placeholder="Nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
            <input className="p-2 border rounded-lg" placeholder="Telefone" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} />
            <input className="p-2 border rounded-lg" placeholder="Origem" value={formData.origem} onChange={(e) => setFormData({ ...formData, origem: e.target.value })} />
            <select className="p-2 border rounded-lg" value={formData.estagio} onChange={(e) => setFormData({ ...formData, estagio: e.target.value })}>
              <option>Novo</option>
              <option>Qualificação</option>
              <option>Proposta</option>
              <option>Fechado</option>
              <option>Pós-venda</option>
            </select>
            <input className="p-2 border rounded-lg md:col-span-2" placeholder="Tags (separadas por vírgula)" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
            <textarea className="p-2 border rounded-lg md:col-span-2 min-h-[110px]" placeholder="Notas" value={formData.notas} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesTab;