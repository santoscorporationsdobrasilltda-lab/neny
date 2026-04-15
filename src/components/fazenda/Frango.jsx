import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import FazendaModal from '@/components/fazenda/FazendaModal';

const Frango = () => {
  const { toast } = useToast();
  const [frangos, setFrangos] = useLocalStorage('fazenda_frangos', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = (itemData) => {
    if (editingItem) {
      setFrangos(frangos.map(f => f.id === editingItem.id ? { ...f, ...itemData } : f));
      toast({ title: "✅ Lote Atualizado" });
    } else {
      setFrangos([...frangos, { id: uuidv4(), ...itemData }]);
      toast({ title: "✅ Lote de Frangos Cadastrado" });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setFrangos(frangos.filter(f => f.id !== id));
    toast({ title: "🗑️ Lote Removido" });
  };

  const fields = [
    { name: 'lote', label: 'Lote', type: 'text' },
    { name: 'quantity', label: 'Quantidade', type: 'number' },
    { name: 'arrivalDate', label: 'Data de Chegada', type: 'date' },
    { name: 'lineage', label: 'Linhagem', type: 'text' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Frangos (Lotes)</h2>
        <Button onClick={() => handleOpenModal()} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Adicionar Lote</Button>
      </div>
      <div className="glass-effect rounded-2xl p-6">
        <p className="text-center text-slate-500 p-8">Módulo de Frangos em construção. Funcionalidades de cadastro e relatórios serão adicionadas em breve.</p>
      </div>
      {isModalOpen && <FazendaModal item={editingItem} onSave={handleSave} onClose={() => setIsModalOpen(false)} fields={fields} title="Lote de Frangos" type="lote" />}
    </motion.div>
  );
};

export default Frango;