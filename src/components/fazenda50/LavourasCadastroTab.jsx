import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Save, X, Sprout, Search } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useFazendaContext } from './FazendaContext';

const initialFormBase = {
  id: '',
  cultura: 'Soja',
  talhao: '',
  area: '',
  safra: new Date().getFullYear().toString(),
  fazendaId: '',
  fazenda: '',
  dataPlantio: '',
  previsaoColheita: '',
  responsavel: '',
  observacoes: '',
};

const LavourasCadastroTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { fazendas, selectedFarmId, selectedFarm, matchesSelectedFarm, getFarmByRecord } = useFazendaContext();
  const { data: lavouras, fetchAll, create, update, remove } = useSupabaseCrud('fazenda50_lavouras');

  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ ...initialFormBase, fazendaId: selectedFarmId || '', fazenda: selectedFarm?.nome || '' });

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  useEffect(() => {
    if (!isEditing && selectedFarmId) {
      setFormData((prev) => ({ ...prev, fazendaId: prev.fazendaId || selectedFarmId, fazenda: prev.fazenda || selectedFarm?.nome || '' }));
    }
  }, [selectedFarmId, selectedFarm, isEditing]);

  const resetForm = () => {
    setFormData({ ...initialFormBase, fazendaId: selectedFarmId || '', fazenda: selectedFarm?.nome || '' });
    setIsEditing(false);
  };

  const resolveFarm = (record) => {
    if (record?.fazendaId) return fazendas.find((item) => item.id === record.fazendaId) || null;
    if (record?.fazenda_id) return fazendas.find((item) => item.id === record.fazenda_id) || getFarmByRecord(record);
    if (record?.fazenda) return fazendas.find((item) => item.nome === record.fazenda) || null;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.talhao || !formData.area) {
      toast({ title: 'Erro', description: 'Talhão e área são obrigatórios.', variant: 'destructive' });
      return;
    }

    const fazendaData = resolveFarm(formData) || selectedFarm;
    const payload = {
      user_id: user.id,
      cultura: formData.cultura || null,
      talhao: formData.talhao.trim(),
      area: formData.area ? Number(formData.area) : null,
      safra: formData.safra || null,
      fazenda_id: fazendaData?.id || null,
      fazenda: fazendaData?.nome || formData.fazenda || null,
      data_plantio: formData.dataPlantio || null,
      previsao_colheita: formData.previsaoColheita || null,
      responsavel: formData.responsavel || null,
      observacoes: formData.observacoes || null,
      updated_at: new Date().toISOString(),
    };

    const saved = formData.id ? await update(formData.id, payload) : await create(payload);
    if (!saved) return;

    await fetchAll();
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir lavoura?')) return;
    const ok = await remove(id);
    if (ok) await fetchAll();
  };

  const handleEdit = (item) => {
    const farm = resolveFarm(item);
    setFormData({
      id: item.id,
      cultura: item.cultura || 'Soja',
      talhao: item.talhao || '',
      area: item.area ?? '',
      safra: item.safra || '',
      fazendaId: item.fazenda_id || farm?.id || '',
      fazenda: item.fazenda || farm?.nome || '',
      dataPlantio: item.data_plantio || '',
      previsaoColheita: item.previsao_colheita || '',
      responsavel: item.responsavel || '',
      observacoes: item.observacoes || '',
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const visibleLavouras = useMemo(() => lavouras.filter((item) => matchesSelectedFarm(item)), [lavouras, matchesSelectedFarm]);
  const filteredLavouras = useMemo(() => {
    const ordered = [...visibleLavouras].sort((a, b) => (a.talhao || '').localeCompare(b.talhao || '', 'pt-BR', { numeric: true }));
    return ordered.filter((item) => {
      const term = searchTerm.toLowerCase();
      return [item.talhao, item.cultura, item.safra, item.fazenda, item.responsavel].some((value) => String(value || '').toLowerCase().includes(term));
    });
  }, [visibleLavouras, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Sprout className="w-5 h-5 text-green-600" />{isEditing ? 'Editar Lavoura' : 'Cadastrar Lavoura'}</h2>
          {isEditing && <Button variant="ghost" onClick={resetForm} size="sm"><X className="w-4 h-4 mr-2" />Cancelar</Button>}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="p-2 border rounded" value={formData.cultura} onChange={(e) => setFormData({ ...formData, cultura: e.target.value })}>
            <option value="Soja">Soja</option><option value="Milho">Milho</option><option value="Pastagem">Pastagem</option><option value="Trigo">Trigo</option><option value="Cana">Cana de Açúcar</option><option value="Outro">Outro</option>
          </select>
          <input className="p-2 border rounded" placeholder="Talhão (ex: T-01)" value={formData.talhao} onChange={(e) => setFormData({ ...formData, talhao: e.target.value })} />
          <input className="p-2 border rounded" type="number" step="0.01" placeholder="Área (ha)" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Safra (ex: 2023/24)" value={formData.safra} onChange={(e) => setFormData({ ...formData, safra: e.target.value })} />
          <select className="p-2 border rounded" value={formData.fazendaId} onChange={(e) => {
            const farm = fazendas.find((item) => item.id === e.target.value) || null;
            setFormData((prev) => ({ ...prev, fazendaId: e.target.value, fazenda: farm?.nome || '' }));
          }}>
            <option value="">Selecione a fazenda</option>
            {fazendas.filter((item) => item.ativo !== false).map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
          </select>
          <input className="p-2 border rounded" placeholder="Responsável" value={formData.responsavel} onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })} />
          <div><label className="text-xs text-slate-500 block">Data Plantio</label><input className="w-full p-2 border rounded" type="date" value={formData.dataPlantio} onChange={(e) => setFormData({ ...formData, dataPlantio: e.target.value })} /></div>
          <div><label className="text-xs text-slate-500 block">Previsão Colheita</label><input className="w-full p-2 border rounded" type="date" value={formData.previsaoColheita} onChange={(e) => setFormData({ ...formData, previsaoColheita: e.target.value })} /></div>
          <input className="p-2 border rounded bg-slate-50" placeholder="Fazenda" value={formData.fazenda} readOnly />
          <textarea className="p-2 border rounded md:col-span-3 h-16" placeholder="Observações" value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} />
          <div className="md:col-span-3 flex justify-end"><Button type="submit"><Save className="w-4 h-4 mr-2" />Salvar lavoura</Button></div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-700">Lavouras cadastradas ({filteredLavouras.length})</h3>
            <p className="text-sm text-slate-500">{selectedFarm ? `Mostrando a fazenda ${selectedFarm.nome}.` : 'Mostrando o consolidado geral das lavouras.'}</p>
          </div>
          <div className="relative w-full md:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" /><input className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" placeholder="Buscar por talhão, cultura, safra..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200"><tr><th className="p-4">Talhão</th><th className="p-4">Cultura</th><th className="p-4">Área</th><th className="p-4">Safra</th><th className="p-4">Fazenda</th><th className="p-4">Responsável</th><th className="p-4 text-right">Ações</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLavouras.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-slate-500">Nenhuma lavoura cadastrada.</td></tr> : filteredLavouras.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-800">{item.talhao}</td>
                  <td className="p-4">{item.cultura || '-'}</td>
                  <td className="p-4">{Number(item.area || 0).toFixed(2)} ha</td>
                  <td className="p-4">{item.safra || '-'}</td>
                  <td className="p-4">{item.fazenda || resolveFarm(item)?.nome || '-'}</td>
                  <td className="p-4">{item.responsavel || '-'}</td>
                  <td className="p-4 text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button><Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LavourasCadastroTab;
