import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Save, CheckCircle, Clock, X } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const FollowUpTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: tasks,
        fetchAll: fetchTasks,
        create,
        update,
        remove,
    } = useSupabaseCrud('sac_crm_followups');

    const {
        data: clients,
        fetchAll: fetchClients,
    } = useSupabaseCrud('sac_crm_clientes');

    const {
        data: suppliers,
        fetchAll: fetchSuppliers,
    } = useSupabaseCrud('sac_crm_fornecedores');

    const initialForm = {
        id: '',
        tipo: 'Cliente',
        entityId: '',
        entityName: '',
        dataPrevista: '',
        responsavel: '',
        tipoAcao: 'Ligar',
        descricao: '',
        status: 'Pendente',
    };

    const [formData, setFormData] = useState(initialForm);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            fetchTasks();
            fetchClients();
            fetchSuppliers();
        }
    }, [user, fetchTasks, fetchClients, fetchSuppliers]);

    const resetForm = () => {
        setFormData(initialForm);
        setIsEditing(false);
    };

    const handleEntityChange = (e) => {
        const id = e.target.value;
        const list = formData.tipo === 'Cliente' ? clients : suppliers;
        const entity = list.find((item) => item.id === id);

        setFormData((prev) => ({
            ...prev,
            entityId: id,
            entityName: entity ? entity.nome : '',
        }));
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

        if (!formData.descricao || !formData.dataPrevista) {
            toast({
                title: 'Erro',
                description: 'Descrição e data prevista são obrigatórias.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            cliente_id: formData.tipo === 'Cliente' ? formData.entityId || null : null,
            fornecedor_id: formData.tipo === 'Fornecedor' ? formData.entityId || null : null,
            data_prevista: formData.dataPrevista || null,
            responsavel: formData.responsavel || null,
            tipo_acao: formData.tipoAcao || null,
            descricao: formData.descricao,
            status: formData.status || 'Pendente',
        };

        try {
            if (formData.id) {
                await update(formData.id, payload);
                toast({
                    title: 'Sucesso',
                    description: 'Tarefa atualizada.',
                });
            } else {
                await create(payload);
                toast({
                    title: 'Sucesso',
                    description: 'Tarefa criada.',
                });
            }

            await fetchTasks();
            resetForm();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao salvar tarefa.',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir tarefa?')) return;

        try {
            await remove(id);
            await fetchTasks();
            toast({
                title: 'Removido',
                description: 'Tarefa excluída.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao excluir tarefa.',
                variant: 'destructive',
            });
        }
    };

    const handleToggleStatus = async (item) => {
        const newStatus = item.status === 'Pendente' ? 'Concluída' : 'Pendente';

        try {
            await update(item.id, { status: newStatus });
            await fetchTasks();
            toast({
                title: 'Atualizado',
                description: `Tarefa marcada como ${newStatus}.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao atualizar status.',
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
            entityId: entityId || '',
            entityName: entity ? entity.nome : '',
            dataPrevista: item.data_prevista || '',
            responsavel: item.responsavel || '',
            tipoAcao: item.tipo_acao || 'Ligar',
            descricao: item.descricao || '',
            status: item.status || 'Pendente',
        });

        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            if (a.status === b.status) {
                const da = a.data_prevista ? new Date(a.data_prevista).getTime() : 0;
                const db = b.data_prevista ? new Date(b.data_prevista).getTime() : 0;
                return da - db;
            }
            return a.status === 'Pendente' ? -1 : 1;
        });
    }, [tasks]);

    const getEntityName = (task) => {
        const isCliente = !!task.cliente_id;
        const entityList = isCliente ? clients : suppliers;
        const entityId = isCliente ? task.cliente_id : task.fornecedor_id;
        const entity = entityList.find((x) => x.id === entityId);
        return entity?.nome || 'Sem vínculo';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                    {isEditing ? 'Editar Tarefa' : 'Nova Tarefa / Follow-up'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium block mb-1">Tipo de vínculo</label>
                        <div className="flex gap-4 p-2 border rounded bg-slate-50">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formData.tipo === 'Cliente'}
                                    onChange={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            tipo: 'Cliente',
                                            entityId: '',
                                            entityName: '',
                                        }))
                                    }
                                />
                                Cliente
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={formData.tipo === 'Fornecedor'}
                                    onChange={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            tipo: 'Fornecedor',
                                            entityId: '',
                                            entityName: '',
                                        }))
                                    }
                                />
                                Fornecedor
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-1">Cliente / Fornecedor</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={formData.entityId}
                            onChange={handleEntityChange}
                        >
                            <option value="">Selecione...</option>
                            {(formData.tipo === 'Cliente' ? clients : suppliers).map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-1">Ação</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={formData.tipoAcao}
                            onChange={(e) => setFormData({ ...formData, tipoAcao: e.target.value })}
                        >
                            <option value="Ligar">Ligar</option>
                            <option value="Visitar">Visitar</option>
                            <option value="Enviar E-mail">Enviar E-mail</option>
                            <option value="Enviar Proposta">Enviar Proposta</option>
                            <option value="Cobrar">Cobrar</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-1">Data Prevista</label>
                        <input
                            type="date"
                            className="w-full p-2 border rounded"
                            value={formData.dataPrevista}
                            onChange={(e) => setFormData({ ...formData, dataPrevista: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-1">Responsável</label>
                        <input
                            className="w-full p-2 border rounded"
                            value={formData.responsavel}
                            onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                            placeholder="Quem fará a ação?"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-1">Descrição</label>
                        <textarea
                            className="w-full p-2 border rounded h-24"
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        {isEditing && (
                            <Button type="button" variant="ghost" onClick={resetForm}>
                                <X className="w-4 h-4 mr-1" />
                                Cancelar
                            </Button>
                        )}
                        <Button type="submit" className="bg-[#1e3a8a] text-white">
                            <Save className="w-4 h-4 mr-1" />
                            Salvar
                        </Button>
                    </div>
                </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Lista de Tarefas
                </h3>

                <div className="grid gap-3">
                    {sortedTasks.length === 0 ? (
                        <p className="text-slate-500 text-center py-8 bg-white rounded-xl border border-dashed">
                            Nenhuma tarefa agendada.
                        </p>
                    ) : (
                        sortedTasks.map((task) => (
                            <div
                                key={task.id}
                                className={`p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start transition-all ${task.status === 'Pendente'
                                        ? 'bg-white border-l-4 border-l-orange-400'
                                        : 'bg-slate-50 border-l-4 border-l-green-400 opacity-70'
                                    }`}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className={`text-xs font-bold px-2 py-0.5 rounded ${task.status === 'Pendente'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}
                                        >
                                            {task.status}
                                        </span>

                                        <span className="text-xs text-slate-500">
                                            {task.data_prevista
                                                ? new Date(task.data_prevista).toLocaleDateString()
                                                : '-'}
                                        </span>

                                        <span className="text-xs font-semibold text-blue-600">
                                            {task.tipo_acao}
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-slate-800">{getEntityName(task)}</h4>
                                    <p className="text-sm text-slate-600 mt-1">{task.descricao}</p>
                                    <p className="text-xs text-slate-400 mt-2">
                                        Responsável: {task.responsavel || 'N/A'}
                                    </p>
                                </div>

                                <div className="flex sm:flex-col gap-2">
                                    <Button
                                        size="sm"
                                        variant={task.status === 'Pendente' ? 'default' : 'outline'}
                                        className={task.status === 'Pendente' ? 'bg-green-600 hover:bg-green-700' : ''}
                                        onClick={() => handleToggleStatus(task)}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        {task.status === 'Pendente' ? 'Concluir' : 'Reabrir'}
                                    </Button>

                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(task)}>
                                        <Edit className="w-4 h-4 text-blue-600" />
                                    </Button>

                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(task.id)}>
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowUpTab;