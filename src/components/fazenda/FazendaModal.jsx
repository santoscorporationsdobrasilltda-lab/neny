import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QRCodeSVG as QRCode } from 'qrcode.react';

const FazendaModal = ({ item, onSave, onClose, fields, title, type }) => {
  const [formData, setFormData] = useState(() => {
    const initialData = {};
    fields.forEach(field => {
      initialData[field.name] = item?.[field.name] || '';
    });
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

  if (type === 'qr') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="glass-effect rounded-2xl p-8 w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
          <h2 className="text-2xl font-bold gradient-text mb-4">QR Code de Rastreabilidade</h2>
          <p className="text-slate-600 mb-2">Animal: <span className="font-bold">{item.name}</span></p>
          <p className="text-slate-600 mb-6">Série: <span className="font-bold font-mono">{item.serialNumber}</span></p>
          <div className="bg-white p-4 rounded-lg inline-block">
            <QRCode value={JSON.stringify({ id: item.id, serialNumber: item.serialNumber, name: item.name })} size={256} />
          </div>
          <Button onClick={onClose} className="btn-primary mt-8 w-full">Fechar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-effect rounded-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold gradient-text mb-6">{item ? 'Editar' : 'Novo'} {title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-slate-700 mb-2">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          ))}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="btn-secondary">Cancelar</Button>
            <Button type="submit" className="btn-primary">Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FazendaModal;