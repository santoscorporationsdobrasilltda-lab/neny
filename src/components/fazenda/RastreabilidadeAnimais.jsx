import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Syringe, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import RastreabilidadeModal from '@/components/fazenda/RastreabilidadeModal';

const RastreabilidadeAnimais = () => {
    const { toast } = useToast();
    const [eventos, setEventos] = useLocalStorage('fazenda_eventos_animais', []);
    const [bovinos] = useLocalStorage('fazenda_bovinos', []);
    const [suinos] = useLocalStorage('fazenda_suinos', []);
    const [frangos] = useLocalStorage('fazenda_frangos', []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const allAnimals = [
        ...bovinos.map(a => ({ id: a.id, name: `${a.name} (Bovino - ${a.serialNumber})` })),
        ...suinos.map(a => ({ id: a.id, name: `${a.name} (Suíno - ${a.serialNumber})` })),
        ...frangos.map(a => ({ id: a.id, name: `Lote ${a.lote} (Frango)` })),
    ];

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSave = (itemData) => {
        if (editingItem) {
            setEventos(eventos.map(e => e.id === editingItem.id ? { ...e, ...itemData } : e));
            toast({ title: "✅ Evento Atualizado", description: "O registro de sanidade foi atualizado." });
        } else {
            setEventos([...eventos, { id: uuidv4(), ...itemData }]);
            toast({ title: "✅ Novo Evento Registrado", description: "O registro de sanidade foi adicionado." });
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        setEventos(eventos.filter(e => e.id !== id));
        toast({ title: "🗑️ Evento Removido", description: "O registro de sanidade foi removido." });
    };

    const getAnimalName = (animalId) => {
        const animal = allAnimals.find(a => a.id === animalId);
        return animal ? animal.name : 'Animal não encontrado';
    };

    const fields = [
        { name: 'animalId', label: 'Animal/Lote', type: 'select', options: allAnimals.map(a => ({ value: a.id, label: a.name })) },
        { name: 'eventType', label: 'Tipo de Evento', type: 'select', options: [{value: 'Vacinação', label: 'Vacinação'}, {value: 'Visita Veterinária', label: 'Visita Veterinária'}] },
        { name: 'date', label: 'Data', type: 'date' },
        { name: 'product', label: 'Produto/Motivo', type: 'text' },
        { name: 'professional', label: 'Profissional Responsável', type: 'text' },
        { name: 'details', label: 'Detalhes/Observações', type: 'textarea' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Stethoscope /> Sanidade Animal</h2>
                <Button onClick={() => handleOpenModal()} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Novo Registro</Button>
            </div>
            <div className="glass-effect rounded-2xl p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="th-cell">Data</th>
                                <th className="th-cell">Animal/Lote</th>
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
                                    <td className="td-cell font-semibold">{getAnimalName(evento.animalId)}</td>
                                    <td className="td-cell">
                                        <span className={`status-badge ${evento.eventType === 'Vacinação' ? 'status-info' : 'status-warning'}`}>
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
            {isModalOpen && <RastreabilidadeModal item={editingItem} onSave={handleSave} onClose={() => setIsModalOpen(false)} fields={fields} title="Registro de Sanidade Animal" />}
        </motion.div>
    );
};

export default RastreabilidadeAnimais;