import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Package2, Search, X, FileDown, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { exportTablePdf, openPrintWindow } from '@/utils/ReportExporter';

const createEmptyItem = () => ({
    produto_id: '',
    quantidade: 1,
});

const createInitialForm = () => ({
    id: '',
    data: new Date().toISOString().split('T')[0],
    nf: '',
    entidade: '',
    observacoes: '',
    itens: [createEmptyItem()],
});

const MovimentacoesEstoque = ({ type }) => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: movimentacoes,
        loading: loadingMovimentacoes,
        fetchAll: fetchMovimentacoes,
        create,
        update,
        remove,
    } = useSupabaseCrud('estoque_movimentacoes');

    const {
        data: produtos,
        loading: loadingProdutos,
        fetchAll: fetchProdutos,
    } = useSupabaseCrud('estoque_produtos');

    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState(createInitialForm());

    useEffect(() => {
        if (user) {
            fetchMovimentacoes(1, 1000);
            fetchProdutos(1, 1000);
        }
    }, [user, fetchMovimentacoes, fetchProdutos]);

    const isEntrada = type === 'Entrada';
    const buttonClass = isEntrada ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700';
    const loading = loadingMovimentacoes || loadingProdutos;

    const filteredMoves = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...movimentacoes]
            .filter((move) => (move.tipo || '') === type)
            .sort((a, b) => {
                const da = a.data_movimentacao ? new Date(a.data_movimentacao).getTime() : 0;
                const db = b.data_movimentacao ? new Date(b.data_movimentacao).getTime() : 0;
                return db - da;
            })
            .filter((move) => {
                const itemsText = Array.isArray(move.itens)
                    ? move.itens
                        .map((item) => `${item.nome || ''} ${item.sku || ''} ${item.quantidade || ''}`)
                        .join(' ')
                        .toLowerCase()
                    : '';

                return (
                    (move.nf || '').toLowerCase().includes(term) ||
                    (move.entidade || '').toLowerCase().includes(term) ||
                    (move.motivo || '').toLowerCase().includes(term) ||
                    itemsText.includes(term)
                );
            });
    }, [movimentacoes, searchTerm, type]);

    const resetForm = () => {
        setFormData(createInitialForm());
        setIsEditing(false);
    };

    const addItem = () => {
        setFormData((prev) => ({
            ...prev,
            itens: [...prev.itens, createEmptyItem()],
        }));
    };

    const removeItem = (index) => {
        setFormData((prev) => ({
            ...prev,
            itens: prev.itens.length > 1 ? prev.itens.filter((_, i) => i !== index) : [createEmptyItem()],
        }));
    };

    const updateItem = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            itens: prev.itens.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
        }));
    };

    const getProduto = (produtoId) => produtos.find((produto) => produto.id === produtoId);

    const buildItensPayload = () => {
        return formData.itens
            .filter((item) => item.produto_id && Number(item.quantidade) > 0)
            .map((item) => {
                const produto = getProduto(item.produto_id);
                const precoUnitario = Number(
                    isEntrada
                        ? produto?.preco_custo || 0
                        : produto?.preco_venda || produto?.preco_custo || 0
                );
                const quantidade = Number(item.quantidade);

                return {
                    produto_id: produto.id,
                    nome: produto.nome || '',
                    sku: produto.sku || '',
                    categoria: produto.categoria || '',
                    quantidade,
                    preco_unitario: precoUnitario,
                    subtotal: Number((quantidade * precoUnitario).toFixed(2)),
                };
            });
    };

    const validateSaidaStock = (itensPayload) => {
        if (isEntrada) return true;

        const grouped = itensPayload.reduce((acc, item) => {
            acc[item.produto_id] = (acc[item.produto_id] || 0) + Number(item.quantidade || 0);
            return acc;
        }, {});

        const movimentoOriginal = formData.id
            ? movimentacoes.find((move) => move.id === formData.id)
            : null;

        const groupedOriginal =
            Array.isArray(movimentoOriginal?.itens) && movimentoOriginal.itens.length > 0
                ? movimentoOriginal.itens.reduce((acc, item) => {
                    const produtoId = item.produto_id;
                    acc[produtoId] = (acc[produtoId] || 0) + Number(item.quantidade || 0);
                    return acc;
                }, {})
                : movimentoOriginal?.produto_id
                    ? { [movimentoOriginal.produto_id]: Number(movimentoOriginal.quantidade || 0) }
                    : {};

        for (const [produtoId, quantidadeSolicitada] of Object.entries(grouped)) {
            const produto = getProduto(produtoId);
            const estoqueAtual = Number(produto?.quantidade || 0);
            const saldoDisponivelParaEdicao = estoqueAtual + Number(groupedOriginal[produtoId] || 0);

            if (quantidadeSolicitada > saldoDisponivelParaEdicao) {
                toast({
                    title: 'Estoque insuficiente',
                    description: `O produto ${produto?.nome || 'selecionado'} possui saldo disponível de ${saldoDisponivelParaEdicao} unidade(s) para esta saída.`,
                    variant: 'destructive',
                });
                return false;
            }
        }

        return true;
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

        if (!formData.data || !formData.nf) {
            toast({
                title: 'Erro',
                description: 'Preencha a data e o número do documento.',
                variant: 'destructive',
            });
            return;
        }

        const itensPayload = buildItensPayload();

        if (itensPayload.length === 0) {
            toast({
                title: 'Erro',
                description: 'Adicione pelo menos um produto com quantidade válida.',
                variant: 'destructive',
            });
            return;
        }

        if (!validateSaidaStock(itensPayload)) return;

        const totalQuantidade = itensPayload.reduce((acc, item) => acc + Number(item.quantidade || 0), 0);

        const payload = {
            user_id: user.id,
            tipo: type,
            produto_id: itensPayload.length === 1 ? itensPayload[0].produto_id : null,
            quantidade: totalQuantidade,
            motivo: formData.observacoes?.trim() || null,
            data_movimentacao: new Date(`${formData.data}T12:00:00`).toISOString(),
            nf: formData.nf?.trim() || null,
            entidade: formData.entidade?.trim() || null,
            itens: itensPayload,
            updated_at: new Date().toISOString(),
        };

        const saved = formData.id ? await update(formData.id, payload) : await create(payload);

        if (saved) {
            await fetchMovimentacoes(1, 1000);
            await fetchProdutos(1, 1000);
            resetForm();
        }
    };

    const handleEdit = (move) => {
        const itens =
            Array.isArray(move.itens) && move.itens.length > 0
                ? move.itens.map((item) => ({
                    produto_id: item.produto_id || '',
                    quantidade: item.quantidade || 1,
                }))
                : [
                    {
                        produto_id: move.produto_id || '',
                        quantidade: move.quantidade || 1,
                    },
                ];

        setFormData({
            id: move.id,
            data: move.data_movimentacao
                ? new Date(move.data_movimentacao).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            nf: move.nf || '',
            entidade: move.entidade || '',
            observacoes: move.motivo || '',
            itens,
        });

        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(`Deseja realmente excluir esta movimentação de ${type.toLowerCase()}?`);
        if (!confirmed) return;

        const success = await remove(id);
        if (success) {
            await fetchMovimentacoes(1, 1000);
            await fetchProdutos(1, 1000);
        }
    };

    const getItensResumo = (move) => {
        const itens = Array.isArray(move.itens) ? move.itens : [];

        if (itens.length === 0 && move.produto_id) {
            const produto = getProduto(move.produto_id);
            return [`${produto?.nome || 'Produto'} (${move.quantidade || 0})`];
        }

        return itens.map((item) => `${item.nome || 'Produto'} (${item.quantidade || 0})`);
    };

    const handlePrint = () => {
        const reportRows = filteredMoves.map(move => [
            move.data_movimentacao ? new Date(move.data_movimentacao).toLocaleDateString('pt-BR') : '-',
            move.nf || '-',
            move.entidade || '-',
            getItensResumo(move).join(', '),
            move.quantidade || 0
        ]);
        openPrintWindow({
            title: `Histórico de ${type}`,
            subtitle: `Movimentações de estoque • ${type}`,
            columns: ['Data', 'Documento', 'Entidade', 'Itens', 'Qtd. Total'],
            rows: reportRows,
            companyProfile,
            summaryRows: [
                ['Tipo', type],
                ['Movimentações', filteredMoves.length],
                ['Quantidade total', filteredMoves.reduce((acc, move) => acc + Number(move.quantidade || 0), 0)],
            ],
        });
    };

    const handleExportPdf = () => {
        const reportRows = filteredMoves.map(move => [
            move.data_movimentacao ? new Date(move.data_movimentacao).toLocaleDateString('pt-BR') : '-',
            move.nf || '-',
            move.entidade || '-',
            getItensResumo(move).join(', '),
            move.quantidade || 0
        ]);
        exportTablePdf({
            title: `Histórico de ${type}`,
            subtitle: `Movimentações de estoque • ${type}`,
            columns: ['Data', 'Documento', 'Entidade', 'Itens', 'Qtd. Total'],
            rows: reportRows,
            filename: `movimentacoes_${type.toLowerCase()}.pdf`,
            companyProfile,
            summaryRows: [
                ['Tipo', type],
                ['Movimentações', filteredMoves.length],
                ['Quantidade total', filteredMoves.reduce((acc, move) => acc + Number(move.quantidade || 0), 0)],
            ],
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">
                        {isEditing ? `Editar ${type}` : `Nova ${type}`}
                    </h3>

                    {isEditing && (
                        <Button variant="ghost" onClick={resetForm}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Data</label>
                            <input
                                type="date"
                                value={formData.data}
                                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Documento / NF</label>
                            <input
                                placeholder="Número NF"
                                value={formData.nf}
                                onChange={(e) => setFormData({ ...formData, nf: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                {isEntrada ? 'Fornecedor / Origem' : 'Cliente / Destino'}
                            </label>
                            <input
                                placeholder={isEntrada ? 'Fornecedor' : 'Cliente'}
                                value={formData.entidade}
                                onChange={(e) => setFormData({ ...formData, entidade: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>

                    <div className="border rounded-xl p-4 space-y-4 bg-slate-50">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Package2 className="w-4 h-4" />
                                Itens da movimentação
                            </h4>

                            <Button type="button" variant="outline" onClick={addItem}>
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar item
                            </Button>
                        </div>

                        {formData.itens.map((item, index) => {
                            const produto = getProduto(item.produto_id);
                            const estoqueAtual = Number(produto?.quantidade || 0);

                            return (
                                <div
                                    key={`${item.produto_id}-${index}`}
                                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border rounded-lg p-3 bg-white"
                                >
                                    <div className="md:col-span-8">
                                        <label className="text-sm font-medium mb-1 block">Produto</label>
                                        <select
                                            value={item.produto_id}
                                            onChange={(e) => updateItem(index, 'produto_id', e.target.value)}
                                            className="w-full p-2 border rounded"
                                            required
                                        >
                                            <option value="">Selecione o produto...</option>
                                            {produtos.map((produtoOption) => (
                                                <option key={produtoOption.id} value={produtoOption.id}>
                                                    {produtoOption.nome} {produtoOption.sku ? `- ${produtoOption.sku}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-1 block">Qtd.</label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={item.quantidade}
                                            onChange={(e) => updateItem(index, 'quantidade', e.target.value)}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full text-red-600"
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Remover
                                        </Button>
                                    </div>

                                    {item.produto_id && (
                                        <div className="md:col-span-12 text-sm text-slate-500">
                                            Estoque atual: <strong>{estoqueAtual}</strong>
                                            {produto?.categoria ? ` • Categoria: ${produto.categoria}` : ''}
                                            {produto?.localizacao ? ` • Localização: ${produto.localizacao}` : ''}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Observações</label>
                        <textarea
                            rows={3}
                            value={formData.observacoes}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            className="w-full p-2 border rounded"
                            placeholder="Informações complementares"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        {isEditing && (
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Cancelar
                            </Button>
                        )}

                        <Button type="submit" className={buttonClass}>
                            {isEditing ? 'Salvar alterações' : `Salvar ${type}`}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                        Histórico de {type.toLowerCase()}
                    </h3>

                    <div className="flex flex-col md:flex-row gap-3">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimir
                        </Button>
                        <Button variant="outline" onClick={handleExportPdf}>
                            <FileDown className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg"
                                placeholder={`Buscar ${type.toLowerCase()}...`}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-700">
                            <tr>
                                <th className="p-3 font-semibold">Data</th>
                                <th className="p-3 font-semibold">Documento</th>
                                <th className="p-3 font-semibold">Entidade</th>
                                <th className="p-3 font-semibold">Itens</th>
                                <th className="p-3 font-semibold">Qtd. Total</th>
                                <th className="p-3 font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-slate-500">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : filteredMoves.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-slate-500">
                                        Nenhuma movimentação encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filteredMoves.map((move) => (
                                    <tr key={move.id} className="border-b last:border-b-0 align-top">
                                        <td className="p-3 text-slate-700 whitespace-nowrap">
                                            {move.data_movimentacao
                                                ? new Date(move.data_movimentacao).toLocaleDateString('pt-BR')
                                                : '-'}
                                        </td>
                                        <td className="p-3 text-slate-700">{move.nf || '-'}</td>
                                        <td className="p-3 text-slate-700">{move.entidade || '-'}</td>
                                        <td className="p-3 text-slate-700">
                                            <div className="space-y-1">
                                                {getItensResumo(move).map((texto, index) => (
                                                    <div key={`${move.id}-${index}`} className="text-sm">
                                                        {texto}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-3 text-slate-700">{move.quantidade || 0}</td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(move)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleDelete(move.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MovimentacoesEstoque;