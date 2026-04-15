import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import FazendaModal from '@/components/fazenda/FazendaModal';

const Suino = () => {
  const { toast } = useToast();
  const [suinos, setSuinos] = useLocalStorage('fazenda_suinos', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState('animal');

  const handleOpenModal = (item = null, type = 'animal') => {
    setEditingItem(item);
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSave = (itemData) => {
    if (editingItem) {
      setSuinos(suinos.map(s => s.id === editingItem.id ? { ...s, ...itemData } : s));
      toast({ title: "✅ Registro Atualizado" });
    } else {
      setSuinos([...suinos, { id: uuidv4(), ...itemData, serialNumber: `SU-${uuidv4().slice(0,8).toUpperCase()}` }]);
      toast({ title: "✅ Suíno Cadastrado" });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setSuinos(suinos.filter(s => s.id !== id));
    toast({ title: "🗑️ Suíno Removido" });
  };

  const fields = [
    { name: 'name', label: 'Identificação', type: 'text' },
    { name: 'lote', label: 'Lote', type: 'text' },
    { name: 'birthDate', label: 'Data de Nascimento', type: 'date' },
    { name: 'weight', label: 'Peso (kg)', type: 'number' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Suínos</h2>
        <Button onClick={() => handleOpenModal(null, 'animal')} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Adicionar Suíno</Button>
      </div>
      <div className="glass-effect rounded-2xl p-6">
        <p className="text-center text-slate-500 p-8">Módulo de Suínos em construção. Funcionalidades de cadastro e relatórios serão adicionadas em breve.</p>
      </div>
       {isModalOpen && <FazendaModal item={editingItem} onSave={handleSave} onClose={() => setIsModalOpen(false)} fields={fields} title="Suíno" type={modalType} />}
    </motion.div>
  );
};

export default Suino;