import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Save, Trash2, Edit, X, Wallet, Printer, FileDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { exportTablePdf, openPrintWindow } from '@/utils/ReportExporter';

const buildInitialForm = (type) => ({
    id: '',
    data: new Date().toISOString().split('T')[0],
    tipo: type === 'Pagar' ? 'Despesa' : 'Receita',
    categoria: '',
    descricao: '',
    valor: '',
    forma_pagamento: '',
    centro_custo: '',
});

const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const FinanceiroContas = ({ type = 'Receber' }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const { data, loading, fetchAll, create, update, remove } = useSupabaseCrud('financeiro_lancamentos');

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('todas');
    const [formData, setFormData] = useState(buildInitialForm(type));
    const [isEditing, setIsEditing] = useState(false);

    const expectedTipo = type === 'Pagar' ? 'Despesa' : 'Receita';
    const title = type === 'Pagar' ? 'Contas a Pagar' : 'Contas a Receber';
    const actionColor = type === 'Pagar' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700';

    useEffect(() => {
        if (user) fetchAll(1, 2000);
    }, [user, fetchAll]);

    useEffect(() => {
        if (!isEditing) {
            setFormData(buildInitialForm(type));
        }
    }, [type, isEditing]);

    const lancamentos = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return [...data]
            .filter((l) => String(l.tipo || '').toLowerCase() === expectedTipo.toLowerCase())
            .filter((l) => (categoryFilter === 'todas' ? true : (l.categoria || 'Sem categoria') === categoryFilter))
            .filter((l) =>
                (l.tipo || '').toLowerCase().includes(term) ||
                (l.categoria || '').toLowerCase().includes(term) ||
                (l.descricao || '').toLowerCase().includes(term) ||
                (l.forma_pagamento || '').toLowerCase().includes(term) ||
                (l.centro_custo || '').toLowerCase().includes(term)
            )
            .sort((a, b) => {
                const da = a.data ? new Date(a.data).getTime() : 0;
                const db = b.data ? new Date(b.data).getTime() : 0;
                return db - da;
            });
    }, [data, searchTerm, expectedTipo, categoryFilter]);

    const categorias = useMemo(() => {
        return Array.from(new Set(data
            .filter((item) => String(item.tipo || '').toLowerCase() === expectedTipo.toLowerCase())
            .map((item) => item.categoria || 'Sem categoria')))
            .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }, [data, expectedTipo]);

    const resumo = useMemo(() => {
        const total = lancamentos.reduce((acc, i) => acc + Number(i.valor || 0), 0);
        const porCategoria = lancamentos.reduce((acc, item) => {
            const key = item.categoria || 'Sem categoria';
            acc[key] = (acc[key] || 0) + Number(item.valor || 0);
            return acc;
        }, {});
        const topCategoria = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])[0];
        return { total, quantidade: lancamentos.length, topCategoria: topCategoria?.[0] || '-' };
    }, [lancamentos]);

    const resetForm = () => {
        setFormData(buildInitialForm(type));
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!user) return;
        if (!formData.descricao.trim() || formData.valor === '') {
            toast({ title: 'Erro', description: 'Preencha descrição e valor.', variant: 'destructive' });
            return;
        }

        const payload = {
            user_id: user.id,
            data: formData.data,
            tipo: expectedTipo,
            categoria: formData.categoria?.trim() || null,
            descricao: formData.descricao.trim(),
            valor: Number(formData.valor || 0),
            forma_pagamento: formData.forma_pagamento?.trim() || null,
            centro_custo: formData.centro_custo?.trim() || null,
            updated_at: new Date().toISOString(),
        };

        const saved = formData.id ? await update(formData.id, payload) : await create(payload);
        if (saved) {
            await fetchAll(1, 2000);
            resetForm();
        }
    };

    const handlePdf = () => {
        exportTablePdf({
            title,
            subtitle: `Total: ${formatCurrency(resumo.total)} • Registros: ${resumo.quantidade}`,
            columns: ['Data', 'Categoria', 'Descrição', 'Forma Pgto', 'Centro de Custo', 'Valor'],
            rows: lancamentos.map((item) => [
                item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-',
                item.categoria || '-',
                item.descricao || '-',
                item.forma_pagamento || '-',
                item.centro_custo || '-',
                formatCurrency(item.valor),
            ]),
            filename: `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        });
    };

    const handlePrint = () => {
        openPrintWindow({
            title,
            subtitle: `Total: ${formatCurrency(resumo.total)} • Registros: ${resumo.quantidade}`,
            columns: ['Data', 'Categoria', 'Descrição', 'Forma Pgto', 'Centro de Custo', 'Valor'],
            rows: lancamentos.map((item) => [
                item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-',
                item.categoria || '-',
                item.descricao || '-',
                item.forma_pagamento || '-',
                item.centro_custo || '-',
                formatCurrency(item.valor),
            ]),
            footer: 'Documento gerado pelo sistema Neny.',
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <div className="text-sm text-slate-500">{title}</div>
                    <div className="text-2xl font-bold text-slate-800">{formatCurrency(resumo.total)}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <div className="text-sm text-slate-500">Registros</div>
                    <div className="text-2xl font-bold text-slate-800">{resumo.quantidade}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <div className="text-sm text-slate-500">Principal categoria</div>
                    <div className="text-2xl font-bold text-slate-800 truncate">{resumo.topCategoria}</div>
                </div>
            </div>

            {!isEditing ? (
                <>
                    <div className="flex flex-wrap justify-between gap-3">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input className="w-full pl-10 pr-3 py-2 border rounded-lg" placeholder={`Buscar ${title.toLowerCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select className="pl-10 pr-3 py-2 border rounded-lg min-w-[220px]" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                    <option value="todas">Todas as categorias</option>
                                    {categorias.map((categoria) => (
                                        <option key={categoria} value={categoria}>{categoria}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" />Imprimir</Button>
                            <Button variant="outline" onClick={handlePdf}><FileDown className="w-4 h-4 mr-2" />PDF</Button>
                            <Button onClick={() => setIsEditing(true)} className={actionColor}>
                                <Plus className="w-4 h-4 mr-2" />Novo lançamento
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Categoria</th>
                                    <th className="p-4">Descrição</th>
                                    <th className="p-4">Forma de pagamento</th>
                                    <th className="p-4">Centro de custo</th>
                                    <th className="p-4">Valor</th>
                                    <th className="p-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} className="p-6 text-center text-slate-500">Carregando...</td></tr>
                                ) : lancamentos.length === 0 ? (
                                    <tr><td colSpan={7} className="p-6 text-center text-slate-500">Nenhum lançamento encontrado.</td></tr>
                                ) : lancamentos.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="p-4">{item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}</td>
                                        <td className="p-4">{item.categoria || '-'}</td>
                                        <td className="p-4">{item.descricao || '-'}</td>
                                        <td className="p-4">{item.forma_pagamento || '-'}</td>
                                        <td className="p-4">{item.centro_custo || '-'}</td>
                                        <td className="p-4 font-medium">{formatCurrency(item.valor)}</td>
                                        <td className="p-4 flex gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => {
                                                setFormData({
                                                    id: item.id,
                                                    data: item.data ? String(item.data).slice(0, 10) : '',
                                                    tipo: expectedTipo,
                                                    categoria: item.categoria || '',
                                                    descricao: item.descricao || '',
                                                    valor: item.valor ?? '',
                                                    forma_pagamento: item.forma_pagamento || '',
                                                    centro_custo: item.centro_custo || '',
                                                });
                                                setIsEditing(true);
                                            }}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="text-red-600" onClick={async () => {
                                                if (!window.confirm('Deseja excluir este lançamento?')) return;
                                                const ok = await remove(item.id);
                                                if (ok) await fetchAll(1, 2000);
                                            }}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">{formData.id ? 'Editar' : 'Novo'} lançamento</h3>
                        <Button variant="ghost" onClick={resetForm}>
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="date" className="p-2 border rounded-lg" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} />
                        <input className="p-2 border rounded-lg" placeholder="Categoria" value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} />
                        <input className="p-2 border rounded-lg md:col-span-2" placeholder="Descrição" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} />
                        <input className="p-2 border rounded-lg" placeholder="Forma de pagamento" value={formData.forma_pagamento} onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })} />
                        <input className="p-2 border rounded-lg" placeholder="Centro de custo" value={formData.centro_custo} onChange={(e) => setFormData({ ...formData, centro_custo: e.target.value })} />
                        <input type="number" step="0.01" className="p-2 border rounded-lg md:col-span-2" placeholder="Valor" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} />
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSave} className={actionColor}>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceiroContas;