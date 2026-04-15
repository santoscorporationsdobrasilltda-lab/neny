import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Save, SprayCan } from 'lucide-react';

const DefensivosModal = ({ lavoura, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().slice(0, 10),
        productName: '',
        quantity: '',
        unit: 'L',
        reason: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="glass-effect rounded-2xl p-8 w-full max-w-lg" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-6">
                    <SprayCan className="w-7 h-7 text-orange-500" />
                    <h2 className="text-2xl font-bold gradient-text">Registro de Defensivos Agrícolas</h2>
                </div>
                <p className="text-slate-600 mb-6">Lavoura: <span className="font-bold">{lavoura.crop}</span></p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Data da Aplicação</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nome do Produto</label>
                            <input type="text" name="productName" value={formData.productName} onChange={handleChange} className="input-field" required placeholder="Ex: Herbicida X" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Quantidade Aplicada</label>
                            <input type="number" name="quantity" step="0.01" value={formData.quantity} onChange={handleChange} className="input-field" required placeholder="Ex: 5.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Unidade</label>
                            <select name="unit" value={formData.unit} onChange={handleChange} className="input-field">
                                <option value="L">Litros (L)</option>
                                <option value="Kg">Quilogramas (Kg)</option>
                                <option value="mL">Mililitros (mL)</option>
                                <option value="g">Gramas (g)</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Motivo/Praga Alvo</label>
                        <input type="text" name="reason" value={formData.reason} onChange={handleChange} className="input-field" required placeholder="Ex: Controle de ervas daninhas" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" onClick={onClose} variant="outline" className="btn-secondary">Cancelar</Button>
                        <Button type="submit" className="btn-primary"><Save className="w-4 h-4 mr-2" />Salvar Registro</Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default DefensivosModal;