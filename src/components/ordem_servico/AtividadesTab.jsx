import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Search, X, Save, ClipboardList, Clock3, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const initialForm = {
    id: '',
    ordem_id: '',
    titulo: '',
    descricao: '',
    responsavel: '',
    status: 'Pendente',
    data_inicio: '',
    data_fim: '',
    tempo_gasto: '',
    observacoes: '',
};

const formatDate = (value) => {
    if (!value) return '-';
    try {
        return new Date(value).toLocaleDateString('pt-BR');
    } catch {
        return value;
    }
};

const statusColors = {
    Pendente: 'bg-amber-100 text-amber-700',
    'Em andamento': 'bg-blue-100 text-blue-700',
    Concluída: 'bg-emerald-100 text-emerald-700',
    Cancelada: 'bg-red-100 text-red-700',
};

const AtividadesTab = () => {
    const { user } = useAuth();
    const { toast } = useToast();

    const {
        data: atividades,
        fetchAll: fetchAtividades,
        create: createAtividade,
        update: updateAtividade,
        remove: removeAtividade,
        loading,
    } = useSupabaseCrud('ordem_servicos_atividades');

    const { data: ordens, fetchAll: fetchOrdens } = useSupabaseCrud('ordem_servicos_ordens');
    const { data: tecnicos, fetchAll: fetchTecnicos } = useSupabaseCrud('ordem_servicos_tecnicos');

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialForm);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todas');
    const [ordemFilter, setOrdemFilter] = useState('Todas');

    useEffect(() => {
        if (user) {
            fetchAtividades(1, 1000);
            fetchOrdens(1, 1000);
            fetchTecnicos(1, 1000);
        }
    }, [user, fetchAtividades, fetchOrdens, fetchTecnicos]);

    const ordensMap = useMemo(() => {
        return (ordens || []).reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});
    }, [ordens]);

    const filteredAtividades = useMemo(() => {
        return (atividades || []).filter((atividade) => {
            const ordem = ordensMap[atividade.ordem_id];
            const ordemLabel = ordem
                ? `${ordem.cliente || ''} ${ordem.descricao || ''}`.toLowerCase()
                : '';

            const matchesSearch =
                !searchTerm ||
                [
                    atividade.titulo,
                    atividade.descricao,
                    atividade.responsavel,
                    atividade.status,
                    atividade.tempo_gasto,
                    atividade.observacoes,
                    ordemLabel,
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === 'Todas' || atividade.status === statusFilter;
            const matchesOrdem = ordemFilter === 'Todas' || atividade.ordem_id === ordemFilter;

            return matchesSearch && matchesStatus && matchesOrdem;
        });
    }, [atividades, ordensMap, searchTerm, statusFilter, ordemFilter]);

    const resumo = useMemo(() => {
        return {
            total: filteredAtividades.length,
            pendentes: filteredAtividades.filter((a) => a.status === 'Pendente').length,
            andamento: filteredAtividades.filter((a) => a.status === 'Em andamento').length,
            concluidas: filteredAtividades.filter((a) => a.status === 'Concluída').length,
        };
    }, [filteredAtividades]);

    const resetForm = () => {
        setFormData(initialForm);
        setIsEditing(false);
    };

    const handleEdit = (atividade) => {
        setFormData({
            id: atividade.id,
            ordem_id: atividade.ordem_id || '',
            titulo: atividade.titulo || '',
            descricao: atividade.descricao || '',
            responsavel: atividade.responsavel || '',
            status: atividade.status || 'Pendente',
            data_inicio: atividade.data_inicio || '',
            data_fim: atividade.data_fim || '',
            tempo_gasto: atividade.tempo_gasto || '',
            observacoes: atividade.observacoes || '',
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta atividade?')) return;
        await removeAtividade(id);
        await fetchAtividades(1, 1000);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!formData.ordem_id || !formData.titulo) {
            toast({
                title: 'Campos obrigatórios',
                description: 'Selecione a OS e informe o título da atividade.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            ordem_id: formData.ordem_id,
            titulo: formData.titulo,
            descricao: formData.descricao || null,
            responsavel: formData.responsavel || null,
            status: formData.status || 'Pendente',
            data_inicio: formData.data_inicio || null,
            data_fim: formData.data_fim || null,
            tempo_gasto: formData.tempo_gasto || null,
            observacoes: formData.observacoes || null,
            updated_at: new Date().toISOString(),
        };

        if (formData.id) {
            await updateAtividade(formData.id, payload);
        } else {
            await createAtividade(payload);
        }

        await fetchAtividades(1, 1000);
        resetForm();
    };

    return (
        <div className="space-y-6">
            {!isEditing ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500">Atividades</div>
                            <div className="text-2xl font-bold text-slate-800">{resumo.total}</div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500">Pendentes</div>
                            <div className="text-2xl font-bold text-amber-600">{resumo.pendentes}</div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500">Em andamento</div>
                            <div className="text-2xl font-bold text-blue-600">{resumo.andamento}</div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500">Concluídas</div>
                            <div className="text-2xl font-bold text-emerald-600">{resumo.concluidas}</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Atividades por Ordem de Serviço</h3>
                                <p className="text-sm text-slate-500">Registre tarefas, responsáveis, tempo gasto e andamento de cada OS.</p>
                            </div>
                            <Button onClick={() => setIsEditing(true)} className="bg-[#3b82f6] text-white">
                                <Plus className="w-4 h-4 mr-2" /> Nova atividade
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 p-2 border rounded-lg"
                                    placeholder="Buscar atividade, responsável ou OS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <select
                                className="w-full p-2 border rounded-lg"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="Todas">Todos os status</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Em andamento">Em andamento</option>
                                <option value="Concluída">Concluída</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>

                            <select
                                className="w-full p-2 border rounded-lg"
                                value={ordemFilter}
                                onChange={(e) => setOrdemFilter(e.target.value)}
                            >
                                <option value="Todas">Todas as OS</option>
                                {(ordens || []).map((ordem) => (
                                    <option key={ordem.id} value={ordem.id}>
                                        {ordem.cliente || 'Cliente'} • {ordem.descricao || 'Sem descrição'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500">Carregando atividades...</div>
                        ) : filteredAtividades.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">Nenhuma atividade encontrada.</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredAtividades.map((atividade) => {
                                    const ordem = ordensMap[atividade.ordem_id];
                                    return (
                                        <div key={atividade.id} className="p-5 hover:bg-slate-50 transition-colors">
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                <div className="space-y-3 flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[atividade.status] || 'bg-slate-100 text-slate-700'}`}>
                                                            {atividade.status || 'Pendente'}
                                                        </span>
                                                        <h4 className="text-lg font-semibold text-slate-800">{atividade.titulo}</h4>
                                                    </div>

                                                    <div className="text-sm text-slate-600">
                                                        <span className="font-medium text-slate-700">OS:</span>{' '}
                                                        {ordem ? `${ordem.cliente || 'Cliente'} • ${ordem.descricao || 'Sem descrição'}` : 'OS não encontrada'}
                                                    </div>

                                                    {atividade.descricao ? (
                                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{atividade.descricao}</p>
                                                    ) : null}

                                                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <User className="w-4 h-4" />
                                                            {atividade.responsavel || 'Sem responsável'}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <Clock3 className="w-4 h-4" />
                                                            {atividade.tempo_gasto || 'Tempo não informado'}
                                                        </span>
                                                        <span>
                                                            <strong>Início:</strong> {formatDate(atividade.data_inicio)}
                                                        </span>
                                                        <span>
                                                            <strong>Fim:</strong> {formatDate(atividade.data_fim)}
                                                        </span>
                                                    </div>

                                                    {atividade.observacoes ? (
                                                        <div className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                            <strong className="text-slate-600">Observações:</strong> {atividade.observacoes}
                                                        </div>
                                                    ) : null}
                                                </div>

                                                <div className="flex items-center gap-2 self-start">
                                                    <Button variant="outline" size="sm" onClick={() => handleEdit(atividade)}>
                                                        <Edit className="w-4 h-4 mr-2" /> Editar
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleDelete(atividade.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{formData.id ? 'Editar atividade' : 'Nova atividade'}</h3>
                            <p className="text-sm text-slate-500">Vincule a atividade a uma OS e registre andamento e tempo gasto.</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetForm}>
                            <X className="w-4 h-4 mr-2" /> Cancelar
                        </Button>
                    </div>

                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Ordem de Serviço *</label>
                            <select
                                required
                                value={formData.ordem_id}
                                onChange={(e) => setFormData({ ...formData, ordem_id: e.target.value })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Selecione uma OS</option>
                                {(ordens || []).map((ordem) => (
                                    <option key={ordem.id} value={ordem.id}>
                                        {ordem.cliente || 'Cliente'} • {ordem.descricao || 'Sem descrição'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Título da atividade *</label>
                            <input
                                required
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Ex: Instalação de câmera, troca de roteador, visita técnica"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Descrição</label>
                            <textarea
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                className="w-full p-2 border rounded min-h-[110px]"
                                placeholder="Detalhes da atividade executada"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Responsável</label>
                            <input
                                list="os-tecnicos-list"
                                value={formData.responsavel}
                                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Nome do responsável"
                            />
                            <datalist id="os-tecnicos-list">
                                {(tecnicos || []).map((tecnico) => (
                                    <option key={tecnico.id} value={tecnico.nome || ''} />
                                ))}
                            </datalist>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="Pendente">Pendente</option>
                                <option value="Em andamento">Em andamento</option>
                                <option value="Concluída">Concluída</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Data de início</label>
                            <input
                                type="date"
                                value={formData.data_inicio}
                                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Data de fim</label>
                            <input
                                type="date"
                                value={formData.data_fim}
                                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Tempo gasto</label>
                            <input
                                value={formData.tempo_gasto}
                                onChange={(e) => setFormData({ ...formData, tempo_gasto: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Ex: 2h 30m"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Observações</label>
                            <textarea
                                value={formData.observacoes}
                                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                className="w-full p-2 border rounded min-h-[100px]"
                                placeholder="Observações adicionais da atividade"
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                            <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                            <Button type="submit" className="bg-[#3b82f6] text-white">
                                <Save className="w-4 h-4 mr-2" /> {formData.id ? 'Salvar atividade' : 'Registrar atividade'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AtividadesTab;
