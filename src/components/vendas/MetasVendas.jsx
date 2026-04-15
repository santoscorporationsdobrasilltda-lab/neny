import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Search, X, Target, CalendarDays, Trophy, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const initialForm = { id: '', periodo: '', responsavel: '', valor: '', observacoes: '' };
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const Metric = ({ icon: Icon, label, value, tone = 'blue' }) => {
    const map = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        violet: 'bg-violet-50 text-violet-700 border-violet-100',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
    };
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`rounded-xl border px-3 py-3 ${map[tone] || map.blue}`}><Icon className="h-4 w-4" /></div>
            </div>
        </div>
    );
};

const MetasVendas = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const { data: metas, loading, fetchAll, create, update, remove } = useSupabaseCrud('vendas_metas');
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (user) fetchAll(1, 1000);
    }, [user, fetchAll]);

    const filteredMetas = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return [...metas]
            .filter((meta) => (meta.periodo || '').toLowerCase().includes(term) || (meta.responsavel || '').toLowerCase().includes(term) || String(meta.valor || '').toLowerCase().includes(term))
            .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    }, [metas, searchTerm]);

    const metrics = useMemo(() => {
        const total = filteredMetas.reduce((acc, item) => acc + Number(item.valor || 0), 0);
        const maior = filteredMetas.reduce((acc, item) => Math.max(acc, Number(item.valor || 0)), 0);
        return { total, maior, responsaveis: new Set(filteredMetas.map((item) => item.responsavel).filter(Boolean)).size };
    }, [filteredMetas]);

    const resetForm = () => { setFormData(initialForm); setIsEditing(false); };
    const handleSave = async () => {
        if (!user) return toast({ title: 'Erro', description: 'Usuário não autenticado.', variant: 'destructive' });
        if (!formData.valor || !formData.periodo?.trim()) return toast({ title: 'Erro', description: 'Preencha pelo menos o período e o valor da meta.', variant: 'destructive' });

        const payload = {
            user_id: user.id,
            periodo: formData.periodo.trim(),
            responsavel: formData.responsavel?.trim() || null,
            valor: Number(formData.valor || 0),
            observacoes: formData.observacoes?.trim() || null,
            updated_at: new Date().toISOString(),
        };

        const saved = formData.id ? await update(formData.id, payload) : await create(payload);
        if (saved) { await fetchAll(1, 1000); resetForm(); }
    };
    const handleEdit = (meta) => { setFormData({ id: meta.id, periodo: meta.periodo || '', responsavel: meta.responsavel || '', valor: meta.valor ?? '', observacoes: meta.observacoes || '' }); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleDelete = async (id) => { if (!window.confirm('Deseja realmente excluir esta meta?')) return; const success = await remove(id); if (success) await fetchAll(1, 1000); };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric icon={Target} label="Metas filtradas" value={filteredMetas.length} tone="blue" />
                <Metric icon={Trophy} label="Valor total" value={formatCurrency(metrics.total)} tone="violet" />
                <Metric icon={CalendarDays} label="Maior meta" value={formatCurrency(metrics.maior)} tone="amber" />
                <Metric icon={User2} label="Responsáveis" value={metrics.responsaveis} tone="emerald" />
            </div>

            {!isEditing ? (
                <>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-slate-900" placeholder="Buscar período, responsável ou valor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <Button onClick={() => { setFormData(initialForm); setIsEditing(true); }} className="bg-violet-600 hover:bg-violet-700"><Plus className="mr-2 h-4 w-4" />Nova Meta</Button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-sm text-slate-500">
                                <tr><th className="p-4">Período</th><th className="p-4">Responsável</th><th className="p-4">Meta Valor</th><th className="p-4">Ações</th></tr>
                            </thead>
                            <tbody>
                                {loading ? <tr><td className="p-6 text-center text-slate-500" colSpan={4}>Carregando metas...</td></tr> : filteredMetas.length === 0 ? <tr><td className="p-6 text-center text-slate-500" colSpan={4}>Nenhuma meta encontrada.</td></tr> : filteredMetas.map((m) => (
                                    <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                                        <td className="p-4 font-medium text-slate-900">{m.periodo}</td>
                                        <td className="p-4 text-slate-700">{m.responsavel || '-'}</td>
                                        <td className="p-4 text-slate-700">{formatCurrency(m.valor)}</td>
                                        <td className="p-4 flex gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => handleEdit(m)}><Edit className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-slate-900">{formData.id ? 'Editar Meta de Vendas' : 'Nova Meta de Vendas'}</h3>
                            <p className="text-sm text-slate-500">Cadastre períodos e responsáveis de forma mais clara.</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4 text-slate-600" /></Button>
                    </div>
                    <div className="space-y-4">
                        <input placeholder="Período (Ex: 01/2026)" value={formData.periodo || ''} onChange={(e) => setFormData({ ...formData, periodo: e.target.value })} className="input-field" />
                        <input placeholder="Responsável" value={formData.responsavel || ''} onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })} className="input-field" />
                        <input type="number" step="0.01" min="0" placeholder="Meta Valor" value={formData.valor || ''} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} className="input-field" />
                        <textarea placeholder="Observações" value={formData.observacoes || ''} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} className="input-field min-h-[110px]" />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={resetForm} className="border-slate-200 text-slate-700">Cancelar</Button>
                            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">Salvar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MetasVendas;
