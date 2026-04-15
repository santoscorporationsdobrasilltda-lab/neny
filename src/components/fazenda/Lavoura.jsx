import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Paperclip, SprayCan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import FazendaModal from '@/components/fazenda/FazendaModal';
import DefensivosModal from '@/components/fazenda/DefensivosModal';

const Lavoura = () => {
  const { toast } = useToast();
  const [lavouras, setLavouras] = useLocalStorage('fazenda_lavouras', []);
  const [defensivos, setDefensivos] = useLocalStorage('fazenda_defensivos', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDefensivosModalOpen, setIsDefensivosModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedLavoura, setSelectedLavoura] = useState(null);
  
  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  
  const handleOpenDefensivosModal = (lavoura) => {
    setSelectedLavoura(lavoura);
    setIsDefensivosModalOpen(true);
  };
  
  const handleSaveDefensivo = (data) => {
    setDefensivos([...defensivos, { id: uuidv4(), lavouraId: selectedLavoura.id, ...data }]);
    toast({ title: '✅ Defensivo Registrado', description: 'O registro de aplicação foi salvo.' });
    setIsDefensivosModalOpen(false);
  };

  const handleSave = (itemData) => {
    if (editingItem) {
      setLavouras(lavouras.map(l => l.id === editingItem.id ? { ...l, ...itemData } : l));
      toast({ title: "✅ Safra Atualizada" });
    } else {
      setLavouras([...lavouras, { id: uuidv4(), attachments: [], ...itemData }]);
      toast({ title: "✅ Nova Safra Cadastrada" });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setLavouras(lavouras.filter(l => l.id !== id));
    toast({ title: "🗑️ Safra Removida" });
  };
  
  const handleFileUpload = (lavouraId, files) => {
    const fileArray = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file), 
      id: uuidv4()
    }));
    setLavouras(lavouras.map(l => {
      if(l.id === lavouraId) {
        return { ...l, attachments: [...(l.attachments || []), ...fileArray] };
      }
      return l;
    }));
    toast({ title: "📎 Anexos Adicionados", description: `${files.length} arquivo(s) foram anexados à safra.` });
  };
  
  const fields = [
    { name: 'crop', label: 'Cultura', type: 'text' },
    { name: 'hectares', label: 'Hectares Plantados', type: 'number' },
    { name: 'plantingDate', label: 'Data de Plantio', type: 'date' },
    { name: 'harvestDate', label: 'Previsão de Colheita', type: 'date' },
    { name: 'status', label: 'Status', type: 'text' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestão de Lavouras</h2>
        <Button onClick={() => handleOpenModal()} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Nova Safra</Button>
      </div>
      <div className="glass-effect rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="th-cell">Cultura</th>
                <th className="th-cell">Hectares</th>
                <th className="th-cell">Data de Plantio</th>
                <th className="th-cell">Previsão Colheita</th>
                <th className="th-cell">Status</th>
                <th className="th-cell">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lavouras.map(lavoura => (
                <React.Fragment key={lavoura.id}>
                  <tr className="table-row">
                    <td className="td-cell font-semibold">{lavoura.crop}</td>
                    <td className="td-cell">{lavoura.hectares}</td>
                    <td className="td-cell">{lavoura.plantingDate}</td>
                    <td className="td-cell">{lavoura.harvestDate}</td>
                    <td className="td-cell"><span className="status-badge status-info">{lavoura.status}</span></td>
                    <td className="td-cell">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="relative">
                          <Paperclip className="w-4 h-4" />
                          <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(lavoura.id, e.target.files)} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDefensivosModal(lavoura)}><SprayCan className="w-4 h-4 text-orange-500" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(lavoura)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(lavoura.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                  {lavoura.attachments && lavoura.attachments.length > 0 && (
                    <tr className="bg-slate-50">
                      <td colSpan="6" className="p-3">
                        <div className="flex items-center gap-3">
                            <p className="font-semibold text-sm">Anexos:</p>
                            {lavoura.attachments.map(file => (
                                <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                                    <Paperclip size={14}/> {file.name}
                                </a>
                            ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && <FazendaModal item={editingItem} onSave={handleSave} onClose={() => setIsModalOpen(false)} fields={fields} title="Safra" type="safra" />}
      {isDefensivosModalOpen && <DefensivosModal lavoura={selectedLavoura} onSave={handleSaveDefensivo} onClose={() => setIsDefensivosModalOpen(false)} />}
    </motion.div>
  );
};

export default Lavoura;