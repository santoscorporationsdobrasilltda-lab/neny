import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Save, Search, X, QrCode, ArrowRightLeft, History, Scale, UtensilsCrossed, Hash, Truck, RefreshCw, Building2 } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import BovinoQRModal from './BovinoQRModal';
import BovinoHistoricoModal from './BovinoHistoricoModal';
import MovimentacaoBovinoModal from './MovimentacaoBovinoModal';
import PesagemBovinoModal from './PesagemBovinoModal';
import AlimentacaoBovinoModal from './AlimentacaoBovinoModal';
import ContagemBovinoModal from './ContagemBovinoModal';
import PreGtaBovinoModal from './PreGtaBovinoModal';
import { useFazendaContext } from './FazendaContext';

const sortByDateDesc = (items = [], field = 'data') =>
  [...items].sort((a, b) => {
    const da = a?.[field] ? new Date(a[field]).getTime() : 0;
    const db = b?.[field] ? new Date(b[field]).getTime() : 0;
    return db - da;
  });

const normalize = (value) => String(value || '').trim().toLowerCase();

const BovinosTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const { fazendas, selectedFarmId, selectedFarm, matchesSelectedFarm, getFarmByRecord } = useFazendaContext();

  const { data: animals, fetchAll: fetchAnimals, create, update, remove } = useSupabaseCrud('fazenda50_bovinos');
  const { data: sanidade, fetchAll: fetchSanidade } = useSupabaseCrud('fazenda50_sanidade');
  const { data: movimentacoes, fetchAll: fetchMovimentacoes } = useSupabaseCrud('fazenda50_movimentacoes_bovinos');
  const { data: pesagens, fetchAll: fetchPesagens } = useSupabaseCrud('fazenda50_bovinos_pesagens');
  const { data: alimentacoes, fetchAll: fetchAlimentacoes } = useSupabaseCrud('fazenda50_bovinos_alimentacao_adicional');
  const { data: contagens, fetchAll: fetchContagens } = useSupabaseCrud('fazenda50_bovinos_contagens');
  const { data: preGtas, fetchAll: fetchPreGtas } = useSupabaseCrud('fazenda50_bovinos_pre_gta');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [loteFilter, setLoteFilter] = useState('todos');
  const [fazendaFilter, setFazendaFilter] = useState('todos');
  const [isEditing, setIsEditing] = useState(false);
  const [generatingTag, setGeneratingTag] = useState(false);
  const [selectedAnimalQR, setSelectedAnimalQR] = useState(null);
  const [selectedAnimalHistorico, setSelectedAnimalHistorico] = useState(null);
  const [selectedAnimalMov, setSelectedAnimalMov] = useState(null);
  const [selectedAnimalPesagem, setSelectedAnimalPesagem] = useState(null);
  const [selectedAnimalAlimentacao, setSelectedAnimalAlimentacao] = useState(null);
  const [selectedAnimalContagem, setSelectedAnimalContagem] = useState(null);
  const [selectedAnimalPreGta, setSelectedAnimalPreGta] = useState(null);
  const [highlightedAnimalId, setHighlightedAnimalId] = useState(null);

  const initialForm = {
    id: '',
    brinco: '',
    nome: '',
    categoria: 'Novilha',
    raca: '',
    nascimento: '',
    origem: 'Própria',
    lote: '',
    fazendaId: '',
    fazenda: '',
    status: 'Ativo',
    observacoes: '',
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (user) {
      fetchAnimals(1, 1000);
      fetchSanidade(1, 2000);
      fetchMovimentacoes(1, 2000);
      fetchPesagens(1, 2000);
      fetchAlimentacoes(1, 2000);
      fetchContagens(1, 2000);
      fetchPreGtas(1, 2000);
    }
  }, [user, fetchAnimals, fetchSanidade, fetchMovimentacoes, fetchPesagens, fetchAlimentacoes, fetchContagens, fetchPreGtas]);

  useEffect(() => {
    if (!isEditing && selectedFarmId) {
      const farm = fazendas.find((item) => item.id === selectedFarmId);
      setFormData((prev) => ({
        ...prev,
        fazendaId: prev.fazendaId || selectedFarmId,
        fazenda: prev.fazenda || farm?.nome || '',
      }));
    }
  }, [selectedFarmId, fazendas, isEditing]);

  useEffect(() => {
    if (!animals.length) return;

    const params = new URLSearchParams(location.search);
    const animalId = params.get('animal');
    const brinco = params.get('brinco');
    if (!animalId && !brinco) return;

    const target = animals.find((item) => item.id === animalId) || animals.find((item) => String(item.brinco || '') === String(brinco || ''));
    if (target) {
      setHighlightedAnimalId(target.id);
      setSelectedAnimalHistorico(buildAnimalDetails(target));
    }
  }, [animals, location.search]);

  const resolveFarmFromValue = (record) => {
    if (!record) return null;
    if (record.fazendaId) return fazendas.find((item) => item.id === record.fazendaId) || null;
    if (record.fazenda_id) return fazendas.find((item) => item.id === record.fazenda_id) || getFarmByRecord(record);
    if (record.fazenda) return fazendas.find((item) => normalize(item.nome) === normalize(record.fazenda) || normalize(item.sigla) === normalize(record.fazenda) || normalize(item.codigo) === normalize(record.fazenda)) || null;
    return null;
  };

  const resetForm = () => {
    setFormData({ ...initialForm, fazendaId: selectedFarmId || '', fazenda: selectedFarm?.nome || '' });
    setIsEditing(false);
  };

  const getHistoricoByAnimal = (animalId) => sortByDateDesc(sanidade.filter((item) => item.bovino_id === animalId));
  const getMovimentacoesByAnimal = (animalId) => sortByDateDesc(movimentacoes.filter((item) => item.bovino_id === animalId));
  const getPesagensByAnimal = (animalId) => sortByDateDesc(pesagens.filter((item) => item.bovino_id === animalId));
  const getAlimentacoesByAnimal = (animalId) => sortByDateDesc(alimentacoes.filter((item) => item.bovino_id === animalId));
  const getContagensByAnimal = (animalId) => sortByDateDesc(contagens.filter((item) => item.bovino_id === animalId));
  const getPreGtasByAnimal = (animalId) => sortByDateDesc(preGtas.filter((item) => item.bovino_id === animalId), 'data_prevista');

  const buildAnimalDetails = (item) => {
    const fazendaData = getFarmByRecord(item) || resolveFarmFromValue(item);
    return {
      ...item,
      fazenda_id: item.fazenda_id || fazendaData?.id || null,
      fazenda: item.fazenda || fazendaData?.nome || '-',
      fazendaData,
      nascimento: item.data_nascimento || '',
      historico: getHistoricoByAnimal(item.id),
      movimentacoes: getMovimentacoesByAnimal(item.id),
      pesagens: getPesagensByAnimal(item.id),
      alimentacoes: getAlimentacoesByAnimal(item.id),
      contagens: getContagensByAnimal(item.id),
      preGtas: getPreGtasByAnimal(item.id),
    };
  };

  const getNextCareByAnimal = (animalId) =>
    sanidade
      .filter((item) => item.bovino_id === animalId && item.proxima_data)
      .sort((a, b) => new Date(a.proxima_data) - new Date(b.proxima_data))[0];

  const generateNextBrinco = async ({ quiet = false } = {}) => {
    const fazendaData = fazendas.find((item) => item.id === (formData.fazendaId || selectedFarmId));
    if (!fazendaData?.id) {
      if (!quiet) toast({ title: 'Selecione a fazenda', description: 'Escolha a fazenda para gerar o próximo brinco automaticamente.', variant: 'destructive' });
      return null;
    }

    setGeneratingTag(true);
    const { data, error } = await supabase.rpc('fazenda50_gerar_proximo_brinco', { p_fazenda_id: fazendaData.id });
    setGeneratingTag(false);

    if (error || !data) {
      if (!quiet) toast({ title: 'Erro', description: error?.message || 'Não foi possível gerar o brinco automático.', variant: 'destructive' });
      return null;
    }

    setFormData((prev) => ({ ...prev, brinco: data, fazendaId: fazendaData.id, fazenda: fazendaData.nome || '' }));
    if (!quiet) toast({ title: 'Brinco gerado', description: `Próximo código reservado: ${data}` });
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Erro', description: 'Usuário não autenticado.', variant: 'destructive' });
      return;
    }

    const fazendaData = resolveFarmFromValue(formData) || selectedFarm;
    let brinco = String(formData.brinco || '').trim();

    if (!formData.nome.trim()) {
      toast({ title: 'Erro', description: 'Nome do animal é obrigatório.', variant: 'destructive' });
      return;
    }

    if (!formData.id && !fazendaData?.id) {
      toast({ title: 'Selecione a fazenda', description: 'Cadastre ou escolha uma fazenda antes de lançar um novo bovino.', variant: 'destructive' });
      return;
    }

    if (!brinco) {
      brinco = await generateNextBrinco({ quiet: true });
    }

    if (!brinco) {
      toast({ title: 'Erro', description: 'Informe o brinco ou gere automaticamente.', variant: 'destructive' });
      return;
    }

    const payload = {
      user_id: user.id,
      brinco,
      nome: formData.nome.trim(),
      categoria: formData.categoria || null,
      raca: formData.raca.trim() || null,
      data_nascimento: formData.nascimento || null,
      origem: formData.origem || null,
      lote: formData.lote.trim() || null,
      fazenda_id: fazendaData?.id || null,
      fazenda: fazendaData?.nome || formData.fazenda.trim() || null,
      status: formData.status || 'Ativo',
      observacoes: formData.observacoes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    try {
      let savedAnimal = null;
      if (formData.id) {
        savedAnimal = await update(formData.id, payload);
        toast({ title: 'Sucesso', description: 'Animal atualizado.' });
      } else {
        savedAnimal = await create(payload);
        toast({ title: 'Sucesso', description: 'Animal cadastrado.' });
      }

      await fetchAnimals(1, 1000);
      resetForm();
      if (savedAnimal) setSelectedAnimalQR(buildAnimalDetails({ ...savedAnimal, fazenda_id: payload.fazenda_id, fazenda: payload.fazenda }));
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao salvar animal.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir animal?')) return;
    try {
      await remove(id);
      await fetchAnimals(1, 1000);
      toast({ title: 'Removido', description: 'Registro excluído.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao excluir animal.', variant: 'destructive' });
    }
  };

  const handleEdit = (item) => {
    const farm = getFarmByRecord(item) || resolveFarmFromValue(item);
    setFormData({
      id: item.id,
      brinco: item.brinco || '',
      nome: item.nome || '',
      categoria: item.categoria || 'Novilha',
      raca: item.raca || '',
      nascimento: item.data_nascimento || '',
      origem: item.origem || 'Própria',
      lote: item.lote || '',
      fazendaId: item.fazenda_id || farm?.id || '',
      fazenda: item.fazenda || farm?.nome || '',
      status: item.status || 'Ativo',
      observacoes: item.observacoes || '',
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const visibleAnimals = useMemo(() => animals.filter((item) => matchesSelectedFarm(item)), [animals, matchesSelectedFarm]);
  const loteOptions = useMemo(() => [...new Set(visibleAnimals.map((a) => a.lote).filter(Boolean))], [visibleAnimals]);
  const fazendaOptions = useMemo(() => {
    const textual = visibleAnimals.map((a) => a.fazenda).filter(Boolean);
    const typed = fazendas.map((a) => a.nome).filter(Boolean);
    return [...new Set([...typed, ...textual])];
  }, [visibleAnimals, fazendas]);

  const filteredAnimals = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return visibleAnimals.filter((a) => {
      const farmName = a.fazenda || getFarmByRecord(a)?.nome || '';
      const matchesSearch =
        (a.nome || '').toLowerCase().includes(term) ||
        (a.brinco || '').toLowerCase().includes(term) ||
        (a.lote || '').toLowerCase().includes(term) ||
        farmName.toLowerCase().includes(term) ||
        (a.raca || '').toLowerCase().includes(term) ||
        (a.categoria || '').toLowerCase().includes(term) ||
        (a.id || '').toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'todos' ? true : (a.status || '') === statusFilter;
      const matchesLote = loteFilter === 'todos' ? true : (a.lote || '') === loteFilter;
      const matchesFazenda = fazendaFilter === 'todos' ? true : farmName === fazendaFilter;
      return matchesSearch && matchesStatus && matchesLote && matchesFazenda;
    });
  }, [visibleAnimals, searchTerm, statusFilter, loteFilter, fazendaFilter, getFarmByRecord]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">{isEditing ? 'Editar Bovino' : 'Novo Bovino'}</h2>
          {isEditing && (
            <Button variant="ghost" onClick={resetForm} size="sm">
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
            <div>
              <label className="text-xs uppercase tracking-wide text-blue-700 block mb-1">Fazenda vinculada</label>
              <select className="w-full p-2 border rounded bg-white" value={formData.fazendaId} onChange={(e) => {
                const farm = fazendas.find((item) => item.id === e.target.value) || null;
                setFormData((prev) => ({ ...prev, fazendaId: e.target.value, fazenda: farm?.nome || '' }));
              }}>
                <option value="">Selecione a fazenda</option>
                {fazendas.filter((item) => item.ativo !== false).map((item) => (
                  <option key={item.id} value={item.id}>{item.nome} {item.sigla ? `• ${item.sigla}` : ''}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" className="w-full md:w-auto" onClick={() => generateNextBrinco()} disabled={generatingTag || (!formData.fazendaId && !selectedFarmId)}>
                <RefreshCw className={`w-4 h-4 mr-2 ${generatingTag ? 'animate-spin' : ''}`} />
                {generatingTag ? 'Gerando...' : 'Gerar próximo brinco'}
              </Button>
            </div>
            {formData.fazendaId && (
              <div className="md:col-span-3 text-sm text-blue-900 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {(fazendas.find((item) => item.id === formData.fazendaId)?.observacoes) || 'Brinco, filtros e relatórios serão vinculados a essa fazenda.'}
              </div>
            )}
          </div>

          <input className="p-2 border rounded" placeholder="Brinco / ID Oficial *" value={formData.brinco} onChange={(e) => setFormData({ ...formData, brinco: e.target.value.toUpperCase() })} />
          <input className="p-2 border rounded" placeholder="Nome / Apelido *" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
          <select className="p-2 border rounded" value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}>
            <option value="Bezerro">Bezerro(a)</option>
            <option value="Novilha">Novilha</option>
            <option value="Vaca">Vaca</option>
            <option value="Touro">Touro</option>
            <option value="Garrote">Garrote</option>
            <option value="Boi">Boi</option>
          </select>
          <input className="p-2 border rounded" placeholder="Raça" value={formData.raca} onChange={(e) => setFormData({ ...formData, raca: e.target.value })} />
          <input className="p-2 border rounded" type="date" value={formData.nascimento} onChange={(e) => setFormData({ ...formData, nascimento: e.target.value })} />
          <select className="p-2 border rounded" value={formData.origem} onChange={(e) => setFormData({ ...formData, origem: e.target.value })}>
            <option value="Própria">Cria Própria</option>
            <option value="Compra">Compra</option>
            <option value="Leilão">Leilão</option>
          </select>
          <input className="p-2 border rounded" placeholder="Lote" value={formData.lote} onChange={(e) => setFormData({ ...formData, lote: e.target.value })} />
          <input className="p-2 border rounded bg-slate-50" placeholder="Fazenda" value={formData.fazenda} readOnly />
          <select className="p-2 border rounded" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
            <option value="Ativo">Ativo</option>
            <option value="Vendido">Vendido</option>
            <option value="Morto">Morto</option>
            <option value="Doente">Doente</option>
          </select>
          <textarea className="p-2 border rounded md:col-span-3 h-20" placeholder="Observações" value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} />
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" className="bg-[#1e3a8a] text-white">
              <Save className="w-4 h-4 mr-2" /> Salvar & Gerar QR
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-700">Rebanho ({filteredAnimals.length})</h3>
              <p className="text-sm text-slate-500">{selectedFarm ? `Mostrando somente registros da fazenda ${selectedFarm.nome}.` : 'Mostrando o consolidado do rebanho.'}</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" placeholder="Buscar por nome, brinco, lote, fazenda, raça..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select className="p-2 border rounded-lg" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="todos">Todos os status</option>
              <option value="Ativo">Ativo</option>
              <option value="Vendido">Vendido</option>
              <option value="Morto">Morto</option>
              <option value="Doente">Doente</option>
            </select>
            <select className="p-2 border rounded-lg" value={loteFilter} onChange={(e) => setLoteFilter(e.target.value)}>
              <option value="todos">Todos os lotes</option>
              {loteOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className="p-2 border rounded-lg" value={fazendaFilter} onChange={(e) => setFazendaFilter(e.target.value)}>
              <option value="todos">Todas as fazendas/pastagens</option>
              {fazendaOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="p-4">Brinco</th>
                <th className="p-4">Nome</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Raça</th>
                <th className="p-4">Lote</th>
                <th className="p-4">Fazenda</th>
                <th className="p-4">Próx. cuidado</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAnimals.map((item) => {
                const nextCare = getNextCareByAnimal(item.id);
                const isHighlighted = highlightedAnimalId === item.id;
                const fullItem = buildAnimalDetails(item);
                return (
                  <tr key={item.id} className={`hover:bg-slate-50 ${isHighlighted ? 'bg-blue-50/70' : ''}`}>
                    <td className="p-4 font-mono font-medium">{item.brinco}</td>
                    <td className="p-4 font-bold text-slate-700">{item.nome}</td>
                    <td className="p-4">{item.categoria}</td>
                    <td className="p-4">{item.raca || '-'}</td>
                    <td className="p-4">{item.lote || '-'}</td>
                    <td className="p-4">{fullItem.fazenda || '-'}</td>
                    <td className="p-4">{nextCare?.proxima_data ? new Date(nextCare.proxima_data).toLocaleDateString('pt-BR') : '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Ativo' ? 'bg-green-100 text-green-700' : item.status === 'Morto' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-200" onClick={() => setSelectedAnimalQR(fullItem)}>
                          <QrCode className="w-4 h-4 mr-2" /> QR
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setHighlightedAnimalId(item.id); setSelectedAnimalHistorico(fullItem); }}>
                          <History className="w-4 h-4 mr-2" /> Histórico
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedAnimalMov(fullItem)}>
                          <ArrowRightLeft className="w-4 h-4 mr-2" /> Movimentar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedAnimalPesagem(fullItem)}>
                          <Scale className="w-4 h-4 mr-2" /> Pesagem
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedAnimalAlimentacao(fullItem)}>
                          <UtensilsCrossed className="w-4 h-4 mr-2" /> Alimentação
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedAnimalContagem(fullItem)}>
                          <Hash className="w-4 h-4 mr-2" /> Contagem
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedAnimalPreGta(fullItem)}>
                          <Truck className="w-4 h-4 mr-2" /> Pré-GTA
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAnimals.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-slate-500">Nenhum animal encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAnimalQR && <BovinoQRModal animal={selectedAnimalQR} onClose={() => setSelectedAnimalQR(null)} />}
      {selectedAnimalHistorico && (
        <BovinoHistoricoModal
          animal={selectedAnimalHistorico}
          historicoSanitario={getHistoricoByAnimal(selectedAnimalHistorico.id)}
          movimentacoes={getMovimentacoesByAnimal(selectedAnimalHistorico.id)}
          pesagens={getPesagensByAnimal(selectedAnimalHistorico.id)}
          alimentacoes={getAlimentacoesByAnimal(selectedAnimalHistorico.id)}
          contagens={getContagensByAnimal(selectedAnimalHistorico.id)}
          preGtas={getPreGtasByAnimal(selectedAnimalHistorico.id)}
          onClose={() => setSelectedAnimalHistorico(null)}
        />
      )}
      {selectedAnimalMov && <MovimentacaoBovinoModal animal={selectedAnimalMov} onClose={() => setSelectedAnimalMov(null)} onSaved={() => fetchMovimentacoes(1, 2000)} />}
      {selectedAnimalPesagem && <PesagemBovinoModal animal={selectedAnimalPesagem} records={getPesagensByAnimal(selectedAnimalPesagem.id)} onClose={() => setSelectedAnimalPesagem(null)} onSaved={() => fetchPesagens(1, 2000)} />}
      {selectedAnimalAlimentacao && <AlimentacaoBovinoModal animal={selectedAnimalAlimentacao} records={getAlimentacoesByAnimal(selectedAnimalAlimentacao.id)} onClose={() => setSelectedAnimalAlimentacao(null)} onSaved={() => fetchAlimentacoes(1, 2000)} />}
      {selectedAnimalContagem && <ContagemBovinoModal animal={selectedAnimalContagem} records={getContagensByAnimal(selectedAnimalContagem.id)} onClose={() => setSelectedAnimalContagem(null)} onSaved={() => fetchContagens(1, 2000)} />}
      {selectedAnimalPreGta && <PreGtaBovinoModal animal={selectedAnimalPreGta} records={getPreGtasByAnimal(selectedAnimalPreGta.id)} onClose={() => setSelectedAnimalPreGta(null)} onSaved={() => fetchPreGtas(1, 2000)} />}
    </div>
  );
};

export default BovinosTab;
