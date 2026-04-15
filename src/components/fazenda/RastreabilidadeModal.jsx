import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

const RastreabilidadeModal = ({ item, onSave, onClose, fields, title }) => {
  const [formData, setFormData] = useState(() => {
    const initialData = {};
    fields.forEach(field => {
      initialData[field.name] = item?.[field.name] || (field.type === 'select' ? (field.options[0]?.value || '') : '');
    });
    if (!item) {
        initialData['date'] = new Date().toISOString().slice(0, 10);
    }
    return initialData;
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
      <div className="glass-effect rounded-2xl p-8 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold gradient-text mb-6">{item ? 'Editar' : 'Novo'} {title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.filter(f => f.type !== 'textarea').map(field => (
              <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-slate-700 mb-2">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="" disabled>Selecione...</option>
                    {field.options.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                )}
              </div>
            ))}
          </div>
          {fields.filter(f => f.type === 'textarea').map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-slate-700 mb-2">{field.label}</label>
              <textarea
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="input-field min-h-[100px]"
                rows="4"
              ></textarea>
            </div>
          ))}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="btn-secondary">Cancelar</Button>
            <Button type="submit" className="btn-primary"><Save className="w-4 h-4 mr-2" />Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RastreabilidadeModal;