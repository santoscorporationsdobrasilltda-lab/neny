import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Trash2, Edit, Save, Plus, X } from 'lucide-react';
import { useEffect } from 'react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const AgendaEscalasTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const { data: schedule, fetchAll: fetchSchedule, create: createSchedule, update: updateSchedule, remove: removeSchedule } =
        useSupabaseCrud('ordem_servicos_agenda');

    const { data: techs, fetchAll: fetchTechs } =
        useSupabaseCrud('ordem_servicos_tecnicos');

    const { data: orders, fetchAll: fetchOrders } =
        useSupabaseCrud('ordem_servicos_ordens');
    
    const [isEditing, setIsEditing] = useState(false);
    
    const initialForm = {
        tecnicoId: '', tecnicoNome: '', data: new Date().toISOString().split('T')[0],
        horario: '08:00', osId: '', status: 'Programada'
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (user) {
            fetchSchedule();
            fetchTechs();
            fetchOrders();
        }
    }, [user, fetchSchedule, fetchTechs, fetchOrders]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.tecnicoId || !formData.data) return;

        const payload = {
            user_id: user.id,
            tecnico_id: formData.tecnicoId,
            data: formData.data,
            horario: formData.horario,
            ordem_id: formData.osId || null,
            status: formData.status || 'Programada',
        };

        try {
            if (formData.id) {
                await updateSchedule(formData.id, payload);
                toast({ title: "Agendamento atualizado" });
            } else {
                await createSchedule(payload);
                toast({ title: "Novo agendamento criado" });
            }

            await fetchSchedule();
            setIsEditing(false);
            setFormData(initialForm);
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar agendamento." });
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Remover agendamento?')) {
            try {
                await removeSchedule(id);
                await fetchSchedule();
                toast({ title: "Agendamento removido" });
            } catch (error) {
                toast({ variant: "destructive", title: "Erro", description: "Falha ao remover agendamento." });
            }
        }
    };

    // Group by Date then Technician for display
    const sortedSchedule = [...schedule].sort((a, b) => 
        new Date(a.data + 'T' + a.horario) - new Date(b.data + 'T' + b.horario)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-600" /> Agenda de Técnicos
                </h2>
                <Button onClick={() => { setFormData(initialForm); setIsEditing(true); }} className="bg-[#3b82f6] text-white">
                    <Plus className="w-4 h-4 mr-2"/> Novo Agendamento
                </Button>
            </div>

            {isEditing && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mb-6 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-bold text-slate-700">Detalhes do Agendamento</h3>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}><X className="w-4 h-4"/></Button>
                    </div>
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Técnico</label>
                            <select 
                                className="w-full p-2 border rounded"
                                value={formData.tecnicoId}
                                onChange={e => {
                                    const t = techs.find(tc => tc.id === e.target.value);
                                    setFormData({...formData, tecnicoId: e.target.value, tecnicoNome: t ? t.nome : ''});
                                }}
                                required
                            >
                                <option value="">Selecione...</option>
                                {techs.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                            </select>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium mb-1 block">Data</label>
                            <input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} className="w-full p-2 border rounded" required />
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium mb-1 block">Horário</label>
                            <input type="time" value={formData.horario} onChange={e => setFormData({...formData, horario: e.target.value})} className="w-full p-2 border rounded" required />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Vincular OS (Opcional)</label>
                            <select 
                                className="w-full p-2 border rounded"
                                value={formData.osId}
                                onChange={e => setFormData({...formData, osId: e.target.value})}
                            >
                                <option value="">Nenhuma / Avulso</option>
                                {orders
                                    .filter(o => o.status !== 'Concluída' && o.status !== 'Cancelada')
                                    .map(o => (
                                        <option key={o.id} value={o.id}>
                                            OS #{o.id.slice(0, 6)} - {o.cliente}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Status</label>
                            <select 
                                className="w-full p-2 border rounded"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="Programada">Programada</option>
                                <option value="Em Atendimento">Em Atendimento</option>
                                <option value="Finalizada">Finalizada</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                        </div>

                        <div className="md:col-span-3 flex justify-end gap-2 mt-2">
                             <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-[#3b82f6] text-white">Salvar</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                        <tr>
                            <th className="p-4">Data/Hora</th>
                            <th className="p-4">Técnico</th>
                            <th className="p-4">Vínculo</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedSchedule.length === 0 ? (
                             <tr><td colSpan="5" className="p-8 text-center text-slate-500">Nenhum agendamento encontrado.</td></tr>
                        ) : (
                            sortedSchedule.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="font-medium text-slate-700">{new Date(item.data).toLocaleDateString()}</div>
                                        <div className="text-xs text-slate-500">{item.horario}</div>
                                    </td>
                                    <td className="p-4 font-bold text-slate-700">
                                        {techs.find(t => t.id === item.tecnico_id)?.nome || '-'}
                                    </td>
                                    <td className="p-4">
                                        {item.ordem_id ? (
                                            <span className="text-blue-600 font-mono text-xs bg-blue-50 px-2 py-1 rounded">
                                                OS #{item.ordem_id.slice(0, 6)}
                                            </span>
                                        ) : <span className="text-slate-400 text-xs">Avulso</span>}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${item.status === 'Programada' ? 'bg-blue-100 text-blue-700' : 
                                              item.status === 'Finalizada' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-1">
                                        <Button size="sm" variant="ghost"
                                            onClick={() => {
                                                setFormData({
                                                    id: item.id,
                                                    tecnicoId: item.tecnico_id || '',
                                                    tecnicoNome: techs.find(t => t.id === item.tecnico_id)?.nome || '',
                                                    data: item.data || new Date().toISOString().split('T')[0],
                                                    horario: item.horario || '08:00',
                                                    osId: item.ordem_id || '',
                                                    status: item.status || 'Programada'
                                                });
                                                setIsEditing(true);
                                            }}
                                        ><Edit className="w-4 h-4 text-blue-600" /></Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-red-600"/></Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgendaEscalasTab;