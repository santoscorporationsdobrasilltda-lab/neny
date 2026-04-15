import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, QrCode, Download, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const normalizeEquipment = (row) => ({
    id: row.id,
    name: row.name || '',
    serialNumber: row.serial_number || row.serialNumber || '',
    model: row.model || '',
});

const EquipmentModal = ({ equipment, onSave, onClose, saving = false }) => {
    const [name, setName] = useState(equipment?.name || '');
    const [serialNumber, setSerialNumber] = useState(equipment?.serialNumber || '');
    const [model, setModel] = useState(equipment?.model || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, serialNumber, model });
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="glass-effect rounded-2xl p-8 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold gradient-text mb-6">
                    {equipment ? 'Editar' : 'Novo'} Equipamento
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Nome do Equipamento"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Número de Série"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        className="input-field"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Modelo"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="input-field"
                    />

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" onClick={onClose} variant="outline" className="btn-secondary">
                            Cancelar
                        </Button>
                        <Button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const QRCodeModal = ({ equipment, onClose }) => {
    const qrCodeRef = useRef(null);

    const downloadQRCode = () => {
        const svg = qrCodeRef.current?.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${(equipment.name || 'equipamento').replace(/\s+/g, '_')}_qrcode.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="glass-effect rounded-2xl p-8 w-full max-w-sm text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold gradient-text mb-4">{equipment.name}</h2>
                <p className="text-slate-600 mb-6">S/N: {equipment.serialNumber}</p>

                <div className="bg-white p-4 rounded-lg inline-block" ref={qrCodeRef}>
                    <QRCode
                        value={JSON.stringify({
                            type: 'equipamento',
                            id: equipment.id,
                            name: equipment.name,
                            serialNumber: equipment.serialNumber,
                            model: equipment.model || '',
                            url: `${window.location.origin}/ordem-servicos?equipamento=${equipment.id}`,
                        })}
                        size={256}
                        level="H"
                        includeMargin
                    />
                </div>

                <div className="mt-6 flex gap-4 justify-center">
                    <Button onClick={downloadQRCode} className="btn-primary">
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                    </Button>
                    <Button onClick={onClose} variant="outline" className="btn-secondary">
                        Fechar
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

const EquipamentosTab = ({ equipments: controlledEquipments, setEquipments: controlledSetEquipments }) => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: dbEquipments = [],
        loading,
        fetchAll,
        create,
        update,
        remove,
    } = useSupabaseCrud('ordem_servicos_equipamentos');

    const [localEquipments, setLocalEquipments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [selectedEquipmentForQr, setSelectedEquipmentForQr] = useState(null);
    const [saving, setSaving] = useState(false);

    const isControlled = Array.isArray(controlledEquipments) && typeof controlledSetEquipments === 'function';

    useEffect(() => {
        if (!isControlled && user) {
            fetchAll(1, 1000);
        }
    }, [isControlled, user, fetchAll]);

    useEffect(() => {
        if (!isControlled) {
            setLocalEquipments((dbEquipments || []).map(normalizeEquipment));
        }
    }, [dbEquipments, isControlled]);

    const equipments = useMemo(() => {
        if (isControlled) {
            return Array.isArray(controlledEquipments) ? controlledEquipments : [];
        }
        return Array.isArray(localEquipments) ? localEquipments : [];
    }, [isControlled, controlledEquipments, localEquipments]);

    const setEquipments = (next) => {
        if (isControlled) {
            controlledSetEquipments(next);
        } else {
            setLocalEquipments(next);
        }
    };

    const handleOpenModal = (equipment = null) => {
        setEditingEquipment(equipment);
        setIsModalOpen(true);
    };

    const handleOpenQrModal = (equipment) => {
        setSelectedEquipmentForQr(equipment);
        setIsQrModalOpen(true);
    };

    const handleSave = async (data) => {
        try {
            setSaving(true);

            if (isControlled) {
                if (editingEquipment) {
                    setEquipments(
                        equipments.map((e) => (e.id === editingEquipment.id ? { ...e, ...data } : e))
                    );
                    toast({
                        title: '✅ Equipamento atualizado',
                        description: 'Os dados do equipamento foram atualizados.',
                    });
                } else {
                    setEquipments([...equipments, { id: uuidv4(), ...data }]);
                    toast({
                        title: '✅ Equipamento adicionado',
                        description: 'Novo equipamento cadastrado com sucesso.',
                    });
                }
            } else {
                const payload = {
                    user_id: user?.id,
                    name: data.name,
                    serial_number: data.serialNumber,
                    model: data.model || null,
                    updated_at: new Date().toISOString(),
                };

                if (editingEquipment) {
                    const result = await update(editingEquipment.id, payload);
                    if (!result) throw new Error('Não foi possível atualizar o equipamento.');

                    toast({
                        title: '✅ Equipamento atualizado',
                        description: 'Os dados do equipamento foram atualizados.',
                    });
                } else {
                    const result = await create(payload);
                    if (!result) throw new Error('Não foi possível cadastrar o equipamento.');

                    toast({
                        title: '✅ Equipamento adicionado',
                        description: 'Novo equipamento cadastrado com sucesso.',
                    });
                }

                await fetchAll(1, 1000);
            }

            setIsModalOpen(false);
            setEditingEquipment(null);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro ao salvar equipamento',
                description: error?.message || 'Não foi possível salvar o equipamento.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            if (isControlled) {
                setEquipments(equipments.filter((e) => e.id !== id));
            } else {
                const result = await remove(id);
                if (!result) throw new Error('Não foi possível remover o equipamento.');
                await fetchAll(1, 1000);
            }

            toast({
                title: '🗑️ Equipamento removido',
                description: 'O equipamento foi removido do cadastro.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro ao remover equipamento',
                description: error?.message || 'Não foi possível remover o equipamento.',
                variant: 'destructive',
            });
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-blue-600" />
                    Gerenciar Equipamentos
                </h3>
                <Button onClick={() => handleOpenModal()} className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Equipamento
                </Button>
            </div>

            <div className="glass-effect rounded-2xl p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="th-cell">Nome</th>
                                <th className="th-cell">Nº de Série</th>
                                <th className="th-cell">Modelo</th>
                                <th className="th-cell">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-slate-500">
                                        Carregando equipamentos...
                                    </td>
                                </tr>
                            ) : equipments.length > 0 ? (
                                equipments.map((eq) => (
                                    <tr key={eq.id} className="table-row">
                                        <td className="td-cell font-medium text-slate-900">{eq.name}</td>
                                        <td className="td-cell text-slate-600">{eq.serialNumber}</td>
                                        <td className="td-cell text-slate-600">{eq.model || '-'}</td>
                                        <td className="td-cell">
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenQrModal(eq)}>
                                                    <QrCode className="w-4 h-4 text-purple-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(eq)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(eq.id)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-slate-500">
                                        Nenhum equipamento cadastrado ainda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <EquipmentModal
                    equipment={editingEquipment}
                    onSave={handleSave}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingEquipment(null);
                    }}
                    saving={saving}
                />
            )}

            {isQrModalOpen && selectedEquipmentForQr && (
                <QRCodeModal
                    equipment={selectedEquipmentForQr}
                    onClose={() => {
                        setIsQrModalOpen(false);
                        setSelectedEquipmentForQr(null);
                    }}
                />
            )}
        </motion.div>
    );
};

export default EquipamentosTab;