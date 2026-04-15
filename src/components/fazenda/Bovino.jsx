import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, QrCode, Syringe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import FazendaModal from '@/components/fazenda/FazendaModal';

const Bovino = () => {
  const { toast } = useToast();
  const [bovinos, setBovinos] = useLocalStorage('fazenda_bovinos', []);
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
      setBovinos(bovinos.map(b => b.id === editingItem.id ? { ...b, ...itemData } : b));
      toast({ title: "✅ Registro Atualizado", description: "O registro do animal foi atualizado." });
    } else {
      setBovinos([...bovinos, { id: uuidv4(), ...itemData, serialNumber: `BR-${uuidv4().slice(0,8).toUpperCase()}` }]);
      toast({ title: "✅ Animal Cadastrado", description: "Novo bovino adicionado ao rebanho." });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setBovinos(bovinos.filter(b => b.id !== id));
    toast({ title: "🗑️ Animal Removido", description: "O registro do animal foi removido." });
  };

  const fields = [
    { name: 'name', label: 'Nome/Identificação', type: 'text' },
    { name: 'lote', label: 'Lote', type: 'text' },
    { name: 'breed', label: 'Raça', type: 'text' },
    { name: 'birthDate', label: 'Data de Nascimento', type: 'date' },
    { name: 'weight', label: 'Peso (kg)', type: 'number' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Bovinos</h2>
        <Button onClick={() => handleOpenModal(null, 'animal')} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Adicionar Animal</Button>
      </div>
      <div className="glass-effect rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="th-cell">Série</th>
                <th className="th-cell">Nome</th>
                <th className="th-cell">Lote</th>
                <th className="th-cell">Raça</th>
                <th className="th-cell">Idade</th>
                <th className="th-cell">Peso (kg)</th>
                <th className="th-cell">Ações</th>
              </tr>
            </thead>
            <tbody>
              {bovinos.map(bovino => (
                <tr key={bovino.id} className="table-row">
                  <td className="td-cell font-mono text-xs">{bovino.serialNumber}</td>
                  <td className="td-cell font-semibold">{bovino.name}</td>
                  <td className="td-cell">{bovino.lote}</td>
                  <td className="td-cell">{bovino.breed}</td>
                  <td className="td-cell">{bovino.birthDate}</td>
                  <td className="td-cell">{bovino.weight}</td>
                  <td className="td-cell">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(bovino, 'qr')}><QrCode className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(bovino, 'animal')}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(bovino.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && <FazendaModal item={editingItem} onSave={handleSave} onClose={() => setIsModalOpen(false)} fields={fields} title="Bovino" type={modalType} />}
    </motion.div>
  );
};

export default Bovino;