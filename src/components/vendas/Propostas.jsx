import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Search, X, FileDown, Printer, FileText, CircleDollarSign, ClipboardList, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { exportTablePdf, openPrintWindow } from '@/utils/ReportExporter';

const createEmptyItem = () => ({ produto: '', qtd: 1, preco: 0, total: 0 });
const createInitialForm = () => ({
    id: '',
    data: new Date().toISOString().split('T')[0],
    cliente: '',
    status: 'Rascunho',
    itens: [createEmptyItem()],
    observacoes: '',
});
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const Stat = ({ icon: Icon, label, value, tone = 'blue' }) => {
    const map = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        violet: 'bg-violet-50 text-violet-700 border-violet-100',
    };
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`rounded-xl border px-3 py-3 ${map[tone] || map.blue}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
        </div>
    );
};

const statusBadge = (status) => {
    const base = 'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold';
    if (status === 'Aceita') return `${base} bg-emerald-50 text-emerald-700`;
    if (status === 'Enviada') return `${base} bg-blue-50 text-blue-700`;
    if (status === 'Recusada') return `${base} bg-red-50 text-red-700`;
    if (status === 'Cancelada') return `${base} bg-slate-100 text-slate-600`;
    return `${base} bg-amber-50 text-amber-700`;
};

const Propostas = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const { data: propostas, loading, fetchAll, create, update, remove } = useSupabaseCrud('vendas_propostas');
    const { data: parametros = [], fetchAll: fetchParametros } = useSupabaseCrud('admin_parametros');
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState(createInitialForm());

    useEffect(() => {
        if (user) {
            fetchAll(1, 1000);
            fetchParametros(1, 10);
        }
    }, [user, fetchAll, fetchParametros]);

    const companyProfile = useMemo(() => {
        const info = Array.isArray(parametros) ? parametros[0] : null;
        if (!info) return null;
        return { nome_fantasia: info.company_name || 'Neny Software System', razao_social: info.company_name || null, cnpj: info.cnpj || null, email: info.email || null, telefone: info.phone || null, logradouro: info.address || null, cidade: info.city || null, estado: info.state || null };
    }, [parametros]);

    const filteredPropostas = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return [...propostas]
            .filter((item) => (item.cliente || '').toLowerCase().includes(term) || (item.status || '').toLowerCase().includes(term) || (item.data || '').toLowerCase().includes(term))
            .sort((a, b) => {
                const da = a.data ? new Date(`${a.data}T12:00:00`).getTime() : 0;
                const db = b.data ? new Date(`${b.data}T12:00:00`).getTime() : 0;
                return db - da;
            });
    }, [propostas, searchTerm]);

    const totals = useMemo(() => {
        const total = filteredPropostas.reduce((acc, item) => acc + Number(item.total || 0), 0);
        return {
            totalPropostas: filteredPropostas.length,
            totalValor: total,
            enviadas: filteredPropostas.filter((item) => item.status === 'Enviada').length,
            aceitas: filteredPropostas.filter((item) => item.status === 'Aceita').length,
        };
    }, [filteredPropostas]);

    const totalForm = useMemo(() => (formData.itens || []).reduce((acc, item) => acc + Number(item.total || 0), 0), [formData.itens]);

    const resetForm = () => {
        setFormData(createInitialForm());
        setIsEditing(false);
    };
    const addItem = () => setFormData((prev) => ({ ...prev, itens: [...(prev.itens || []), createEmptyItem()] }));
    const removeItem = (index) => setFormData((prev) => {
        const itens = (prev.itens || []).filter((_, idx) => idx !== index);
        return { ...prev, itens: itens.length > 0 ? itens : [createEmptyItem()] };
    });
    const updateItem = (index, field, value) => setFormData((prev) => {
        const newItens = [...(prev.itens || [])];
        const current = { ...newItens[index], [field]: value };
        current.total = Number((Number(current.qtd || 0) * Number(current.preco || 0)).toFixed(2));
        newItens[index] = current;
        return { ...prev, itens: newItens };
    });

    const handleSave = async () => {
        if (!user) return toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
        if (!formData.cliente?.trim()) return toast({ variant: 'destructive', title: 'Erro', description: 'Cliente é obrigatório.' });

        const itensValidos = (formData.itens || []).filter((item) => item.produto?.trim()).map((item) => ({
            produto: item.produto.trim(),
            qtd: Number(item.qtd || 0),
            preco: Number(item.preco || 0),
            total: Number(item.total || 0),
        }));

        if (itensValidos.length === 0) return toast({ variant: 'destructive', title: 'Erro', description: 'Adicione pelo menos um item válido.' });

        const total = itensValidos.reduce((acc, item) => acc + Number(item.total || 0), 0);
        const payload = {
            user_id: user.id,
            data: formData.data,
            cliente: formData.cliente.trim(),
            status: formData.status || 'Rascunho',
            itens: itensValidos,
            total: Number(total.toFixed(2)),
            observacoes: formData.observacoes?.trim() || null,
            updated_at: new Date().toISOString(),
        };

        const saved = formData.id ? await update(formData.id, payload) : await create(payload);
        if (saved) {
            await fetchAll(1, 1000);
            resetForm();
            toast({ title: 'Sucesso', description: 'Proposta salva.' });
        }
    };

    const handleExportPdf = () => exportTablePdf({
        title: 'Propostas Comerciais',
        subtitle: `Total de propostas: ${filteredPropostas.length}`,
        columns: ['Data', 'Cliente', 'Status', 'Itens', 'Total'],
        companyProfile,
        summaryRows: [
            ['Total de propostas', filteredPropostas.length],
            ['Valor total', formatCurrency(totals.totalValor)],
            ['Enviadas', totals.enviadas],
            ['Aceitas', totals.aceitas],
        ],
        rows: filteredPropostas.map((p) => [
            p.data ? new Date(`${p.data}T12:00:00`).toLocaleDateString('pt-BR') : '-',
            p.cliente || '-',
            p.status || '-',
            Array.isArray(p.itens) ? p.itens.length : 0,
            formatCurrency(p.total),
        ]),
        filename: 'propostas_comerciais.pdf',
        companyProfile,
        summaryRows: [
            ['Total de propostas', filteredPropostas.length],
            ['Valor total', formatCurrency(totals.totalValor)],
            ['Enviadas', totals.enviadas],
            ['Aceitas', totals.aceitas],
        ],
    });

    const handlePrint = () => openPrintWindow({
        title: 'Propostas Comerciais',
        subtitle: `Total de propostas: ${filteredPropostas.length}`,
        columns: ['Data', 'Cliente', 'Status', 'Itens', 'Total'],
        companyProfile,
        summaryRows: [
            ['Total de propostas', filteredPropostas.length],
            ['Valor total', formatCurrency(totals.totalValor)],
            ['Enviadas', totals.enviadas],
            ['Aceitas', totals.aceitas],
        ],
        rows: filteredPropostas.map((p) => [
            p.data ? new Date(`${p.data}T12:00:00`).toLocaleDateString('pt-BR') : '-',
            p.cliente || '-',
            p.status || '-',
            Array.isArray(p.itens) ? p.itens.length : 0,
            formatCurrency(p.total),
        ]),
    });

    const handleEdit = (proposta) => {
        setFormData({
            id: proposta.id,
            data: proposta.data || new Date().toISOString().split('T')[0],
            cliente: proposta.cliente || '',
            status: proposta.status || 'Rascunho',
            itens: Array.isArray(proposta.itens) && proposta.itens.length > 0 ? proposta.itens.map((item) => ({
                produto: item.produto || '',
                qtd: Number(item.qtd || 1),
                preco: Number(item.preco || 0),
                total: Number(item.total || 0),
            })) : [createEmptyItem()],
            observacoes: proposta.observacoes || '',
        });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Deseja realmente excluir esta proposta?')) return;
        const success = await remove(id);
        if (success) await fetchAll(1, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Stat icon={FileText} label="Propostas filtradas" value={totals.totalPropostas} tone="blue" />
                <Stat icon={CircleDollarSign} label="Valor total" value={formatCurrency(totals.totalValor)} tone="emerald" />
                <Stat icon={ClipboardList} label="Enviadas" value={totals.enviadas} tone="amber" />
                <Stat icon={CheckCircle2} label="Aceitas" value={totals.aceitas} tone="violet" />
            </div>

            {!isEditing ? (
                <>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-slate-900"
                                    placeholder="Buscar cliente, status ou data..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 justify-end">
                                <Button variant="outline" onClick={handlePrint} className="border-slate-200 text-slate-700">
                                    <Printer className="mr-2 h-4 w-4" /> Imprimir
                                </Button>
                                <Button variant="outline" onClick={handleExportPdf} className="border-slate-200 text-slate-700">
                                    <FileDown className="mr-2 h-4 w-4" /> PDF
                                </Button>
                                <Button onClick={() => { setFormData(createInitialForm()); setIsEditing(true); }} className="bg-indigo-600 hover:bg-indigo-700">
                                    <Plus className="mr-2 h-4 w-4" /> Nova Proposta
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-sm text-slate-500">
                                <tr>
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td className="p-6 text-center text-slate-500" colSpan={5}>Carregando propostas...</td></tr>
                                ) : filteredPropostas.length === 0 ? (
                                    <tr><td className="p-6 text-center text-slate-500" colSpan={5}>Nenhuma proposta encontrada.</td></tr>
                                ) : filteredPropostas.map((p) => (
                                    <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                                        <td className="p-4 text-slate-700">{p.data ? new Date(`${p.data}T12:00:00`).toLocaleDateString('pt-BR') : '-'}</td>
                                        <td className="p-4 font-medium text-slate-900">{p.cliente}</td>
                                        <td className="p-4 text-slate-700">{formatCurrency(p.total)}</td>
                                        <td className="p-4"><span className={statusBadge(p.status)}>{p.status}</span></td>
                                        <td className="p-4 flex gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => handleEdit(p)}><Edit className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">{formData.id ? 'Editar Proposta Comercial' : 'Nova Proposta Comercial'}</h3>
                            <p className="text-sm text-slate-500">Monte os itens da proposta com melhor leitura visual.</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4 text-slate-600" /></Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-5">
                        <input type="date" value={formData.data || ''} onChange={(e) => setFormData({ ...formData, data: e.target.value })} className="input-field" />
                        <input placeholder="Cliente" value={formData.cliente || ''} onChange={(e) => setFormData({ ...formData, cliente: e.target.value })} className="input-field" />
                        <select value={formData.status || 'Rascunho'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input-field">
                            <option>Rascunho</option><option>Enviada</option><option>Aceita</option><option>Recusada</option><option>Cancelada</option>
                        </select>
                    </div>

                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h4 className="text-base font-semibold text-slate-900">Itens da proposta</h4>
                        <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">Total atual: <strong className="text-slate-900">{formatCurrency(totalForm)}</strong></div>
                    </div>

                    <div className="space-y-3">
                        {(formData.itens || []).map((item, idx) => (
                            <div key={idx} className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.6fr_120px_150px_120px_52px] md:items-center">
                                <input placeholder="Produto" value={item.produto} onChange={(e) => updateItem(idx, 'produto', e.target.value)} className="input-field bg-white" />
                                <input type="number" placeholder="Qtd" min="1" value={item.qtd} onChange={(e) => updateItem(idx, 'qtd', e.target.value)} className="input-field bg-white" />
                                <input type="number" step="0.01" placeholder="Preço" min="0" value={item.preco} onChange={(e) => updateItem(idx, 'preco', e.target.value)} className="input-field bg-white" />
                                <div className="rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-900 border border-slate-200">{formatCurrency(item.total)}</div>
                                <Button type="button" variant="outline" size="icon" className="border-slate-200 bg-white" onClick={() => removeItem(idx)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <Button onClick={addItem} variant="outline" className="border-slate-200 text-slate-700">
                            <Plus className="mr-2 h-4 w-4" /> Adicionar item
                        </Button>
                        <div className="text-sm text-slate-500">Itens válidos serão salvos em JSON na proposta.</div>
                    </div>

                    <textarea placeholder="Observações" value={formData.observacoes || ''} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} className="input-field mt-5 min-h-[120px]" />

                    <div className="mt-5 flex justify-end gap-2">
                        <Button variant="outline" onClick={resetForm} className="border-slate-200 text-slate-700">Cancelar</Button>
                        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">Salvar Proposta</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Propostas;
