import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const PlanoContasForm = ({ account, parentAccounts, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: account?.id || uuidv4(),
    codigo: account?.codigo || '',
    nome: account?.nome || '',
    tipo: account?.tipo || 'analitica', // sintetica ou analitica
    natureza: account?.natureza || 'devedora', // devedora ou credora
    contaPaiId: account?.contaPaiId || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-effect rounded-2xl p-8 w-full max-w-lg" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold gradient-text">{account ? 'Editar' : 'Nova'} Conta Contábil</h2>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="w-5 h-5"/></Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label">Código da Conta</label>
                <input value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} className="input-field" placeholder="Ex: 1.1.1.01" required />
            </div>
            <div>
                <label className="label">Nome da Conta</label>
                <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="input-field" required />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Tipo</label>
                    <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="input-field">
                        <option value="sintetica">Sintética (Grupo)</option>
                        <option value="analitica">Analítica (Lançamentos)</option>
                    </select>
                </div>
                 <div>
                    <label className="label">Natureza</label>
                    <select value={formData.natureza} onChange={e => setFormData({...formData, natureza: e.target.value})} className="input-field">
                        <option value="devedora">Devedora (Ativo/Despesa)</option>
                        <option value="credora">Credora (Passivo/Receita)</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="label">Conta Pai (Grupo Superior)</label>
                <select value={formData.contaPaiId} onChange={e => setFormData({...formData, contaPaiId: e.target.value})} className="input-field">
                    <option value="">Raiz (Nenhuma)</option>
                    {parentAccounts?.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.codigo} - {acc.nome}</option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end gap-3 pt-6">
                <Button type="button" variant="outline" onClick={onClose} className="btn-secondary">Cancelar</Button>
                <Button type="submit" className="btn-primary"><Save className="w-4 h-4 mr-2"/> Salvar Conta</Button>
            </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PlanoContasForm;