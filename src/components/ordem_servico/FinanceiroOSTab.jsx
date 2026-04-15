import React, { useEffect, useMemo, useState } from 'react';
import {
    DollarSign,
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Save,
    Wrench,
    Package,
    Car,
    BadgeDollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const today = new Date().toISOString().split('T')[0];

const initialForm = {
    id: '',
    ordemId: '',
    tipoCusto: 'mao_obra',
    descricao: '',
    quantidade: '1',
    valorUnitario: '',
    responsavel: '',
    dataLancamento: today,
    observacoes: '',
};

const formatCurrency = (value) => {
    const number = Number(value || 0);
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(number);
};

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('pt-BR');
};

const getTypeMeta = (type) => {
    switch (type) {
        case 'mao_obra':
            return {
                label: 'Mão de obra',
                icon: Wrench,
                className: 'bg-blue-100 text-blue-700',
            };
        case 'material':
            return {
                label: 'Material',
                icon: Package,
                className: 'bg-amber-100 text-amber-700',
            };
        case 'deslocamento':
            return {
                label: 'Deslocamento',
                icon: Car,
                className: 'bg-emerald-100 text-emerald-700',
            };
        default:
            return {
                label: 'Outro',
                icon: BadgeDollarSign,
                className: 'bg-slate-100 text-slate-700',
            };
    }
};

const FinanceiroOSTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: lancamentos,
        loading,
        fetchAll: fetchLancamentos,
        create,
        update,
        remove,
    } = useSupabaseCrud('ordem_servicos_financeiro');

    const {
        data: orders,
        fetchAll: fetchOrders,
    } = useSupabaseCrud('ordem_servicos_ordens');

    const {
        data: techs,
        fetchAll: fetchTechs,
    } = useSupabaseCrud('ordem_servicos_tecnicos');

    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('todos');
    const [ordemFilter, setOrdemFilter] = useState('todas');
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (user) {
            fetchLancamentos(1, 2000);
            fetchOrders(1, 1000);
            fetchTechs(1, 1000);
        }
    }, [user, fetchLancamentos, fetchOrders, fetchTechs]);

    const orderOptions = useMemo(() => {
        return [...orders].sort((a, b) => {
            const clienteA = a.cliente || '';
            const clienteB = b.cliente || '';
            return clienteA.localeCompare(clienteB, 'pt-BR');
        });
    }, [orders]);

    const techNames = useMemo(() => {
        return [...techs]
            .map((tech) => tech.nome)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }, [techs]);

    const getOrderLabel = (ordemId) => {
        const order = orders.find((item) => item.id === ordemId);
        if (!order) return 'OS não encontrada';
        return `OS #${String(order.id).slice(0, 6)} • ${order.cliente || 'Sem cliente'}`;
    };

    const valorTotalAtual = useMemo(() => {
        const quantidade = Number(formData.quantidade || 0);
        const valorUnitario = Number(formData.valorUnitario || 0);
        return Number((quantidade * valorUnitario).toFixed(2));
    }, [formData.quantidade, formData.valorUnitario]);

    const resetForm = () => {
        setFormData(initialForm);
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Usuário não autenticado.',
            });
            return;
        }

        if (!formData.ordemId || !formData.descricao || !formData.valorUnitario) {
            toast({
                variant: 'destructive',
                title: 'Campos obrigatórios',
                description: 'Selecione a OS, informe a descrição e o valor unitário.',
            });
            return;
        }

        const quantidade = Number(formData.quantidade || 0);
        const valorUnitario = Number(formData.valorUnitario || 0);
        const valorTotal = Number((quantidade * valorUnitario).toFixed(2));

        const payload = {
            user_id: user.id,
            ordem_id: formData.ordemId,
            tipo_custo: formData.tipoCusto,
            descricao: formData.descricao,
            quantidade,
            valor_unitario: valorUnitario,
            valor_total: valorTotal,
            responsavel: formData.responsavel || null,
            data_lancamento: formData.dataLancamento || today,
            observacoes: formData.observacoes || null,
            updated_at: new Date().toISOString(),
        };

        try {
            if (formData.id) {
                await update(formData.id, payload);
            } else {
                await create(payload);
            }

            await fetchLancamentos(1, 2000);
            resetForm();
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Erro ao salvar',
                description: 'Não foi possível salvar o lançamento financeiro.',
            });
        }
    };

    const handleEdit = (item) => {
        setFormData({
            id: item.id,
            ordemId: item.ordem_id || '',
            tipoCusto: item.tipo_custo || 'mao_obra',
            descricao: item.descricao || '',
            quantidade: String(item.quantidade ?? 1),
            valorUnitario: String(item.valor_unitario ?? ''),
            responsavel: item.responsavel || '',
            dataLancamento: item.data_lancamento || today,
            observacoes: item.observacoes || '',
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Deseja excluir este lançamento financeiro?')) return;

        try {
            await remove(id);
            await fetchLancamentos(1, 2000);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Erro ao excluir',
                description: 'Não foi possível excluir o lançamento.',
            });
        }
    };

    const filteredLancamentos = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...lancamentos]
            .filter((item) => {
                const order = orders.find((ord) => ord.id === item.ordem_id);
                const cliente = order?.cliente || '';
                const matchesSearch =
                    !term ||
                    String(item.descricao || '').toLowerCase().includes(term) ||
                    String(item.responsavel || '').toLowerCase().includes(term) ||
                    String(cliente).toLowerCase().includes(term) ||
                    String(item.id || '').toLowerCase().includes(term);

                const matchesType = typeFilter === 'todos' || item.tipo_custo === typeFilter;
                const matchesOrder = ordemFilter === 'todas' || item.ordem_id === ordemFilter;

                return matchesSearch && matchesType && matchesOrder;
            })
            .sort((a, b) => {
                const da = a.data_lancamento ? new Date(a.data_lancamento).getTime() : 0;
                const db = b.data_lancamento ? new Date(b.data_lancamento).getTime() : 0;
                return db - da;
            });
    }, [lancamentos, orders, searchTerm, typeFilter, ordemFilter]);

    const totals = useMemo(() => {
        return filteredLancamentos.reduce(
            (acc, item) => {
                const total = Number(item.valor_total || 0);
                acc.geral += total;
                if (item.tipo_custo === 'mao_obra') acc.maoObra += total;
                else if (item.tipo_custo === 'material') acc.material += total;
                else if (item.tipo_custo === 'deslocamento') acc.deslocamento += total;
                else acc.outros += total;
                return acc;
            },
            {
                geral: 0,
                maoObra: 0,
                material: 0,
                deslocamento: 0,
                outros: 0,
            }
        );
    }, [filteredLancamentos]);

    const resumoPorOrdem = useMemo(() => {
        const grouped = new Map();

        filteredLancamentos.forEach((item) => {
            const key = item.ordem_id;
            const current = grouped.get(key) || {
                ordem_id: key,
                total: 0,
                count: 0,
            };

            current.total += Number(item.valor_total || 0);
            current.count += 1;
            grouped.set(key, current);
        });

        return Array.from(grouped.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    }, [filteredLancamentos]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-600" /> Financeiro da OS
                    </h2>
                    <p className="text-sm text-slate-500">
                        Lance custos de mão de obra, materiais, deslocamento e acompanhe o total por ordem.
                    </p>
                </div>

                <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#3b82f6] text-white"
                >
                    <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-sm text-slate-500">Total Geral</div>
                    <div className="mt-2 text-2xl font-bold text-slate-800">{formatCurrency(totals.geral)}</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-sm text-slate-500">Mão de Obra</div>
                    <div className="mt-2 text-2xl font-bold text-blue-700">{formatCurrency(totals.maoObra)}</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-sm text-slate-500">Materiais</div>
                    <div className="mt-2 text-2xl font-bold text-amber-700">{formatCurrency(totals.material)}</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-sm text-slate-500">Deslocamento</div>
                    <div className="mt-2 text-2xl font-bold text-emerald-700">{formatCurrency(totals.deslocamento)}</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="text-sm text-slate-500">Outros</div>
                    <div className="mt-2 text-2xl font-bold text-slate-700">{formatCurrency(totals.outros)}</div>
                </div>
            </div>

            {isEditing && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700">
                            {formData.id ? 'Editar lançamento' : 'Novo lançamento financeiro'}
                        </h3>
                        <Button variant="ghost" size="sm" onClick={resetForm}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Ordem de Serviço</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={formData.ordemId}
                                onChange={(e) => setFormData((prev) => ({ ...prev, ordemId: e.target.value }))}
                                required
                            >
                                <option value="">Selecione...</option>
                                {orderOptions.map((order) => (
                                    <option key={order.id} value={order.id}>
                                        {`OS #${String(order.id).slice(0, 6)} - ${order.cliente || 'Sem cliente'}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Tipo de custo</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={formData.tipoCusto}
                                onChange={(e) => setFormData((prev) => ({ ...prev, tipoCusto: e.target.value }))}
                            >
                                <option value="mao_obra">Mão de obra</option>
                                <option value="material">Material</option>
                                <option value="deslocamento">Deslocamento</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Data do lançamento</label>
                            <input
                                type="date"
                                value={formData.dataLancamento}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dataLancamento: e.target.value }))}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div className="md:col-span-2 xl:col-span-3">
                            <label className="text-sm font-medium mb-1 block">Descrição</label>
                            <input
                                type="text"
                                value={formData.descricao}
                                onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                                className="w-full p-2 border rounded"
                                placeholder="Ex.: visita técnica, cabo de rede, combustível, diária"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Quantidade</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.quantidade}
                                onChange={(e) => setFormData((prev) => ({ ...prev, quantidade: e.target.value }))}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Valor unitário</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.valorUnitario}
                                onChange={(e) => setFormData((prev) => ({ ...prev, valorUnitario: e.target.value }))}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Valor total</label>
                            <input
                                type="text"
                                value={formatCurrency(valorTotalAtual)}
                                className="w-full p-2 border rounded bg-slate-50 text-slate-700"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Responsável</label>
                            <input
                                list="responsaveis-os"
                                type="text"
                                value={formData.responsavel}
                                onChange={(e) => setFormData((prev) => ({ ...prev, responsavel: e.target.value }))}
                                className="w-full p-2 border rounded"
                                placeholder="Nome do técnico ou responsável"
                            />
                            <datalist id="responsaveis-os">
                                {techNames.map((name) => (
                                    <option key={name} value={name} />
                                ))}
                            </datalist>
                        </div>

                        <div className="md:col-span-2 xl:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Observações</label>
                            <textarea
                                value={formData.observacoes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
                                className="w-full p-3 border rounded min-h-[110px]"
                                placeholder="Detalhes adicionais do custo, centro de custo, reembolso, nota, etc."
                            />
                        </div>

                        <div className="md:col-span-2 xl:col-span-3 flex justify-end gap-2 mt-2">
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-[#3b82f6] text-white">
                                <Save className="w-4 h-4 mr-2" />
                                {formData.id ? 'Salvar alterações' : 'Salvar lançamento'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por descrição, responsável, cliente ou ID..."
                                className="w-full border rounded-lg pl-10 pr-3 py-2"
                            />
                        </div>

                        <div className="flex gap-3 flex-col sm:flex-row">
                            <select
                                className="border rounded-lg px-3 py-2"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="todos">Todos os tipos</option>
                                <option value="mao_obra">Mão de obra</option>
                                <option value="material">Material</option>
                                <option value="deslocamento">Deslocamento</option>
                                <option value="outro">Outros</option>
                            </select>

                            <select
                                className="border rounded-lg px-3 py-2"
                                value={ordemFilter}
                                onChange={(e) => setOrdemFilter(e.target.value)}
                            >
                                <option value="todas">Todas as OS</option>
                                {orderOptions.map((order) => (
                                    <option key={order.id} value={order.id}>
                                        {`OS #${String(order.id).slice(0, 6)}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="p-4">OS</th>
                                    <th className="p-4">Tipo</th>
                                    <th className="p-4">Descrição</th>
                                    <th className="p-4">Responsável</th>
                                    <th className="p-4">Data</th>
                                    <th className="p-4 text-right">Total</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {!loading && filteredLancamentos.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-500">
                                            Nenhum lançamento financeiro encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLancamentos.map((item) => {
                                        const meta = getTypeMeta(item.tipo_custo);
                                        const MetaIcon = meta.icon;
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50">
                                                <td className="p-4">
                                                    <div className="font-medium text-slate-700">{getOrderLabel(item.ordem_id)}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{item.id.slice(0, 8)}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.className}`}>
                                                        <MetaIcon className="w-3.5 h-3.5" />
                                                        {meta.label}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-slate-700">{item.descricao}</div>
                                                    <div className="text-xs text-slate-500">
                                                        {Number(item.quantidade || 0)} × {formatCurrency(item.valor_unitario || 0)}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600">{item.responsavel || '-'}</td>
                                                <td className="p-4 text-slate-600">{formatDate(item.data_lancamento)}</td>
                                                <td className="p-4 text-right font-bold text-slate-800">
                                                    {formatCurrency(item.valor_total)}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                                                            <Edit className="w-4 h-4 text-blue-600" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <h3 className="font-semibold text-slate-800 mb-4">OS com maior custo</h3>
                    <div className="space-y-3">
                        {resumoPorOrdem.length === 0 ? (
                            <div className="text-sm text-slate-500">Sem dados para resumir.</div>
                        ) : (
                            resumoPorOrdem.map((item) => (
                                <div key={item.ordem_id} className="p-3 border rounded-lg bg-slate-50">
                                    <div className="font-medium text-slate-700 text-sm">{getOrderLabel(item.ordem_id)}</div>
                                    <div className="mt-1 flex justify-between text-xs text-slate-500">
                                        <span>{item.count} lançamento(s)</span>
                                        <span className="font-semibold text-slate-700">{formatCurrency(item.total)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceiroOSTab;
