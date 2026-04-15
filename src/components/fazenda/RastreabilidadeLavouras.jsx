import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Bug, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import RastreabilidadeModal from '@/components/fazenda/RastreabilidadeModal';

const RastreabilidadeLavouras = () => {
    const { toast } = useToast();
    const [eventos, setEventos] = useLocalStorage('fazenda_eventos_lavouras', []);
    const [lavouras] = useLocalStorage('fazenda_lavouras', []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSave = (itemData) => {
        if (editingItem) {
            setEventos(eventos.map(e => e.id === editingItem.id ? { ...e, ...itemData } : e));
            toast({ title: "✅ Evento Atualizado", description: "O registro de sanidade da lavoura foi atualizado." });
        } else {
            setEventos([...eventos, { id: uuidv4(), ...itemData }]);
            toast({ title: "✅ Novo Evento Registrado", description: "O registro de sanidade da lavoura foi adicionado." });
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        setEventos(eventos.filter(e => e.id !== id));
        toast({ title: "🗑️ Evento Removido", description: "O registro de sanidade da lavoura foi removido." });
    };

    const getLavouraName = (lavouraId) => {
        const lavoura = lavouras.find(l => l.id === lavouraId);
        return lavoura ? `${lavoura.crop} (Hectares: ${lavoura.hectares})` : 'Lavoura não encontrada';
    };

    const fields = [
        { name: 'lavouraId', label: 'Lavoura/Safra', type: 'select', options: lavouras.map(l => ({ value: l.id, label: `${l.crop} - Plantio: ${l.plantingDate}` })) },
        { name: 'eventType', label: 'Tipo de Evento', type: 'select', options: [{value: 'Controle de Pragas/Doenças', label: 'Controle de Pragas/Doenças'}, {value: 'Visita do Agrônomo', label: 'Visita do Agrônomo'}] },
        { name: 'date', label: 'Data', type: 'date' },
        { name: 'product', label: 'Produto Aplicado/Motivo', type: 'text' },
        { name: 'professional', label: 'Profissional Responsável', type: 'text' },
        { name: 'details', label: 'Detalhes/Recomendações', type: 'textarea' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Bug /> Sanidade da Lavoura</h2>
                <Button onClick={() => handleOpenModal()} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Novo Registro</Button>
            </div>
            <div className="glass-effect rounded-2xl p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="th-cell">Data</th>
                                <th className="th-cell">Lavoura</th>
                                <th className="th-cell">Tipo</th>
                                <th className="th-cell">Produto/Motivo</th>
                                <th className="th-cell">Profissional</th>
                                <th className="th-cell">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventos.sort((a, b) => new Date(b.date) - new Date(a.date)).map(evento => (
                                <tr key={evento.id} className="table-row">
                                    <td className="td-cell">{new Date(evento.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                    <td className="td-cell font-semibold">{getLavouraName(evento.lavouraId)}</td>
                                    <td className="td-cell">
                                        <span className={`status-badge ${evento.eventType === 'Visita do Agrônomo' ? 'status-success' : 'status-warning'}`}>
                                            {evento.eventType}
                                        </span>
                                    </td>
                                    <td className="td-cell">{evento.product}</td>
                                    <td className="td-cell">{evento.professional}</td>
                                    <td className="td-cell">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(evento)}><Edit className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(evento.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <RastreabilidadeModal item={editingItem} onSave={handleSave} onClose={() => setIsModalOpen(false)} fields={fields} title="Registro de Sanidade da Lavoura" />}
        </motion.div>
    );
};

export default RastreabilidadeLavouras;