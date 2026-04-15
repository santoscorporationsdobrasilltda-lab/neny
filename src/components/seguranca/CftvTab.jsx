import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Plus, Trash2, Edit, Server, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const CameraPlaceholder = ({ camera }) => (
    <motion.div
        className="relative w-full h-full bg-black rounded-lg overflow-hidden group"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        layout
    >
        <div className="w-full h-full flex items-center justify-center">
            <Video className="w-1/3 h-1/3 text-slate-700" />
        </div>

        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white font-bold text-center px-2">{camera.name}</p>
        </div>

        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {camera.name}
        </div>

        <div className="absolute top-2 right-2 text-white text-xs px-2 py-1 rounded flex items-center gap-1 bg-black/40">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span>LIVE</span>
        </div>
    </motion.div>
);

const initialForm = {
    id: '',
    nome: '',
    endereco_ip: '',
    protocolo: 'RTSP',
    canais: 16,
    status: 'Ativo',
    observacoes: '',
};

const CftvTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: equipamentos,
        loading,
        fetchAll,
        create,
        update,
        remove,
    } = useSupabaseCrud('seguranca_cftv_equipamentos');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gridLayout, setGridLayout] = useState(16);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState(initialForm);

    const gridOptions = [1, 4, 8, 16, 32, 45, 60];

    useEffect(() => {
        if (user) {
            fetchAll(1, 1000);
        }
    }, [user, fetchAll]);

    const filteredEquipamentos = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...equipamentos].filter((item) => {
            return (
                (item.nome || '').toLowerCase().includes(term) ||
                (item.endereco_ip || '').toLowerCase().includes(term) ||
                (item.protocolo || '').toLowerCase().includes(term) ||
                (item.status || '').toLowerCase().includes(term)
            );
        });
    }, [equipamentos, searchTerm]);

    const cameras = useMemo(() => {
        const allCameras = [];

        filteredEquipamentos.forEach((equipamento) => {
            const totalCanais = Number(equipamento.canais || 16);

            for (let i = 1; i <= totalCanais; i += 1) {
                allCameras.push({
                    id: `${equipamento.id}-${i}`,
                    name: `${equipamento.nome} - CAM ${i}`,
                });
            }
        });

        return allCameras;
    }, [filteredEquipamentos]);

    const gridClasses = {
        1: 'grid-cols-1',
        4: 'grid-cols-2',
        8: 'grid-cols-4',
        16: 'grid-cols-4',
        32: 'grid-cols-8',
        45: 'grid-cols-9',
        60: 'grid-cols-10',
    };

    const gridHeight = {
        1: 'h-[80vh]',
        4: 'h-[40vh]',
        8: 'h-[40vh]',
        16: 'h-[20vh]',
        32: 'h-[20vh]',
        45: 'h-[15vh]',
        60: 'h-[15vh]',
    };

    const openCreateModal = () => {
        setFormData(initialForm);
        setIsModalOpen(true);
    };

    const openEditModal = (equipamento) => {
        setFormData({
            id: equipamento.id,
            nome: equipamento.nome || '',
            endereco_ip: equipamento.endereco_ip || '',
            protocolo: equipamento.protocolo || 'RTSP',
            canais: Number(equipamento.canais || 16),
            status: equipamento.status || 'Ativo',
            observacoes: equipamento.observacoes || '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setFormData(initialForm);
        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Deseja realmente excluir este equipamento?');
        if (!confirmed) return;

        const success = await remove(id);
        if (success) {
            await fetchAll(1, 1000);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!formData.nome.trim() || !formData.endereco_ip.trim()) {
            toast({
                title: 'Erro',
                description: 'Preencha o nome e o endereço IP/host do equipamento.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            nome: formData.nome.trim(),
            endereco_ip: formData.endereco_ip.trim(),
            protocolo: formData.protocolo || 'RTSP',
            canais: Number(formData.canais || 16),
            status: formData.status || 'Ativo',
            observacoes: formData.observacoes?.trim() || null,
            updated_at: new Date().toISOString(),
        };

        const saved = formData.id
            ? await update(formData.id, payload)
            : await create(payload);

        if (saved) {
            await fetchAll(1, 1000);
            closeModal();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <h2 className="text-2xl font-semibold text-slate-800">Mosaico de Câmeras</h2>

                        <div className="flex items-center gap-2 flex-wrap">
                            {gridOptions.map((opt) => (
                                <Button
                                    key={opt}
                                    variant={gridLayout === opt ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setGridLayout(opt)}
                                    className="w-10 h-10"
                                >
                                    {opt}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            className="w-full pl-10 pr-3 py-2 border rounded-lg"
                            placeholder="Buscar equipamento por nome, IP ou protocolo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Button onClick={openCreateModal} className="bg-slate-900 hover:bg-slate-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Equipamento
                </Button>
            </div>

            <motion.div
                className={`grid ${gridClasses[gridLayout] || 'grid-cols-4'} gap-2 transition-all duration-300`}
                layout
            >
                {cameras.slice(0, gridLayout).map((cam) => (
                    <div key={cam.id} className={gridHeight[gridLayout] || 'h-[20vh]'}>
                        <CameraPlaceholder camera={cam} />
                    </div>
                ))}
            </motion.div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <h3 className="text-xl font-semibold text-slate-800">Equipamentos Cadastrados</h3>
                    <span className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded border">
                        Total: {filteredEquipamentos.length}
                    </span>
                </div>

                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-8 text-slate-500">Carregando equipamentos...</div>
                    ) : filteredEquipamentos.length > 0 ? (
                        filteredEquipamentos.map((eq) => (
                            <div
                                key={eq.id}
                                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-50 p-4 rounded-lg border"
                            >
                                <div className="flex items-start gap-4">
                                    <Server className="w-6 h-6 text-blue-600 mt-1" />
                                    <div>
                                        <p className="font-bold text-slate-800">{eq.nome}</p>
                                        <p className="text-sm text-slate-600">
                                            {eq.endereco_ip} • {eq.protocolo} • {eq.canais} canais
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Status: {eq.status || 'Ativo'}
                                        </p>
                                        {eq.observacoes && (
                                            <p className="text-xs text-slate-500 mt-1">{eq.observacoes}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" onClick={() => openEditModal(eq)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>

                                    <Button variant="destructive" size="icon" onClick={() => handleDelete(eq.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-center py-8">Nenhum equipamento cadastrado.</p>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {formData.id ? 'Editar Equipamento' : 'Adicionar Equipamento'}
                            </h2>

                            <Button variant="ghost" size="icon" onClick={closeModal}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Endereço IP / Host
                                </label>
                                <input
                                    type="text"
                                    value={formData.endereco_ip}
                                    onChange={(e) => setFormData({ ...formData, endereco_ip: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Protocolo</label>
                                <select
                                    value={formData.protocolo}
                                    onChange={(e) => setFormData({ ...formData, protocolo: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                >
                                    <option value="RTSP">RTSP</option>
                                    <option value="RTMP">RTMP</option>
                                    <option value="ONVIF">ONVIF</option>
                                    <option value="HTTP">HTTP</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Nº de Canais
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="300"
                                    value={formData.canais}
                                    onChange={(e) => setFormData({ ...formData, canais: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                >
                                    <option value="Ativo">Ativo</option>
                                    <option value="Inativo">Inativo</option>
                                    <option value="Manutenção">Manutenção</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                                <textarea
                                    rows={3}
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                    className="w-full p-3 border rounded-lg"
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={closeModal}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white">
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default CftvTab;