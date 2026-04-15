import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Download, Search, Clock, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { PdfGenerator } from '@/utils/PdfGenerator';

const OrdensServicoTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: orders,
        fetchAll: fetchOrders,
        create: createOrder,
        update: updateOrder,
        remove: removeOrder,
    } = useSupabaseCrud('ordem_servicos_ordens');

    const {
        data: techs,
        fetchAll: fetchTechs,
    } = useSupabaseCrud('ordem_servicos_tecnicos');

    const {
        data: clients,
        fetchAll: fetchClients,
    } = useSupabaseCrud('sac_crm_clientes');

    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todas');

    const initialForm = {
        id: '',
        clienteId: '',
        clienteNome: '',
        endereco: '',
        contato: '',
        descricao: '',
        tecnicoId: '',
        tecnicoNome: '',
        prioridade: 'Média',
        status: 'Aberta',
        dataPrevista: '',
        dataExecucao: '',
        horaEntrada: '',
        horaSaida: '',
        tempoAtendimento: '',
        tipoServico: '',
        observacoes: '',
        anexo: '',
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (user) {
            fetchOrders();
            fetchTechs();
            fetchClients();
        }
    }, [user, fetchOrders, fetchTechs, fetchClients]);

    const calculateTime = (entrada, saida) => {
        if (!entrada || !saida) return '';
        const [h1, m1] = entrada.split(':').map(Number);
        const [h2, m2] = saida.split(':').map(Number);
        const diffMinutes = h2 * 60 + m2 - (h1 * 60 + m1);
        if (diffMinutes < 0) return 'Erro';
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        return `${hours}h ${mins}m`;
    };

    const handleTimeChange = (field, value) => {
        const newData = { ...formData, [field]: value };

        if (field === 'horaEntrada' || field === 'horaSaida') {
            const ent = field === 'horaEntrada' ? value : formData.horaEntrada;
            const sai = field === 'horaSaida' ? value : formData.horaSaida;
            newData.tempoAtendimento = calculateTime(ent, sai);
        }

        setFormData(newData);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Usuário não autenticado.',
            });
            return;
        }

        if (!formData.clienteNome || !formData.descricao) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Campos obrigatórios faltando.',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            cliente: formData.clienteNome,
            endereco: formData.endereco || null,
            contato: formData.contato || null,
            descricao: formData.descricao,
            tecnico_id: formData.tecnicoId || null,
            prioridade: formData.prioridade || 'Média',
            status: formData.status || 'Aberta',
            data_prevista: formData.dataPrevista || null,
            data_execucao: formData.dataExecucao || null,
            hora_entrada: formData.horaEntrada || null,
            hora_saida: formData.horaSaida || null,
            tempo_atendimento: formData.tempoAtendimento || null,
            tipo_servico: formData.tipoServico || null,
            observacoes: formData.observacoes || null,
            anexo: formData.anexo || null,
        };

        try {
            if (formData.id) {
                await updateOrder(formData.id, payload);
                toast({
                    title: 'Atualizado',
                    description: 'OS atualizada com sucesso.',
                });
            } else {
                await createOrder(payload);
                toast({
                    title: 'Criado',
                    description: 'Nova OS criada com sucesso.',
                });
            }

            await fetchOrders();
            setIsEditing(false);
            setFormData(initialForm);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Falha ao salvar OS.',
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta OS?')) return;

        try {
            await removeOrder(id);
            await fetchOrders();
            toast({
                title: 'Excluído',
                description: 'OS removida.',
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Falha ao excluir OS.',
            });
        }
    };

    const handlePdf = (os) => {
        toast({
            title: 'Gerando PDF',
            description: 'Aguarde um momento...',
        });

        try {
            const tecnicoNome = techs.find((t) => t.id === os.tecnico_id)?.nome || '-';

            PdfGenerator.generateOS({
                ...os,
                clienteNome: os.cliente,
                tecnicoNome,
                dataPrevista: os.data_prevista,
                dataExecucao: os.data_execucao,
                horaEntrada: os.hora_entrada,
                horaSaida: os.hora_saida,
                tempoAtendimento: os.tempo_atendimento,
                tipoServico: os.tipo_servico,
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Falha ao gerar PDF.',
            });
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((o) => {
            const tecnicoNome = techs.find((t) => t.id === o.tecnico_id)?.nome || '';

            const matchesSearch =
                o.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tecnicoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.id?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'Todas' || o.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, techs, searchTerm, statusFilter]);

    const openEditForm = (os) => {
        setFormData({
            id: os.id,
            clienteId: '',
            clienteNome: os.cliente || '',
            endereco: os.endereco || '',
            contato: os.contato || '',
            descricao: os.descricao || '',
            tecnicoId: os.tecnico_id || '',
            tecnicoNome: techs.find((t) => t.id === os.tecnico_id)?.nome || '',
            prioridade: os.prioridade || 'Média',
            status: os.status || 'Aberta',
            dataPrevista: os.data_prevista || '',
            dataExecucao: os.data_execucao || '',
            horaEntrada: os.hora_entrada || '',
            horaSaida: os.hora_saida || '',
            tempoAtendimento: os.tempo_atendimento || '',
            tipoServico: os.tipo_servico || '',
            observacoes: os.observacoes || '',
            anexo: os.anexo || '',
        });
        setIsEditing(true);
    };

    return (
        <div className="space-y-6">
            {!isEditing ? (
                <>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex gap-4 w-full md:w-auto flex-1">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Buscar OS, cliente, técnico..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <select
                                className="p-2 border rounded-lg text-sm bg-white"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="Todas">Todos os Status</option>
                                <option value="Aberta">Aberta</option>
                                <option value="Em Atendimento">Em Atendimento</option>
                                <option value="Aguardando Peças">Aguardando Peças</option>
                                <option value="Concluída">Concluída</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                        </div>

                        <Button
                            onClick={() => {
                                setFormData(initialForm);
                                setIsEditing(true);
                            }}
                            className="bg-[#3b82f6] text-white w-full md:w-auto"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nova OS
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">Serviço / Descrição</th>
                                        <th className="p-4">Técnico</th>
                                        <th className="p-4">Prioridade</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Data Prev.</th>
                                        <th className="p-4 text-right">Ações</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="p-8 text-center text-slate-500">
                                                Nenhuma OS encontrada.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((os) => (
                                            <tr key={os.id} className="hover:bg-slate-50">
                                                <td className="p-4 font-bold text-slate-700">{os.cliente}</td>
                                                <td className="p-4 max-w-xs truncate">{os.descricao}</td>
                                                <td className="p-4">
                                                    {techs.find((t) => t.id === os.tecnico_id)?.nome || '-'}
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-semibold
                              ${os.prioridade === 'Alta' || os.prioridade === 'Crítica'
                                                                ? 'bg-red-100 text-red-700'
                                                                : os.prioridade === 'Média'
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}
                                                    >
                                                        {os.prioridade}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-semibold border
                              ${os.status === 'Concluída'
                                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                                : os.status === 'Aberta'
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                    : os.status === 'Cancelada'
                                                                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                                                                        : 'bg-orange-50 text-orange-700 border-orange-200'
                                                            }`}
                                                    >
                                                        {os.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-500">
                                                    {os.data_prevista
                                                        ? new Date(os.data_prevista).toLocaleDateString()
                                                        : '-'}
                                                </td>
                                                <td className="p-4 text-right flex justify-end gap-1">
                                                    <Button size="sm" variant="ghost" onClick={() => handlePdf(os)}>
                                                        <Download className="w-4 h-4 text-slate-500" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => openEditForm(os)}>
                                                        <Edit className="w-4 h-4 text-blue-600" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(os.id)}>
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800">Detalhes da Ordem de Serviço</h3>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    </div>

                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Cliente *</label>
                            <input
                                list="clientes-list"
                                className="w-full p-2 border rounded"
                                value={formData.clienteNome}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const existingClient = clients.find((c) => c.nome === val);

                                    if (existingClient) {
                                        setFormData((prev) => ({
                                            ...prev,
                                            clienteId: existingClient.id,
                                            clienteNome: existingClient.nome || val,
                                            endereco: existingClient.endereco || '',
                                            contato: existingClient.telefone || '',
                                        }));
                                    } else {
                                        setFormData((prev) => ({
                                            ...prev,
                                            clienteNome: val,
                                        }));
                                    }
                                }}
                                placeholder="Nome do Cliente"
                                required
                            />
                            <datalist id="clientes-list">
                                {clients.map((c) => (
                                    <option key={c.id} value={c.nome} />
                                ))}
                            </datalist>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Técnico Responsável</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={formData.tecnicoId}
                                onChange={(e) => {
                                    const t = techs.find((tc) => tc.id === e.target.value);
                                    setFormData({
                                        ...formData,
                                        tecnicoId: e.target.value,
                                        tecnicoNome: t ? t.nome : '',
                                    });
                                }}
                            >
                                <option value="">Selecione...</option>
                                {techs.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Endereço</label>
                            <input
                                value={formData.endereco}
                                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Endereço do serviço"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Contato</label>
                            <input
                                value={formData.contato}
                                onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Telefone / Nome contato"
                            />
                        </div>

                        <div className="md:col-span-4">
                            <label className="text-sm font-medium mb-1 block">
                                Descrição do Problema / Serviço *
                            </label>
                            <textarea
                                rows={3}
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Descreva o problema ou serviço a ser realizado..."
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Prioridade</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={formData.prioridade}
                                onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                            >
                                <option value="Baixa">Baixa</option>
                                <option value="Média">Média</option>
                                <option value="Alta">Alta</option>
                                <option value="Crítica">Crítica</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Status</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Aberta">Aberta</option>
                                <option value="Em Atendimento">Em Atendimento</option>
                                <option value="Aguardando Peças">Aguardando Peças</option>
                                <option value="Concluída">Concluída</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Tipo de Serviço</label>
                            <input
                                value={formData.tipoServico}
                                onChange={(e) => setFormData({ ...formData, tipoServico: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Ex: Manutenção"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Data Prevista</label>
                            <input
                                type="date"
                                value={formData.dataPrevista}
                                onChange={(e) => setFormData({ ...formData, dataPrevista: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div className="md:col-span-4 border-t border-slate-100 mt-4 pt-4 mb-2">
                            <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Execução e Tempos
                            </h4>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Data Execução</label>
                            <input
                                type="date"
                                value={formData.dataExecucao}
                                onChange={(e) => setFormData({ ...formData, dataExecucao: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Hora Entrada</label>
                            <input
                                type="time"
                                value={formData.horaEntrada}
                                onChange={(e) => handleTimeChange('horaEntrada', e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Hora Saída</label>
                            <input
                                type="time"
                                value={formData.horaSaida}
                                onChange={(e) => handleTimeChange('horaSaida', e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Tempo Total</label>
                            <input
                                value={formData.tempoAtendimento}
                                readOnly
                                className="w-full p-2 border rounded bg-slate-50 font-mono"
                            />
                        </div>

                        <div className="md:col-span-4">
                            <label className="text-sm font-medium mb-1 block">Observações Técnicas</label>
                            <textarea
                                rows={2}
                                value={formData.observacoes}
                                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Observações adicionais..."
                            />
                        </div>

                        <div className="md:col-span-4">
                            <label className="text-sm font-medium mb-1 block">
                                Anexos (Link/URL por enquanto)
                            </label>
                            <input
                                value={formData.anexo}
                                onChange={(e) => setFormData({ ...formData, anexo: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="http://..."
                            />
                        </div>

                        <div className="md:col-span-4 flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-[#3b82f6] text-white">
                                <Save className="w-4 h-4 mr-2" />
                                Salvar Ordem de Serviço
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default OrdensServicoTab;