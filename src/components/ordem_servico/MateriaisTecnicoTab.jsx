import React, { useEffect, useMemo, useState } from 'react';
import { Truck, Save, Plus, Search, Package, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const initialForm = {
    id: '',
    tecnico_id: '',
    material_id: '',
    quantidade: '0',
    localizacao: '',
    observacoes: '',
};

const MateriaisTecnicoTab = () => {
    const { user } = useAuth();
    const { toast } = useToast();

    const { data: estoque, fetchAll: fetchEstoque, create: createEstoque, update: updateEstoque, remove: removeEstoque } =
        useSupabaseCrud('ordem_servicos_estoque_tecnico');
    const { data: tecnicos, fetchAll: fetchTecnicos } = useSupabaseCrud('ordem_servicos_tecnicos');
    const { data: materiais, fetchAll: fetchMateriais } = useSupabaseCrud('ordem_servicos_materiais');

    const [form, setForm] = useState(initialForm);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (user) {
            fetchEstoque(1, 2000);
            fetchTecnicos(1, 1000);
            fetchMateriais(1, 1000);
        }
    }, [user, fetchEstoque, fetchTecnicos, fetchMateriais]);

    const grouped = useMemo(() => {
        const term = search.trim().toLowerCase();
        const filtered = estoque.filter((item) => {
            const tecnico = tecnicos.find((t) => t.id === item.tecnico_id);
            const material = materiais.find((m) => m.id === item.material_id);
            const haystack = [tecnico?.nome, material?.nome, item.localizacao, item.observacoes]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return !term || haystack.includes(term);
        });

        return tecnicos.map((tecnico) => ({
            tecnico,
            itens: filtered.filter((item) => item.tecnico_id === tecnico.id),
        }));
    }, [estoque, tecnicos, materiais, search]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user) return;
        if (!form.tecnico_id || !form.material_id) {
            toast({ title: 'Campos obrigatórios', description: 'Selecione técnico e material.', variant: 'destructive' });
            return;
        }

        const payload = {
            user_id: user.id,
            tecnico_id: form.tecnico_id,
            material_id: form.material_id,
            quantidade: Number(form.quantidade || 0),
            localizacao: form.localizacao.trim() || null,
            observacoes: form.observacoes.trim() || null,
            updated_at: new Date().toISOString(),
        };

        if (form.id) {
            await updateEstoque(form.id, payload);
        } else {
            const duplicated = estoque.find((item) => item.tecnico_id === payload.tecnico_id && item.material_id === payload.material_id);
            if (duplicated) {
                await updateEstoque(duplicated.id, {
                    quantidade: Number(duplicated.quantidade || 0) + payload.quantidade,
                    localizacao: payload.localizacao,
                    observacoes: payload.observacoes,
                    updated_at: new Date().toISOString(),
                });
            } else {
                await createEstoque(payload);
            }
        }

        setForm(initialForm);
        fetchEstoque(1, 2000);
    };

    const handleEdit = (item) => {
        setForm({
            id: item.id,
            tecnico_id: item.tecnico_id || '',
            material_id: item.material_id || '',
            quantidade: String(item.quantidade ?? '0'),
            localizacao: item.localizacao || '',
            observacoes: item.observacoes || '',
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir este item do estoque do técnico?')) return;
        await removeEstoque(id);
        fetchEstoque(1, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-[380px,1fr] gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 h-fit">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Estoque volante</h3>
                            <p className="text-sm text-slate-500">Alocação de material por técnico.</p>
                        </div>
                        <Truck className="w-6 h-6 text-indigo-500" />
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Técnico</label>
                            <select className="w-full mt-1 p-2 border rounded-lg" value={form.tecnico_id} onChange={(e) => setForm((p) => ({ ...p, tecnico_id: e.target.value }))}>
                                <option value="">Selecione o técnico</option>
                                {tecnicos.map((tecnico) => (
                                    <option key={tecnico.id} value={tecnico.id}>{tecnico.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Material</label>
                            <select className="w-full mt-1 p-2 border rounded-lg" value={form.material_id} onChange={(e) => setForm((p) => ({ ...p, material_id: e.target.value }))}>
                                <option value="">Selecione o material</option>
                                {materiais.map((material) => (
                                    <option key={material.id} value={material.id}>{material.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Quantidade</label>
                            <input type="number" step="0.01" className="w-full mt-1 p-2 border rounded-lg" value={form.quantidade} onChange={(e) => setForm((p) => ({ ...p, quantidade: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Localização</label>
                            <input className="w-full mt-1 p-2 border rounded-lg" value={form.localizacao} onChange={(e) => setForm((p) => ({ ...p, localizacao: e.target.value }))} placeholder="Ex: Veículo 01 / Caixa traseira" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Observações</label>
                            <textarea className="w-full mt-1 p-2 border rounded-lg min-h-[90px]" value={form.observacoes} onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))} />
                        </div>
                        <div className="flex justify-end gap-2">
                            {form.id ? <Button type="button" variant="outline" onClick={() => setForm(initialForm)}>Cancelar</Button> : null}
                            <Button type="submit"><Save className="w-4 h-4 mr-2" />{form.id ? 'Salvar estoque' : 'Adicionar ao estoque'}</Button>
                        </div>
                    </form>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Materiais por técnico</h3>
                            <p className="text-sm text-slate-500">Saldo carregado por cada técnico em campo.</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input className="w-full pl-9 pr-3 py-2 border rounded-lg" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar técnico ou material..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {grouped.map(({ tecnico, itens }) => (
                            <div key={tecnico.id} className="rounded-xl border border-slate-200 p-5 bg-slate-50/60">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-bold text-slate-900">{tecnico.nome}</h4>
                                        <p className="text-sm text-slate-500">{itens.length} item(ns) alocados</p>
                                    </div>
                                    <div className="rounded-full w-10 h-10 bg-indigo-100 text-indigo-700 flex items-center justify-center">
                                        <Package className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {itens.length === 0 ? (
                                        <div className="text-sm text-slate-500 italic">Nenhum material alocado.</div>
                                    ) : (
                                        itens.map((item) => {
                                            const material = materiais.find((m) => m.id === item.material_id);
                                            return (
                                                <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <div className="font-medium text-slate-800">{material?.nome || '-'}</div>
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                {Number(item.quantidade || 0)} {material?.unidade || 'un'}
                                                                {item.localizacao ? ` • ${item.localizacao}` : ''}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>Editar</Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MateriaisTecnicoTab;
