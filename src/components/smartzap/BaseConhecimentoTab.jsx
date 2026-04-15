import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Save, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const initialForm = {
  id: '',
  titulo: '',
  categoria: '',
  conteudo: '',
  usar_respostas_automaticas: true,
  resumo_ia: '',
  status: 'Ativo',
};

const BaseConhecimentoTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data, loading, fetchAll, create, update, remove } = useSupabaseCrud('smartzap_base_conhecimento');

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
        (i.titulo || '').toLowerCase().includes(term) ||
        (i.categoria || '').toLowerCase().includes(term) ||
        (i.conteudo || '').toLowerCase().includes(term)
      )
      .sort((a, b) => (a.titulo || '').localeCompare(b.titulo || '', 'pt-BR'));
  }, [data, searchTerm]);

  const resetForm = () => {
    setFormData(initialForm);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.titulo.trim() || !formData.conteudo.trim()) {
      toast({ title: 'Erro', description: 'Preencha título e conteúdo.', variant: 'destructive' });
      return;
    }

    const payload = {
      user_id: user.id,
      titulo: formData.titulo.trim(),
      categoria: formData.categoria?.trim() || null,
      conteudo: formData.conteudo.trim(),
      usar_respostas_automaticas: !!formData.usar_respostas_automaticas,
      resumo_ia: formData.resumo_ia?.trim() || null,
      status: formData.status || 'Ativo',
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
                <BookOpen className="w-5 h-5 text-blue-600" />
                Base de Conhecimento
              </h2>
              <p className="text-sm text-slate-500">Artigos e respostas para apoio da IA.</p>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="pl-10 pr-3 py-2 border rounded-lg w-72" placeholder="Buscar artigos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full bg-white p-8 rounded-xl border shadow-sm text-center text-slate-500">Carregando...</div>
            ) : itens.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-xl border shadow-sm text-center text-slate-500">Nenhum artigo encontrado.</div>
            ) : itens.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-800">{item.titulo}</div>
                    <div className="text-xs text-slate-500 mt-1">{item.categoria || 'Sem categoria'}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{item.status || 'Ativo'}</span>
                </div>

                <div className="text-sm text-slate-600 mt-3 line-clamp-4 whitespace-pre-wrap">
                  {item.conteudo}
                </div>

                {item.resumo_ia && (
                  <div className="text-xs text-slate-500 mt-3 border-t pt-3">
                    <strong>Resumo IA:</strong> {item.resumo_ia}
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-3 border-t">
                  <span className="text-xs text-slate-500">
                    Auto resposta: {item.usar_respostas_automaticas ? 'Sim' : 'Não'}
                  </span>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => {
                      setFormData({
                        id: item.id,
                        titulo: item.titulo || '',
                        categoria: item.categoria || '',
                        conteudo: item.conteudo || '',
                        usar_respostas_automaticas: !!item.usar_respostas_automaticas,
                        resumo_ia: item.resumo_ia || '',
                        status: item.status || 'Ativo',
                      });
                      setIsEditing(true);
                    }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-600" onClick={async () => {
                      if (!window.confirm('Deseja excluir este artigo?')) return;
                      const ok = await remove(item.id);
                      if (ok) await fetchAll(1, 1000);
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">{formData.id ? 'Editar artigo' : 'Novo artigo'}</h3>
            <Button variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>

          <input className="w-full p-2 border rounded-lg" placeholder="Título" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} />
          <input className="w-full p-2 border rounded-lg" placeholder="Categoria" value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} />
          <textarea className="w-full p-2 border rounded-lg min-h-[160px]" placeholder="Conteúdo" value={formData.conteudo} onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })} />
          <textarea className="w-full p-2 border rounded-lg min-h-[90px]" placeholder="Resumo IA" value={formData.resumo_ia} onChange={(e) => setFormData({ ...formData, resumo_ia: e.target.value })} />
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={formData.usar_respostas_automaticas} onChange={(e) => setFormData({ ...formData, usar_respostas_automaticas: e.target.checked })} />
            <span className="text-sm text-slate-700">Usar em respostas automáticas</span>
          </div>
          <select className="w-full p-2 border rounded-lg" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
            <option>Ativo</option>
            <option>Inativo</option>
          </select>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseConhecimentoTab;