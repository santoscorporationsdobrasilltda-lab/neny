import React, { useEffect, useMemo, useState } from 'react';
import { Package, Plus, Save, Search, Trash2, Boxes, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const materialInitial = {
    id: '',
    nome: '',
    categoria: '',
    unidade: 'un',
    estoque_atual: '0',
    custo_unitario: '0',
    ativo: true,
    observacoes: '',
};

const usoInitial = {
    id: '',
    ordem_id: '',
    material_id: '',
    tecnico_id: '',
    quantidade: '1',
    valor_unitario: '',
    data_uso: new Date().toISOString().slice(0, 10),
    observacoes: '',
};

const money = (value) =>
    Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const MateriaisTab = () => {
    const { user } = useAuth();
    const { toast } = useToast();

    const { data: materiais, fetchAll: fetchMateriais, create: createMaterial, update: updateMaterial, remove: removeMaterial } =
        useSupabaseCrud('ordem_servicos_materiais');
    const { data: usos, fetchAll: fetchUsos, create: createUso, update: updateUso, remove: removeUso } =
        useSupabaseCrud('ordem_servicos_materiais_utilizados');
    const { data: ordens, fetchAll: fetchOrdens } = useSupabaseCrud('ordem_servicos_ordens');
    const { data: tecnicos, fetchAll: fetchTecnicos } = useSupabaseCrud('ordem_servicos_tecnicos');

    const [search, setSearch] = useState('');
    const [materialForm, setMaterialForm] = useState(materialInitial);
    const [usoForm, setUsoForm] = useState(usoInitial);

    useEffect(() => {
        if (user) {
            fetchMateriais(1, 1000);
            fetchUsos(1, 2000);
            fetchOrdens(1, 1000);
            fetchTecnicos(1, 1000);
        }
    }, [user, fetchMateriais, fetchUsos, fetchOrdens, fetchTecnicos]);

    const filteredMateriais = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return materiais;
        return materiais.filter((item) =>
            [item.nome, item.categoria, item.unidade, item.observacoes]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(term))
        );
    }, [materiais, search]);

    const totalEstoque = filteredMateriais.reduce((acc, item) => acc + Number(item.estoque_atual || 0), 0);
    const valorEstoque = filteredMateriais.reduce(
        (acc, item) => acc + Number(item.estoque_atual || 0) * Number(item.custo_unitario || 0),
        0
    );
    const totalUsado = usos.reduce((acc, item) => acc + Number(item.valor_total || 0), 0);

    const getMaterial = (id) => materiais.find((m) => m.id === id);
    const getOrdem = (id) => ordens.find((o) => o.id === id);
    const getTecnico = (id) => tecnicos.find((t) => t.id === id);

    const resetMaterialForm = () => setMaterialForm(materialInitial);
    const resetUsoForm = () => setUsoForm(usoInitial);

    const handleSaveMaterial = async (e) => {
        e.preventDefault();
        if (!user) return;
        if (!materialForm.nome.trim()) {
            toast({ title: 'Material obrigatório', description: 'Informe o nome do material.', variant: 'destructive' });
            return;
        }

        const payload = {
            user_id: user.id,
            nome: materialForm.nome.trim(),
            categoria: materialForm.categoria.trim() || null,
            unidade: materialForm.unidade || 'un',
            estoque_atual: Number(materialForm.estoque_atual || 0),
            custo_unitario: Number(materialForm.custo_unitario || 0),
            ativo: !!materialForm.ativo,
            observacoes: materialForm.observacoes.trim() || null,
            updated_at: new Date().toISOString(),
        };

        if (materialForm.id) {
            await updateMaterial(materialForm.id, payload);
        } else {
            await createMaterial(payload);
        }

        resetMaterialForm();
        fetchMateriais(1, 1000);
    };

    const handleEditMaterial = (item) => {
        setMaterialForm({
            id: item.id,
            nome: item.nome || '',
            categoria: item.categoria || '',
            unidade: item.unidade || 'un',
            estoque_atual: String(item.estoque_atual ?? '0'),
            custo_unitario: String(item.custo_unitario ?? '0'),
            ativo: item.ativo ?? true,
            observacoes: item.observacoes || '',
        });
    };

    const handleDeleteMaterial = async (id) => {
        if (!window.confirm('Excluir este material?')) return;
        await removeMaterial(id);
        fetchMateriais(1, 1000);
    };

    const handleSaveUso = async (e) => {
        e.preventDefault();
        if (!user) return;
        if (!usoForm.ordem_id || !usoForm.material_id) {
            toast({ title: 'Dados obrigatórios', description: 'Selecione a OS e o material.', variant: 'destructive' });
            return;
        }

        const material = getMaterial(usoForm.material_id);
        const quantidade = Number(usoForm.quantidade || 0);
        const valorUnitario = Number(usoForm.valor_unitario || material?.custo_unitario || 0);
        const valorTotal = quantidade * valorUnitario;

        const payload = {
            user_id: user.id,
            ordem_id: usoForm.ordem_id,
            material_id: usoForm.material_id,
            tecnico_id: usoForm.tecnico_id || null,
            quantidade,
            valor_unitario: valorUnitario,
            valor_total: valorTotal,
            data_uso: usoForm.data_uso || new Date().toISOString().slice(0, 10),
            observacoes: usoForm.observacoes.trim() || null,
            updated_at: new Date().toISOString(),
        };

        if (usoForm.id) {
            await updateUso(usoForm.id, payload);
        } else {
            await createUso(payload);
            if (material) {
                await updateMaterial(material.id, {
                    estoque_atual: Math.max(0, Number(material.estoque_atual || 0) - quantidade),
                    updated_at: new Date().toISOString(),
                });
            }
        }

        resetUsoForm();
        fetchUsos(1, 2000);
        fetchMateriais(1, 1000);
    };

    const handleEditUso = (item) => {
        setUsoForm({
            id: item.id,
            ordem_id: item.ordem_id || '',
            material_id: item.material_id || '',
            tecnico_id: item.tecnico_id || '',
            quantidade: String(item.quantidade ?? '1'),
            valor_unitario: String(item.valor_unitario ?? ''),
            data_uso: item.data_uso || new Date().toISOString().slice(0, 10),
            observacoes: item.observacoes || '',
        });
    };

    const handleDeleteUso = async (item) => {
        if (!window.confirm('Excluir este lançamento de uso de material?')) return;
        await removeUso(item.id);
        fetchUsos(1, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Itens cadastrados</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{filteredMateriais.length}</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Estoque total</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalEstoque}</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Valor do estoque / uso</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{money(valorEstoque)}</h3>
                    <p className="text-xs text-slate-500 mt-1">Uso registrado: {money(totalUsado)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Cadastro de materiais</h3>
                            <p className="text-sm text-slate-500">Estoque base dos itens utilizados nas OS.</p>
                        </div>
                        <Package className="w-6 h-6 text-orange-500" />
                    </div>

                    <form onSubmit={handleSaveMaterial} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input className="hidden" value={materialForm.id} readOnly />
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-slate-700">Nome do material</label>
                            <input className="w-full mt-1 p-2 border rounded-lg" value={materialForm.nome} onChange={(e) => setMaterialForm((p) => ({ ...p, nome: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Categoria</label>
                            <input className="w-full mt-1 p-2 border rounded-lg" value={materialForm.categoria} onChange={(e) => setMaterialForm((p) => ({ ...p, categoria: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Unidade</label>
                            <input className="w-full mt-1 p-2 border rounded-lg" value={materialForm.unidade} onChange={(e) => setMaterialForm((p) => ({ ...p, unidade: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Estoque atual</label>
                            <input type="number" step="0.01" className="w-full mt-1 p-2 border rounded-lg" value={materialForm.estoque_atual} onChange={(e) => setMaterialForm((p) => ({ ...p, estoque_atual: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Custo unitário</label>
                            <input type="number" step="0.01" className="w-full mt-1 p-2 border rounded-lg" value={materialForm.custo_unitario} onChange={(e) => setMaterialForm((p) => ({ ...p, custo_unitario: e.target.value }))} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-slate-700">Observações</label>
                            <textarea className="w-full mt-1 p-2 border rounded-lg min-h-[90px]" value={materialForm.observacoes} onChange={(e) => setMaterialForm((p) => ({ ...p, observacoes: e.target.value }))} />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-2">
                            {materialForm.id ? <Button type="button" variant="outline" onClick={resetMaterialForm}>Cancelar</Button> : null}
                            <Button type="submit"><Save className="w-4 h-4 mr-2" />{materialForm.id ? 'Salvar material' : 'Cadastrar material'}</Button>
                        </div>
                    </form>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Material utilizado por OS</h3>
                            <p className="text-sm text-slate-500">Baixa de itens aplicados nas ordens de serviço.</p>
                        </div>
                        <ClipboardList className="w-6 h-6 text-blue-500" />
                    </div>

                    <form onSubmit={handleSaveUso} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">OS</label>
                            <select className="w-full mt-1 p-2 border rounded-lg" value={usoForm.ordem_id} onChange={(e) => setUsoForm((p) => ({ ...p, ordem_id: e.target.value }))}>
                                <option value="">Selecione a OS</option>
                                {ordens.map((ordem) => (
                                    <option key={ordem.id} value={ordem.id}>{ordem.cliente} — {String(ordem.id).slice(0, 8)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Material</label>
                            <select className="w-full mt-1 p-2 border rounded-lg" value={usoForm.material_id} onChange={(e) => {
                                const material = getMaterial(e.target.value);
                                setUsoForm((p) => ({ ...p, material_id: e.target.value, valor_unitario: String(material?.custo_unitario ?? '') }));
                            }}>
                                <option value="">Selecione o material</option>
                                {materiais.map((material) => (
                                    <option key={material.id} value={material.id}>{material.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Técnico</label>
                            <select className="w-full mt-1 p-2 border rounded-lg" value={usoForm.tecnico_id} onChange={(e) => setUsoForm((p) => ({ ...p, tecnico_id: e.target.value }))}>
                                <option value="">Selecione o técnico</option>
                                {tecnicos.map((tecnico) => (
                                    <option key={tecnico.id} value={tecnico.id}>{tecnico.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Data de uso</label>
                            <input type="date" className="w-full mt-1 p-2 border rounded-lg" value={usoForm.data_uso} onChange={(e) => setUsoForm((p) => ({ ...p, data_uso: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Quantidade</label>
                            <input type="number" step="0.01" className="w-full mt-1 p-2 border rounded-lg" value={usoForm.quantidade} onChange={(e) => setUsoForm((p) => ({ ...p, quantidade: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Valor unitário</label>
                            <input type="number" step="0.01" className="w-full mt-1 p-2 border rounded-lg" value={usoForm.valor_unitario} onChange={(e) => setUsoForm((p) => ({ ...p, valor_unitario: e.target.value }))} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-slate-700">Observações</label>
                            <textarea className="w-full mt-1 p-2 border rounded-lg min-h-[90px]" value={usoForm.observacoes} onChange={(e) => setUsoForm((p) => ({ ...p, observacoes: e.target.value }))} />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-2">
                            {usoForm.id ? <Button type="button" variant="outline" onClick={resetUsoForm}>Cancelar</Button> : null}
                            <Button type="submit"><Save className="w-4 h-4 mr-2" />{usoForm.id ? 'Salvar uso' : 'Lançar uso de material'}</Button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Itens cadastrados</h3>
                        <p className="text-sm text-slate-500">Base de materiais e estoque disponível.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-2 border rounded-lg" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar material..." />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b">
                                <th className="py-3 pr-3">Material</th>
                                <th className="py-3 pr-3">Categoria</th>
                                <th className="py-3 pr-3">Unidade</th>
                                <th className="py-3 pr-3">Estoque</th>
                                <th className="py-3 pr-3">Custo unit.</th>
                                <th className="py-3 pr-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMateriais.map((item) => (
                                <tr key={item.id} className="border-b last:border-none">
                                    <td className="py-3 pr-3 font-medium text-slate-800">{item.nome}</td>
                                    <td className="py-3 pr-3">{item.categoria || '-'}</td>
                                    <td className="py-3 pr-3">{item.unidade}</td>
                                    <td className="py-3 pr-3">{Number(item.estoque_atual || 0)}</td>
                                    <td className="py-3 pr-3">{money(item.custo_unitario)}</td>
                                    <td className="py-3 pr-3">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleEditMaterial(item)}>Editar</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDeleteMaterial(item.id)}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Histórico de materiais utilizados</h3>
                        <p className="text-sm text-slate-500">Consumo vinculado às ordens de serviço.</p>
                    </div>
                    <div className="rounded-full px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium flex items-center gap-2">
                        <Boxes className="w-4 h-4" /> {usos.length} lançamentos
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b">
                                <th className="py-3 pr-3">OS</th>
                                <th className="py-3 pr-3">Material</th>
                                <th className="py-3 pr-3">Técnico</th>
                                <th className="py-3 pr-3">Qtd.</th>
                                <th className="py-3 pr-3">Valor</th>
                                <th className="py-3 pr-3">Data</th>
                                <th className="py-3 pr-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usos.map((item) => (
                                <tr key={item.id} className="border-b last:border-none">
                                    <td className="py-3 pr-3">{getOrdem(item.ordem_id)?.cliente || String(item.ordem_id).slice(0, 8)}</td>
                                    <td className="py-3 pr-3">{getMaterial(item.material_id)?.nome || '-'}</td>
                                    <td className="py-3 pr-3">{getTecnico(item.tecnico_id)?.nome || '-'}</td>
                                    <td className="py-3 pr-3">{Number(item.quantidade || 0)}</td>
                                    <td className="py-3 pr-3">{money(item.valor_total)}</td>
                                    <td className="py-3 pr-3">{item.data_uso ? new Date(item.data_uso).toLocaleDateString('pt-BR') : '-'}</td>
                                    <td className="py-3 pr-3">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleEditUso(item)}>Editar</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDeleteUso(item)}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MateriaisTab;
