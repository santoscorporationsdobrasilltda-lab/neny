import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const PisciculturaModal = ({ config, onSave, onClose, tanks }) => {
    const { type, data } = config;

    const initialFormState = () => {
        const today = new Date().toISOString().slice(0, 10);
        switch (type) {
            case 'tank': return { id: data?.id, name: data?.name || '', species: data?.species || '', quantity: data?.quantity || 0, initialDate: data?.initialDate || today };
            case 'water': return { id: data?.id, tankId: data?.tankId || '', ph: data?.ph || 7.0, ammonia: data?.ammonia || 0, nitrate: data?.nitrate || 0, temperature: data?.temperature || 28, date: data?.date || today };
            case 'feeding': return { id: data?.id, tankId: data?.tankId || '', feedAmount: data?.feedAmount || 0, proteinPercentage: data?.proteinPercentage || 32, frequency: data?.frequency || '2x/dia', date: data?.date || today };
            case 'biometry': return { id: data?.id, tankId: data?.tankId || '', avgWeight: data?.avgWeight || 0, avgLength: data?.avgLength || 0, sampleSize: data?.sampleSize || 0, date: data?.date || today };
            case 'harvest': return { id: data?.id, tankId: data?.tankId || '', totalWeight: data?.totalWeight || 0, totalQuantity: data?.totalQuantity || 0, avgPriceKg: data?.avgPriceKg || 0, date: data?.date || today };
            case 'sale': return { id: data?.id, harvestId: data?.harvestId || '', client: data?.client || '', product: data?.product || '', quantityKg: data?.quantityKg || 0, totalValue: data?.totalValue || 0, date: data?.date || today };
            default: return {};
        }
    };
    
    const [formData, setFormData] = useState(initialFormState());

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(type, formData);
    };

    const renderFormFields = () => {
        switch (type) {
            case 'tank': return <>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Nome do Tanque</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Espécie</label><input type="text" name="species" value={formData.species} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Quantidade Inicial</label><input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Data de Início</label><input type="date" name="initialDate" value={formData.initialDate} onChange={handleChange} className="input-field" required /></div>
            </>;
            case 'water': return <>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Tanque</label><select name="tankId" value={formData.tankId} onChange={handleChange} className="input-field" required><option value="">Selecione</option>{tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">pH</label><input type="number" step="0.1" name="ph" value={formData.ph} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Amônia (mg/L)</label><input type="number" step="0.01" name="ammonia" value={formData.ammonia} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Nitrato (mg/L)</label><input type="number" step="0.01" name="nitrate" value={formData.nitrate} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Temperatura (°C)</label><input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Data</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" required /></div>
            </>;
            case 'feeding': return <>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Tanque</label><select name="tankId" value={formData.tankId} onChange={handleChange} className="input-field" required><option value="">Selecione</option>{tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Ração (kg)</label><input type="number" step="0.1" name="feedAmount" value={formData.feedAmount} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Proteína (%)</label><input type="number" name="proteinPercentage" value={formData.proteinPercentage} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Frequência</label><input type="text" name="frequency" value={formData.frequency} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Data</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" required /></div>
            </>;
            case 'biometry': return <>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Tanque</label><select name="tankId" value={formData.tankId} onChange={handleChange} className="input-field" required><option value="">Selecione</option>{tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Peso Médio (g)</label><input type="number" name="avgWeight" value={formData.avgWeight} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Comprimento Médio (cm)</label><input type="number" step="0.1" name="avgLength" value={formData.avgLength} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Tamanho da Amostra</label><input type="number" name="sampleSize" value={formData.sampleSize} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Data</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" required /></div>
            </>;
            case 'harvest': return <>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Tanque</label><select name="tankId" value={formData.tankId} onChange={handleChange} className="input-field" required><option value="">Selecione</option>{tanks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Peso Total (kg)</label><input type="number" step="0.1" name="totalWeight" value={formData.totalWeight} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Quantidade Total (unidades)</label><input type="number" name="totalQuantity" value={formData.totalQuantity} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Preço Médio (R$/kg)</label><input type="number" step="0.01" name="avgPriceKg" value={formData.avgPriceKg} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Data</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" required /></div>
            </>;
            case 'sale': return <>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Cliente</label><input type="text" name="client" value={formData.client} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Produto</label><input type="text" name="product" value={formData.product} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Quantidade (kg)</label><input type="number" step="0.1" name="quantityKg" value={formData.quantityKg} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Valor Total (R$)</label><input type="number" step="0.01" name="totalValue" value={formData.totalValue} onChange={handleChange} className="input-field" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Data</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" required /></div>
            </>;
            default: return <p>Formulário não implementado para este tipo.</p>;
        }
    };

    const titleMap = {
        tank: 'Tanque', water: 'Análise de Água', feeding: 'Alimentação',
        biometry: 'Biometria', harvest: 'Despesca', sale: 'Venda'
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="glass-effect rounded-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold gradient-text mb-6">{data ? 'Editar' : 'Novo(a)'} {titleMap[type]}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderFormFields()}
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" onClick={onClose} variant="outline" className="btn-secondary">Cancelar</Button>
                        <Button type="submit" className="btn-primary">Salvar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PisciculturaModal;