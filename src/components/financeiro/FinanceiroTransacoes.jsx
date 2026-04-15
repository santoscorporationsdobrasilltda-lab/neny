import React, { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Search, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCreate } from '@/hooks/useCreate';
import { useRead } from '@/hooks/useRead';
import { useUpdate } from '@/hooks/useUpdate';
import { useDelete } from '@/hooks/useDelete';

const mapRouteTypeToDb = (type) => (type === 'Receita' ? 'Receita' : 'Despesa');
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const FinanceiroTransacoes = ({ type }) => {
    const dbType = mapRouteTypeToDb(type);
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const { data: items, loading: loadingRead, refetch } = useRead('financeiro_lancamentos');
    const { create, loading: loadingCreate } = useCreate('financeiro_lancamentos');
    const { update, loading: loadingUpdate } = useUpdate('financeiro_lancamentos');
    const { delete: remove, loading: loadingDelete } = useDelete('financeiro_lancamentos');

    const loading = loadingRead || loadingCreate || loadingUpdate || loadingDelete;

    const filteredItems = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return items
            .filter((i) => (i.tipo || '') === dbType)
            .filter((i) => {
                if (!term) return true;
                return [i.descricao, i.categoria, i.forma_pagamento, i.centro_custo, i.data]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(term));
            });
    }, [items, dbType, searchTerm]);

    const total = useMemo(() => filteredItems.reduce((acc, item) => acc + Number(item.valor || 0), 0), [filteredItems]);

    const handleSave = async () => {
        if (!formData.descricao || !formData.valor || !formData.data) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Preencha os campos obrigatórios.' });
            return;
        }

        const payload = {
            data: formData.data,
            tipo: dbType,
            categoria: formData.categoria || null,
            descricao: formData.descricao,
            valor: Number(formData.valor || 0),
            forma_pagamento: formData.forma_pagamento || null,
            centro_custo: formData.centro_custo || null,
            updated_at: new Date().toISOString(),
        };

        try {
            if (formData.id) {
                await update(formData.id, payload);
            } else {
                await create(payload);
            }
            setIsEditing(false);
            setFormData({});
            await refetch();
            toast({ title: 'Sucesso', description: `${type} salva com sucesso.` });
        } catch (err) {
            toast({ variant: 'destructive', title: 'Erro', description: err.message });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Deseja realmente excluir?')) {
            try {
                await remove(id);
                await refetch();
                toast({ title: 'Sucesso', description: 'Registro excluído.' });
            } catch (err) {
                toast({ variant: 'destructive', title: 'Erro', description: err.message });
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <div className="text-sm text-slate-500">Total de {type.toLowerCase()}s</div>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(total)}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                    <div className="text-sm text-slate-500">Lançamentos</div>
                    <div className="text-2xl font-bold text-slate-900">{filteredItems.length}</div>
                </div>
                <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${type === 'Receita' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-900">{type === 'Receita' ? 'Entradas' : 'Saídas'} operacionais</div>
                        <div className="text-xs text-slate-500">Gestão direta dos registros financeiros.</div>
                    </div>
                </div>
            </div>

            {!isEditing ? (
                <>
                    <div className="flex flex-wrap justify-between gap-3">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900"
                                placeholder={`Buscar ${type.toLowerCase()} por descrição, categoria ou centro de custo...`}
                            />
                        </div>
                        <Button
                            disabled={loading}
                            onClick={() => {
                                setFormData({ data: new Date().toISOString().split('T')[0] });
                                setIsEditing(true);
                            }}
                            className={type === 'Receita' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Nova {type}
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl overflow-hidden border shadow-sm">
                        {loadingRead ? (
                            <p className="p-6 text-slate-500">Carregando...</p>
                        ) : filteredItems.length === 0 ? (
                            <p className="p-6 text-slate-500">Nenhum registro encontrado.</p>
                        ) : (
                            <table className="w-full text-left text-slate-900">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-4">Data</th>
                                        <th className="p-4">Descrição</th>
                                        <th className="p-4">Categoria</th>
                                        <th className="p-4">Valor</th>
                                        <th className="p-4">Forma Pgto</th>
                                        <th className="p-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="border-t hover:bg-slate-50">
                                            <td className="p-4">{item.data || '-'}</td>
                                            <td className="p-4">{item.descricao}</td>
                                            <td className="p-4">{item.categoria || '-'}</td>
                                            <td className={`p-4 font-semibold ${type === 'Receita' ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(item.valor)}</td>
                                            <td className="p-4">{item.forma_pagamento || '-'}</td>
                                            <td className="p-4 flex gap-2">
                                                <Button disabled={loading} size="icon" variant="ghost" onClick={() => {
                                                    setFormData({
                                                        id: item.id,
                                                        data: item.data || '',
                                                        descricao: item.descricao || '',
                                                        categoria: item.categoria || '',
                                                        valor: item.valor || '',
                                                        forma_pagamento: item.forma_pagamento || '',
                                                        centro_custo: item.centro_custo || '',
                                                    });
                                                    setIsEditing(true);
                                                }}><Edit className="w-4 h-4" /></Button>
                                                <Button disabled={loading} size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-white p-6 rounded-xl border shadow-sm max-w-3xl mx-auto space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">{formData.id ? 'Editar' : 'Nova'} {type}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="date" value={formData.data || ''} onChange={e => setFormData({ ...formData, data: e.target.value })} className="border rounded-xl px-4 py-3" />
                        <input placeholder="Descrição" value={formData.descricao || ''} onChange={e => setFormData({ ...formData, descricao: e.target.value })} className="border rounded-xl px-4 py-3" />
                        <input placeholder="Categoria" value={formData.categoria || ''} onChange={e => setFormData({ ...formData, categoria: e.target.value })} className="border rounded-xl px-4 py-3" />
                        <input type="number" placeholder="Valor" value={formData.valor || ''} onChange={e => setFormData({ ...formData, valor: e.target.value })} className="border rounded-xl px-4 py-3" />
                        <input placeholder="Forma de pagamento" value={formData.forma_pagamento || ''} onChange={e => setFormData({ ...formData, forma_pagamento: e.target.value })} className="border rounded-xl px-4 py-3" />
                        <input placeholder="Centro de Custo" value={formData.centro_custo || ''} onChange={e => setFormData({ ...formData, centro_custo: e.target.value })} className="border rounded-xl px-4 py-3" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button disabled={loading} onClick={handleSave} className={type === 'Receita' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>Salvar</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceiroTransacoes;
