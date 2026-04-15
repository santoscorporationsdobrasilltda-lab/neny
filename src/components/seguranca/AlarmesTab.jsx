import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Siren,
    ShieldCheck,
    ShieldOff,
    Bell,
    List,
    AlertTriangle,
    Plus,
    Edit,
    Trash2,
    Search,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const contactIdEvents = {
    '110': 'Disparo de Alarme',
    '120': 'Pânico Disparado Manualmente',
    '121': 'Alarme de Coação',
    '130': 'Alarme de Pânico',
    '301': 'Falha de Energia',
    '302': 'Bateria Baixa',
    '401': 'Arme/Desarme',
    '403': 'Arme/Desarme Remoto',
    '602': 'Teste Periódico',
};

const generateRandomEventPayload = (panel, userId) => {
    const eventCodes = Object.keys(contactIdEvents);
    const randomCode = eventCodes[Math.floor(Math.random() * eventCodes.length)];
    const zone = String(Math.floor(Math.random() * 16) + 1).padStart(3, '0');

    return {
        user_id: userId,
        panel_id: panel.id,
        panel_name: panel.name,
        code: randomCode,
        description: contactIdEvents[randomCode],
        zone,
        event_at: new Date().toISOString(),
        status: randomCode.startsWith('1') ? 'alarme' : 'evento',
    };
};

const initialPanelForm = {
    id: '',
    name: '',
    status: 'disarmed',
    local: '',
    ip_address: '',
    observacoes: '',
};

const AlarmesTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: panels,
        loading: loadingPanels,
        fetchAll: fetchPanels,
        create: createPanel,
        update: updatePanel,
        remove: removePanel,
    } = useSupabaseCrud('seguranca_alarm_panels');

    const {
        data: events,
        loading: loadingEvents,
        fetchAll: fetchEvents,
        setData: setEvents,
    } = useSupabaseCrud('seguranca_alarm_events');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [panelForm, setPanelForm] = useState(initialPanelForm);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user) {
            fetchPanels(1, 1000);
            fetchEvents(1, 200);
        }
    }, [user, fetchPanels, fetchEvents]);

    useEffect(() => {
        if (!user || panels.length === 0) return;

        const interval = setInterval(async () => {
            if (Math.random() <= 0.7) return;

            const armedPanels = panels.filter((panel) => panel.status === 'armed');
            if (armedPanels.length === 0) return;

            const randomPanel = armedPanels[Math.floor(Math.random() * armedPanels.length)];
            const payload = generateRandomEventPayload(randomPanel, user.id);

            const { data, error } = await supabase
                .from('seguranca_alarm_events')
                .insert([payload])
                .select()
                .single();

            if (error || !data) return;

            setEvents((prev) => [data, ...prev].slice(0, 200));

            if (data.status === 'alarme') {
                toast({
                    variant: 'destructive',
                    title: `🚨 ALARME: ${data.panel_name}`,
                    description: `${data.description} na Zona ${data.zone}`,
                });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [user, panels, setEvents, toast]);

    const filteredPanels = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...panels].filter((panel) => {
            return (
                (panel.name || '').toLowerCase().includes(term) ||
                (panel.local || '').toLowerCase().includes(term) ||
                (panel.ip_address || '').toLowerCase().includes(term) ||
                (panel.status || '').toLowerCase().includes(term)
            );
        });
    }, [panels, searchTerm]);

    const filteredEvents = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...events]
            .filter((event) => {
                return (
                    (event.panel_name || '').toLowerCase().includes(term) ||
                    (event.description || '').toLowerCase().includes(term) ||
                    (event.code || '').toLowerCase().includes(term) ||
                    (event.zone || '').toLowerCase().includes(term) ||
                    (event.status || '').toLowerCase().includes(term)
                );
            })
            .sort((a, b) => {
                const da = a.event_at ? new Date(a.event_at).getTime() : 0;
                const db = b.event_at ? new Date(b.event_at).getTime() : 0;
                return db - da;
            });
    }, [events, searchTerm]);

    const openCreateModal = () => {
        setPanelForm(initialPanelForm);
        setIsModalOpen(true);
    };

    const openEditModal = (panel) => {
        setPanelForm({
            id: panel.id,
            name: panel.name || '',
            status: panel.status || 'disarmed',
            local: panel.local || '',
            ip_address: panel.ip_address || '',
            observacoes: panel.observacoes || '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setPanelForm(initialPanelForm);
        setIsModalOpen(false);
    };

    const getStatusColor = (status) => {
        if (status === 'alarme') return 'bg-red-100 text-red-800';
        return 'bg-slate-100 text-slate-800';
    };

    const getPanelBadge = (status) => {
        if (status === 'armed') return 'bg-green-100 text-green-800';
        if (status === 'maintenance') return 'bg-blue-100 text-blue-800';
        return 'bg-yellow-100 text-yellow-800';
    };

    const createEventSilently = async (payload) => {
        const { data, error } = await supabase
            .from('seguranca_alarm_events')
            .insert([payload])
            .select()
            .single();

        if (error || !data) return null;

        setEvents((prev) => [data, ...prev].slice(0, 200));
        return data;
    };

    const toggleArm = async (panel) => {
        const newStatus = panel.status === 'armed' ? 'disarmed' : 'armed';

        const updated = await updatePanel(panel.id, {
            status: newStatus,
            updated_at: new Date().toISOString(),
        });

        if (!updated || !user) return;

        await createEventSilently({
            user_id: user.id,
            panel_id: panel.id,
            panel_name: panel.name,
            code: '401',
            description: newStatus === 'armed' ? 'Central armada' : 'Central desarmada',
            zone: '000',
            event_at: new Date().toISOString(),
            status: 'evento',
        });

        toast({
            title: `Central ${newStatus === 'armed' ? 'Armada' : 'Desarmada'}`,
            description: `A central "${panel.name}" foi ${newStatus === 'armed' ? 'armada' : 'desarmada'}.`,
        });

        await fetchPanels(1, 1000);
    };

    const triggerPanic = async (panel) => {
        if (!user) return;

        const newEvent = await createEventSilently({
            user_id: user.id,
            panel_id: panel.id,
            panel_name: panel.name,
            code: '120',
            description: 'Pânico Disparado Manualmente',
            zone: '000',
            event_at: new Date().toISOString(),
            status: 'alarme',
        });

        if (!newEvent) return;

        toast({
            variant: 'destructive',
            title: `🚨 PÂNICO: ${panel.name}`,
            description: 'O botão de pânico foi acionado!',
        });
    };

    const handleDeletePanel = async (id) => {
        const confirmed = window.confirm('Deseja realmente excluir esta central de alarme?');
        if (!confirmed) return;

        const success = await removePanel(id);
        if (success) {
            await fetchPanels(1, 1000);
        }
    };

    const handleSavePanel = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!panelForm.name.trim()) {
            toast({
                title: 'Erro',
                description: 'Informe o nome da central.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            name: panelForm.name.trim(),
            status: panelForm.status || 'disarmed',
            local: panelForm.local?.trim() || null,
            ip_address: panelForm.ip_address?.trim() || null,
            observacoes: panelForm.observacoes?.trim() || null,
            updated_at: new Date().toISOString(),
        };

        const saved = panelForm.id
            ? await updatePanel(panelForm.id, payload)
            : await createPanel(payload);

        if (saved) {
            await fetchPanels(1, 1000);
            closeModal();
        }
    };

    const loading = loadingPanels || loadingEvents;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-semibold text-slate-800">Painéis de Alarme</h2>
                    <Button onClick={openCreateModal} className="bg-slate-900 hover:bg-slate-800 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Painel
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        className="w-full pl-10 pr-3 py-2 border rounded-lg"
                        placeholder="Buscar painel ou evento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loadingPanels ? (
                    <div className="glass-effect p-6 rounded-2xl text-slate-500">Carregando painéis...</div>
                ) : filteredPanels.length > 0 ? (
                    filteredPanels.map((panel, index) => (
                        <motion.div
                            key={panel.id}
                            className="glass-effect p-6 rounded-2xl"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="flex justify-between items-start mb-4 gap-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{panel.name}</h3>
                                    <p className="text-sm text-slate-500">{panel.local || 'Sem local informado'}</p>
                                    {panel.ip_address && (
                                        <p className="text-xs text-slate-500 mt-1">IP: {panel.ip_address}</p>
                                    )}
                                </div>

                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPanelBadge(panel.status)}`}>
                                    {panel.status === 'armed'
                                        ? 'Armado'
                                        : panel.status === 'maintenance'
                                            ? 'Manutenção'
                                            : 'Desarmado'}
                                </span>
                            </div>

                            {panel.observacoes && (
                                <p className="text-xs text-slate-500 mb-4">{panel.observacoes}</p>
                            )}

                            <div className="flex gap-2 flex-wrap">
                                <Button
                                    className="flex-1"
                                    variant={panel.status === 'armed' ? 'outline' : 'default'}
                                    onClick={() => toggleArm(panel)}
                                >
                                    {panel.status === 'armed' ? (
                                        <ShieldOff className="w-4 h-4 mr-2" />
                                    ) : (
                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                    )}
                                    {panel.status === 'armed' ? 'Desarmar' : 'Armar'}
                                </Button>

                                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => triggerPanic(panel)}>
                                    <Siren className="w-4 h-4 mr-2" />
                                    Pânico
                                </Button>

                                <Button variant="outline" size="icon" onClick={() => openEditModal(panel)}>
                                    <Edit className="w-4 h-4" />
                                </Button>

                                <Button variant="destructive" size="icon" onClick={() => handleDeletePanel(panel.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="glass-effect p-6 rounded-2xl text-slate-500 text-center">
                        Nenhum painel encontrado.
                    </div>
                )}
            </div>

            <div className="lg:col-span-2">
                <h2 className="text-2xl font-semibold text-slate-800 mb-6">Log de Eventos (Contact ID)</h2>

                <div className="glass-effect p-4 rounded-2xl h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center py-20 text-slate-500">Carregando eventos...</div>
                        ) : filteredEvents.length > 0 ? (
                            filteredEvents.map((event) => (
                                <motion.div
                                    key={event.id}
                                    className={`flex items-center gap-4 p-3 rounded-lg ${getStatusColor(event.status)}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    layout
                                >
                                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white">
                                        {event.status === 'alarme' ? (
                                            <AlertTriangle className="w-6 h-6 text-red-500" />
                                        ) : (
                                            <Bell className="w-6 h-6 text-slate-500" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-bold">
                                            {event.panel_name}: {event.description}
                                        </p>
                                        <p className="text-sm">
                                            Código: {event.code} | Zona: {event.zone || '000'}
                                        </p>
                                    </div>

                                    <p className="text-sm font-medium whitespace-nowrap">
                                        {event.event_at
                                            ? new Date(event.event_at).toLocaleTimeString('pt-BR')
                                            : '-'}
                                    </p>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20">
                                <List className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                                <p className="text-slate-500">Aguardando eventos da central de alarme...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {panelForm.id ? 'Editar Painel' : 'Novo Painel'}
                            </h2>

                            <Button variant="ghost" size="icon" onClick={closeModal}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSavePanel} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={panelForm.name}
                                    onChange={(e) => setPanelForm({ ...panelForm, name: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <select
                                    value={panelForm.status}
                                    onChange={(e) => setPanelForm({ ...panelForm, status: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                >
                                    <option value="armed">Armado</option>
                                    <option value="disarmed">Desarmado</option>
                                    <option value="maintenance">Manutenção</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Local</label>
                                <input
                                    type="text"
                                    value={panelForm.local}
                                    onChange={(e) => setPanelForm({ ...panelForm, local: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">IP / Host</label>
                                <input
                                    type="text"
                                    value={panelForm.ip_address}
                                    onChange={(e) => setPanelForm({ ...panelForm, ip_address: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                                <textarea
                                    rows={3}
                                    value={panelForm.observacoes}
                                    onChange={(e) => setPanelForm({ ...panelForm, observacoes: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={closeModal}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white">
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AlarmesTab;