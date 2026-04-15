import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, CalendarClock, CheckCircle2, Edit, Save, Search, Trash2, X } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const toDateInput = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
};

const normalizeDate = (value) => {
    if (!value) return null;
    const d = new Date(`${value}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
};

const getComplianceStatus = (item) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = normalizeDate(item.proxima_data || item.proximaData);

    if (!nextDate) {
        return {
            key: 'sem_agendamento',
            label: 'Sem próxima data',
            badge: 'bg-slate-100 text-slate-700',
            priority: 4,
        };
    }

    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / 86400000);

    if (diffDays < 0) {
        return {
            key: 'vencido',
            label: 'Vencido',
            badge: 'bg-red-100 text-red-700',
            priority: 0,
            diffDays,
        };
    }

    if (diffDays <= 7) {
        return {
            key: 'proximos_7',
            label: 'Próximos 7 dias',
            badge: 'bg-amber-100 text-amber-700',
            priority: 1,
            diffDays,
        };
    }

    if (diffDays <= 30) {
        return {
            key: 'monitorar_30',
            label: 'Monitorar 30 dias',
            badge: 'bg-blue-100 text-blue-700',
            priority: 2,
            diffDays,
        };
    }

    return {
        key: 'em_dia',
        label: 'Em dia',
        badge: 'bg-green-100 text-green-700',
        priority: 3,
        diffDays,
    };
};

const initialForm = {
    id: '',
    bovinoId: '',
    bovinoNome: '',
    data: new Date().toISOString().split('T')[0],
    tipo: 'Vacina',
    produto: '',
    dose: '',
    responsavel: '',
    proximaData: '',
    observacoes: '',
};

const SanidadeTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: events,
        fetchAll: fetchEvents,
        create,
        update,
        remove,
    } = useSupabaseCrud('fazenda50_sanidade');

    const {
        data: bovinos,
        fetchAll: fetchBovinos,
    } = useSupabaseCrud('fazenda50_bovinos');

    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState(initialForm);
    const [statusFilter, setStatusFilter] = useState('todos');
    const [animalFilter, setAnimalFilter] = useState('todos');
    const [loteFilter, setLoteFilter] = useState('todos');

    useEffect(() => {
        if (user) {
            fetchEvents();
            fetchBovinos();
        }
    }, [user, fetchEvents, fetchBovinos]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const animalId = params.get('animal');
        if (animalId) {
            setAnimalFilter(animalId);
        }
    }, []);

    const bovinosMap = useMemo(() => {
        return Object.fromEntries(bovinos.map((b) => [b.id, b]));
    }, [bovinos]);

    const lotes = useMemo(() => {
        return [...new Set(bovinos.map((b) => b.lote).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
    }, [bovinos]);

    const resetForm = () => {
        setFormData(initialForm);
        setIsEditing(false);
    };

    const handleBovinoChange = (e) => {
        const id = e.target.value;
        const animal = bovinosMap[id];
        setFormData((prev) => ({
            ...prev,
            bovinoId: id,
            bovinoNome: animal ? `${animal.brinco} - ${animal.nome}` : '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({ title: 'Erro', description: 'Usuário não autenticado.', variant: 'destructive' });
            return;
        }

        if (!formData.bovinoId || !formData.produto) {
            toast({ title: 'Erro', description: 'Selecione o animal e informe o produto.', variant: 'destructive' });
            return;
        }

        const selectedAnimal = bovinosMap[formData.bovinoId];

        const payload = {
            user_id: user.id,
            bovino_id: formData.bovinoId,
            fazenda_id: selectedAnimal?.fazenda_id || null,
            data: formData.data || null,
            tipo_evento: formData.tipo || null,
            produto: formData.produto || null,
            dose: formData.dose || null,
            responsavel: formData.responsavel || null,
            proxima_data: formData.proximaData || null,
            observacoes: formData.observacoes || null,
            updated_at: new Date().toISOString(),
        };

        try {
            if (formData.id) {
                await update(formData.id, payload);
                toast({ title: 'Sucesso', description: 'Registro sanitário atualizado.' });
            } else {
                await create(payload);
                toast({ title: 'Sucesso', description: 'Manejo sanitário registrado.' });
            }
            await fetchEvents();
            resetForm();
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro', description: 'Falha ao salvar registro sanitário.', variant: 'destructive' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir registro?')) return;
        try {
            await remove(id);
            await fetchEvents();
            toast({ title: 'Sucesso', description: 'Registro sanitário excluído.' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro', description: 'Falha ao excluir registro.', variant: 'destructive' });
        }
    };

    const handleEdit = (item) => {
        const animal = bovinosMap[item.bovino_id];
        setFormData({
            id: item.id,
            bovinoId: item.bovino_id || '',
            bovinoNome: animal ? `${animal.brinco} - ${animal.nome}` : '',
            data: toDateInput(item.data) || new Date().toISOString().split('T')[0],
            tipo: item.tipo_evento || 'Vacina',
            produto: item.produto || '',
            dose: item.dose || '',
            responsavel: item.responsavel || '',
            proximaData: toDateInput(item.proxima_data),
            observacoes: item.observacoes || '',
        });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const enrichedEvents = useMemo(() => {
        return events.map((item) => {
            const animal = bovinosMap[item.bovino_id];
            const compliance = getComplianceStatus(item);
            return {
                ...item,
                animal,
                compliance,
                bovinoNome: animal ? `${animal.brinco} - ${animal.nome}` : 'Animal não encontrado',
                lote: animal?.lote || '-',
            };
        });
    }, [events, bovinosMap]);

    const summary = useMemo(() => {
        const vencidos = enrichedEvents.filter((e) => e.compliance.key === 'vencido').length;
        const proximos7 = enrichedEvents.filter((e) => e.compliance.key === 'proximos_7').length;
        const monitorar30 = enrichedEvents.filter((e) => e.compliance.key === 'monitorar_30').length;
        const emDia = enrichedEvents.filter((e) => e.compliance.key === 'em_dia').length;
        return {
            total: enrichedEvents.length,
            vencidos,
            proximos7,
            monitorar30,
            emDia,
        };
    }, [enrichedEvents]);

    const sortedAndFilteredEvents = useMemo(() => {
        return [...enrichedEvents]
            .filter((item) => {
                const term = searchTerm.toLowerCase().trim();
                const matchesSearch =
                    !term ||
                    item.bovinoNome.toLowerCase().includes(term) ||
                    (item.tipo_evento || '').toLowerCase().includes(term) ||
                    (item.produto || '').toLowerCase().includes(term) ||
                    (item.responsavel || '').toLowerCase().includes(term) ||
                    (item.lote || '').toLowerCase().includes(term);

                const matchesStatus = statusFilter === 'todos' ? true : item.compliance.key === statusFilter;
                const matchesAnimal = animalFilter === 'todos' ? true : item.bovino_id === animalFilter;
                const matchesLote = loteFilter === 'todos' ? true : (item.lote || '') === loteFilter;

                return matchesSearch && matchesStatus && matchesAnimal && matchesLote;
            })
            .sort((a, b) => {
                const pa = a.compliance.priority ?? 99;
                const pb = b.compliance.priority ?? 99;
                if (pa !== pb) return pa - pb;
                const da = a.proxima_data ? new Date(a.proxima_data).getTime() : 0;
                const db = b.proxima_data ? new Date(b.proxima_data).getTime() : 0;
                return da - db;
            });
    }, [enrichedEvents, searchTerm, statusFilter, animalFilter, loteFilter]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl border p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Total de eventos</div>
                    <div className="text-2xl font-bold text-slate-800">{summary.total}</div>
                </div>
                <div className="bg-white rounded-xl border p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Vencidos</div>
                    <div className="text-2xl font-bold text-red-600">{summary.vencidos}</div>
                </div>
                <div className="bg-white rounded-xl border p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Próximos 7 dias</div>
                    <div className="text-2xl font-bold text-amber-600">{summary.proximos7}</div>
                </div>
                <div className="bg-white rounded-xl border p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Monitorar 30 dias</div>
                    <div className="text-2xl font-bold text-blue-600">{summary.monitorar30}</div>
                </div>
                <div className="bg-white rounded-xl border p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Em dia</div>
                    <div className="text-2xl font-bold text-green-600">{summary.emDia}</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isEditing ? 'Editar Registro' : 'Novo Manejo Sanitário'}
                    </h2>

                    {isEditing && (
                        <Button variant="ghost" onClick={resetForm} size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="text-sm font-medium mb-1 block">Animal</label>
                        <select className="w-full p-2 border rounded" value={formData.bovinoId} onChange={handleBovinoChange} required>
                            <option value="">Selecione o Bovino...</option>
                            {bovinos.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.brinco} - {b.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Data</label>
                        <input type="date" className="w-full p-2 border rounded" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} required />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Tipo</label>
                        <select className="w-full p-2 border rounded" value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}>
                            <option>Vacina</option>
                            <option>Tratamento</option>
                            <option>Exame</option>
                            <option>Vermifugação</option>
                            <option>Suplementação</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Produto</label>
                        <input type="text" className="w-full p-2 border rounded" value={formData.produto} onChange={(e) => setFormData({ ...formData, produto: e.target.value })} required />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Dose</label>
                        <input type="text" className="w-full p-2 border rounded" value={formData.dose} onChange={(e) => setFormData({ ...formData, dose: e.target.value })} />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Responsável</label>
                        <input type="text" className="w-full p-2 border rounded" value={formData.responsavel} onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })} />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Próxima data</label>
                        <input type="date" className="w-full p-2 border rounded" value={formData.proximaData} onChange={(e) => setFormData({ ...formData, proximaData: e.target.value })} />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-1 block">Observações</label>
                        <textarea className="w-full p-2 border rounded min-h-[88px]" value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} />
                    </div>

                    <div className="md:col-span-3 flex justify-end">
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                            <Save className="w-4 h-4 mr-2" />
                            {formData.id ? 'Atualizar' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Conformidade Sanitária</h2>

                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="pl-10 pr-3 py-2 border rounded-lg w-full md:w-80"
                                placeholder="Buscar animal, lote, produto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select className="border rounded-lg px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="todos">Todos status</option>
                            <option value="vencido">Vencidos</option>
                            <option value="proximos_7">Próximos 7 dias</option>
                            <option value="monitorar_30">Monitorar 30 dias</option>
                            <option value="em_dia">Em dia</option>
                            <option value="sem_agendamento">Sem próxima data</option>
                        </select>

                        <select className="border rounded-lg px-3 py-2" value={animalFilter} onChange={(e) => setAnimalFilter(e.target.value)}>
                            <option value="todos">Todos os animais</option>
                            {bovinos.map((b) => (
                                <option key={b.id} value={b.id}>{b.brinco} - {b.nome}</option>
                            ))}
                        </select>

                        <select className="border rounded-lg px-3 py-2" value={loteFilter} onChange={(e) => setLoteFilter(e.target.value)}>
                            <option value="todos">Todos os lotes</option>
                            {lotes.map((lote) => (
                                <option key={lote} value={lote}>{lote}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-xl">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-3">Animal</th>
                                <th className="p-3">Lote</th>
                                <th className="p-3">Evento</th>
                                <th className="p-3">Produto</th>
                                <th className="p-3">Próxima data</th>
                                <th className="p-3">Situação</th>
                                <th className="p-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sortedAndFilteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-6 text-center text-slate-500">Nenhum registro sanitário encontrado.</td>
                                </tr>
                            ) : (
                                sortedAndFilteredEvents.map((item) => (
                                    <tr key={item.id} className={item.compliance.key === 'vencido' ? 'bg-red-50/40' : ''}>
                                        <td className="p-3">{item.bovinoNome}</td>
                                        <td className="p-3">{item.lote}</td>
                                        <td className="p-3">{item.tipo_evento || '-'}</td>
                                        <td className="p-3">{item.produto || '-'}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                {item.compliance.key === 'vencido' ? (
                                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                                ) : item.compliance.key === 'em_dia' ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <CalendarClock className="w-4 h-4 text-amber-600" />
                                                )}
                                                {item.proxima_data ? new Date(item.proxima_data).toLocaleDateString('pt-BR') : '-'}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${item.compliance.badge}`}>
                                                {item.compliance.label}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(item.id)}>
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

export default SanidadeTab;
