import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Save, Search, X, Paperclip, Filter } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const AtendimentosTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: tickets,
        fetchAll: fetchTickets,
        create,
        update,
        remove,
    } = useSupabaseCrud('sac_crm_atendimentos');

    const {
        data: clients,
        fetchAll: fetchClients,
    } = useSupabaseCrud('sac_crm_clientes');

    const {
        data: suppliers,
        fetchAll: fetchSuppliers,
    } = useSupabaseCrud('sac_crm_fornecedores');

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [isEditing, setIsEditing] = useState(false);

    const initialFormState = {
        id: '',
        tipo: 'Cliente',
        vinculoId: '',
        vinculoNome: '',
        canal: 'Telefone',
        tipoAtendimento: 'Dúvida',
        direcao: 'Recebida',
        dataInicio: new Date().toISOString().slice(0, 16),
        dataFim: '',
        atendente: '',
        assunto: '',
        descricao: '',
        prioridade: 'Média',
        status: 'Aberto',
        anexos: [],
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (user) {
            fetchTickets();
            fetchClients();
            fetchSuppliers();
        }
    }, [user, fetchTickets, fetchClients, fetchSuppliers]);

    const resetForm = () => {
        setFormData({
            ...initialFormState,
            dataInicio: new Date().toISOString().slice(0, 16),
        });
        setIsEditing(false);
    };

    const handleEntityChange = (e) => {
        const id = e.target.value;
        const list = formData.tipo === 'Cliente' ? clients : suppliers;
        const entity = list.find((item) => item.id === id);

        setFormData((prev) => ({
            ...prev,
            vinculoId: id,
            vinculoNome: entity ? entity.nome : '',
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            setFormData((prev) => ({
                ...prev,
                anexos: [...prev.anexos, fileName],
            }));
            toast({ title: 'Anexo adicionado', description: fileName });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!formData.assunto || !formData.vinculoId) {
            toast({
                title: 'Erro',
                description: 'Preencha o assunto e selecione o vínculo.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            cliente_id: formData.tipo === 'Cliente' ? formData.vinculoId : null,
            fornecedor_id: formData.tipo === 'Fornecedor' ? formData.vinculoId : null,
            data: formData.dataInicio ? new Date(formData.dataInicio).toISOString() : null,
            data_fim: formData.dataFim ? new Date(formData.dataFim).toISOString() : null,
            tipo: formData.tipoAtendimento || null,
            canal: formData.canal || null,
            descricao: formData.descricao || null,
            responsavel: formData.atendente || null,
            status: formData.status || 'Aberto',
            observacoes: null,
            assunto: formData.assunto || null,
            prioridade: formData.prioridade || 'Média',
            direcao: formData.direcao || 'Recebida',
            anexos: formData.anexos || [],
        };

        try {
            if (formData.id) {
                await update(formData.id, payload);
                toast({
                    title: 'Sucesso',
                    description: 'Atendimento atualizado.',
                });
            } else {
                await create(payload);
                toast({
                    title: 'Sucesso',
                    description: 'Atendimento registrado.',
                });
            }

            await fetchTickets();
            resetForm();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao salvar atendimento.',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir este atendimento?')) return;

        try {
            await remove(id);
            await fetchTickets();
            toast({
                title: 'Removido',
                description: 'Atendimento excluído.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao excluir atendimento.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (item) => {
        const isCliente = !!item.cliente_id;
        const entityList = isCliente ? clients : suppliers;
        const entityId = isCliente ? item.cliente_id : item.fornecedor_id;
        const entity = entityList.find((x) => x.id === entityId);

        setFormData({
            id: item.id,
            tipo: isCliente ? 'Cliente' : 'Fornecedor',
            vinculoId: entityId || '',
            vinculoNome: entity ? entity.nome : '',
            canal: item.canal || 'Telefone',
            tipoAtendimento: item.tipo || 'Dúvida',
            direcao: item.direcao || 'Recebida',
            dataInicio: item.data ? new Date(item.data).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
            dataFim: item.data_fim ? new Date(item.data_fim).toISOString().slice(0, 16) : '',
            atendente: item.responsavel || '',
            assunto: item.assunto || '',
            descricao: item.descricao || '',
            prioridade: item.prioridade || 'Média',
            status: item.status || 'Aberto',
            anexos: Array.isArray(item.anexos) ? item.anexos : [],
        });

        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredTickets = useMemo(() => {
        return tickets.filter((item) => {
            const isCliente = !!item.cliente_id;
            const entityList = isCliente ? clients : suppliers;
            const entityId = isCliente ? item.cliente_id : item.fornecedor_id;
            const entity = entityList.find((x) => x.id === entityId);
            const vinculoNome = entity?.nome || '';

            const matchesSearch =
                (item.assunto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                vinculoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.id || '').includes(searchTerm);

            const matchesStatus = filterStatus === 'Todos' || item.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [tickets, clients, suppliers, searchTerm, filterStatus]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isEditing ? 'Editar Atendimento' : 'Novo Atendimento'}
                    </h2>
                    {isEditing && (
                        <Button variant="ghost" onClick={resetForm} size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Vínculo</label>
                        <div className="flex gap-4 p-2 border rounded bg-slate-50">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formData.tipo === 'Cliente'}
                                    onChange={() =>
                                        setFormData({
                                            ...formData,
                                            tipo: 'Cliente',
                                            vinculoId: '',
                                            vinculoNome: '',
                                        })
                                    }
                                />
                                Cliente
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formData.tipo === 'Fornecedor'}
                                    onChange={() =>
                                        setFormData({
                                            ...formData,
                                            tipo: 'Fornecedor',
                                            vinculoId: '',
                                            vinculoNome: '',
                                        })
                                    }
                                />
                                Fornecedor
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Selecione o {formData.tipo}
                        </label>
                        <select
                            className="w-full p-2 border rounded"
                            value={formData.vinculoId}
                            onChange={handleEntityChange}
                            required
                        >
                            <option value="">Selecione...</option>
                            {(formData.tipo === 'Cliente' ? clients : suppliers).map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                            className="w-full p-2 border rounded font-medium"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Aberto">Aberto</option>
                            <option value="Em Andamento">Em Andamento</option>
                            <option value="Aguardando Cliente">Aguardando Cliente</option>
                            <option value="Resolvido">Resolvido</option>
                            <option value="Cancelado">Cancelado</option>
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Canal</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={formData.canal}
                            onChange={(e) => setFormData({ ...formData, canal: e.target.value })}
                        >
                            <option value="Telefone">Telefone</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="E-mail">E-mail</option>
                            <option value="Presencial">Presencial</option>
                            <option value="Site/Chat">Site/Chat</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Demanda</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={formData.tipoAtendimento}
                            onChange={(e) => setFormData({ ...formData, tipoAtendimento: e.target.value })}
                        >
                            <option value="Dúvida">Dúvida</option>
                            <option value="Reclamação">Reclamação</option>
                            <option value="Suporte Técnico">Suporte Técnico</option>
                            <option value="Cobrança">Cobrança</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Direção</label>
                        <div className="flex gap-2 text-sm pt-2">
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    checked={formData.direcao === 'Recebida'}
                                    onChange={() => setFormData({ ...formData, direcao: 'Recebida' })}
                                />
                                Recebida
                            </label>
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    checked={formData.direcao === 'Efetuada'}
                                    onChange={() => setFormData({ ...formData, direcao: 'Efetuada' })}
                                />
                                Efetuada
                            </label>
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={formData.prioridade}
                            onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                        >
                            <option value="Baixa">Baixa</option>
                            <option value="Média">Média</option>
                            <option value="Alta">Alta</option>
                            <option value="Urgente">Urgente</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data/Hora Início</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 border rounded"
                            value={formData.dataInicio}
                            onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data/Hora Fim</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 border rounded"
                            value={formData.dataFim}
                            onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Atendente</label>
                        <input
                            className="w-full p-2 border rounded"
                            placeholder="Nome do Atendente"
                            value={formData.atendente}
                            onChange={(e) => setFormData({ ...formData, atendente: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Assunto</label>
                        <input
                            className="w-full p-2 border rounded"
                            placeholder="Resumo do atendimento"
                            value={formData.assunto}
                            onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                            required
                        />
                    </div>

                    <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descrição Detalhada</label>
                        <textarea
                            className="w-full p-2 border rounded h-32"
                            placeholder="Descreva o que foi tratado..."
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-4 flex justify-between items-center bg-slate-50 p-3 rounded border">
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                                <Paperclip className="w-4 h-4" />
                                Anexar Arquivo
                                <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                            {formData.anexos.length > 0 && (
                                <span className="text-xs text-slate-500">
                                    {formData.anexos.length} arquivo(s) anexado(s)
                                </span>
                            )}
                        </div>

                        <Button type="submit" className="bg-[#1e3a8a] text-white hover:bg-blue-800">
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Atendimento
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-700">Histórico de Atendimentos</h3>
                        <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                            {filteredTickets.length}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select
                                className="pl-9 pr-8 py-2 border rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="Todos">Status: Todos</option>
                                <option value="Aberto">Aberto</option>
                                <option value="Em Andamento">Em Andamento</option>
                                <option value="Resolvido">Resolvido</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                                placeholder="Buscar por assunto, nome, ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="p-4 w-20">ID</th>
                                <th className="p-4">Cliente / Fornecedor</th>
                                <th className="p-4">Assunto / Canal</th>
                                <th className="p-4">Prioridade</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Data</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-500">
                                        Nenhum atendimento encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredTickets.map((item) => {
                                    const isCliente = !!item.cliente_id;
                                    const entityList = isCliente ? clients : suppliers;
                                    const entityId = isCliente ? item.cliente_id : item.fornecedor_id;
                                    const entity = entityList.find((x) => x.id === entityId);
                                    const vinculoNome = entity?.nome || 'Vínculo não encontrado';

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="p-4 text-xs font-mono text-slate-400">
                                                {item.id.slice(0, 6)}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-slate-800">{vinculoNome}</div>
                                                <div className="text-xs text-slate-500">
                                                    {isCliente ? 'Cliente' : 'Fornecedor'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-slate-800 font-medium">{item.assunto}</div>
                                                <div className="text-xs text-slate-500">
                                                    {item.canal} - {item.tipo}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-xs font-medium
                            ${item.prioridade === 'Urgente'
                                                            ? 'bg-red-100 text-red-700'
                                                            : item.prioridade === 'Alta'
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : 'bg-blue-50 text-blue-700'
                                                        }`}
                                                >
                                                    {item.prioridade}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${item.status === 'Aberto'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : item.status === 'Resolvido'
                                                                ? 'bg-green-100 text-green-700'
                                                                : item.status === 'Cancelado'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                        }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-500 text-xs">
                                                {item.data ? new Date(item.data).toLocaleDateString() : '-'}
                                                <br />
                                                {item.data ? new Date(item.data).toLocaleTimeString().slice(0, 5) : ''}
                                            </td>
                                            <td className="p-4 text-right space-x-1">
                                                <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AtendimentosTab;