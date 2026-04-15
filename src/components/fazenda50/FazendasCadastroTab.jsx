import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Edit, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useFazendaContext } from './FazendaContext';

const initialForm = {
  id: '',
  nome: '',
  codigo: '',
  sigla: '',
  cidade: '',
  estado: '',
  responsavel: '',
  ativo: true,
  observacoes: '',
  sequencial_brinco_atual: 0,
};

const FazendasCadastroTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: fazendas, fetchAll, create, update, remove } = useSupabaseCrud('fazenda50_fazendas');
  const { selectedFarmId, setSelectedFarmId } = useFazendaContext();

  const [formData, setFormData] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) fetchAll(1, 1000);
  }, [user, fetchAll]);

  const resetForm = () => {
    setFormData(initialForm);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.nome.trim() || !formData.sigla.trim()) {
      toast({ title: 'Erro', description: 'Nome e sigla da fazenda são obrigatórios.', variant: 'destructive' });
      return;
    }

    const payload = {
      user_id: user.id,
      nome: formData.nome.trim(),
      codigo: formData.codigo.trim() || null,
      sigla: formData.sigla.trim().toUpperCase(),
      cidade: formData.cidade.trim() || null,
      estado: formData.estado.trim().toUpperCase() || null,
      responsavel: formData.responsavel.trim() || null,
      ativo: Boolean(formData.ativo),
      observacoes: formData.observacoes.trim() || null,
      sequencial_brinco_atual: Number(formData.sequencial_brinco_atual || 0),
      updated_at: new Date().toISOString(),
    };

    const saved = formData.id ? await update(formData.id, payload) : await create(payload);
    if (!saved) return;

    await fetchAll(1, 1000);
    if (!selectedFarmId || !formData.id) setSelectedFarmId(saved.id);
    toast({ title: 'Sucesso', description: formData.id ? 'Fazenda atualizada.' : 'Fazenda cadastrada.' });
    resetForm();
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      nome: item.nome || '',
      codigo: item.codigo || '',
      sigla: item.sigla || '',
      cidade: item.cidade || '',
      estado: item.estado || '',
      responsavel: item.responsavel || '',
      ativo: item.ativo !== false,
      observacoes: item.observacoes || '',
      sequencial_brinco_atual: item.sequencial_brinco_atual ?? 0,
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir fazenda?')) return;
    const ok = await remove(id);
    if (!ok) return;
    await fetchAll(1, 1000);
    if (selectedFarmId === id) setSelectedFarmId('');
  };

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return [...fazendas]
      .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'))
      .filter((item) => {
        if (!term) return true;
        return [item.nome, item.codigo, item.sigla, item.cidade, item.estado, item.responsavel]
          .some((value) => String(value || '').toLowerCase().includes(term));
      });
  }, [fazendas, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            {isEditing ? 'Editar Fazenda' : 'Cadastrar Fazenda'}
          </h2>
          {isEditing && (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="p-2 border rounded" placeholder="Nome da fazenda *" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Código interno" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} />
          <input className="p-2 border rounded uppercase" placeholder="Sigla * (ex: BV)" value={formData.sigla} onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })} />
          <input className="p-2 border rounded" placeholder="Cidade" value={formData.cidade} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} />
          <input className="p-2 border rounded uppercase" placeholder="Estado" value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })} />
          <input className="p-2 border rounded" placeholder="Responsável" value={formData.responsavel} onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })} />
          <div>
            <label className="text-xs text-slate-500 block mb-1">Sequencial atual do brinco</label>
            <input className="w-full p-2 border rounded" type="number" min="0" value={formData.sequencial_brinco_atual} onChange={(e) => setFormData({ ...formData, sequencial_brinco_atual: e.target.value })} />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input id="fazenda-ativa" type="checkbox" checked={formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} />
            <label htmlFor="fazenda-ativa" className="text-sm text-slate-700">Fazenda ativa</label>
          </div>
          <div className="md:col-span-1" />
          <textarea className="p-2 border rounded md:col-span-3 h-24" placeholder="Observações e características da fazenda" value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} />
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit">
              {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {isEditing ? 'Salvar alterações' : 'Cadastrar fazenda'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-700">Fazendas cadastradas ({filtered.length})</h3>
            <p className="text-sm text-slate-500">Use uma fazenda ativa como base para filtros, dashboards e geração automática de brincos.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" placeholder="Buscar por nome, sigla, cidade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">Sigla</th>
                <th className="p-4">Local</th>
                <th className="p-4">Responsável</th>
                <th className="p-4">Seq. brinco</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Nenhuma fazenda cadastrada.</td></tr>
              ) : filtered.map((item) => {
                const selected = selectedFarmId === item.id;
                return (
                  <tr key={item.id} className={selected ? 'bg-emerald-50/70' : 'hover:bg-slate-50'}>
                    <td className="p-4 font-semibold text-slate-800">{item.nome}</td>
                    <td className="p-4 font-mono">{item.sigla || '-'}</td>
                    <td className="p-4">{[item.cidade, item.estado].filter(Boolean).join(' / ') || '-'}</td>
                    <td className="p-4">{item.responsavel || '-'}</td>
                    <td className="p-4">{Number(item.sequencial_brinco_atual || 0)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {item.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end flex-wrap gap-2">
                        <Button size="sm" variant={selected ? 'default' : 'outline'} onClick={() => setSelectedFarmId(selected ? '' : item.id)}>
                          {selected ? 'Usando agora' : 'Selecionar'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FazendasCadastroTab;
