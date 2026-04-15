import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Car,
    Power,
    PowerOff,
    Plus,
    Edit,
    Trash2,
    Search,
    X,
    MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const initialForm = {
    id: '',
    name: '',
    plate: '',
    latitude: -23.5505,
    longitude: -46.6333,
    status: 'active',
    speed: 0,
    observacoes: '',
};

const formatDateTime = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('pt-BR');
};

const RastreamentoTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: vehicles,
        loading,
        fetchAll,
        create,
        update,
        remove,
        setData: setVehicles,
    } = useSupabaseCrud('seguranca_vehicles');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (user) {
            fetchAll(1, 1000);
        }
    }, [user, fetchAll]);

    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            const updates = [];

            setVehicles((prevVehicles) => {
                const nextVehicles = prevVehicles.map((vehicle) => {
                    if (vehicle.status === 'active') {
                        const updatedVehicle = {
                            ...vehicle,
                            latitude: Number((Number(vehicle.latitude || 0) + (Math.random() - 0.5) * 0.001).toFixed(6)),
                            longitude: Number((Number(vehicle.longitude || 0) + (Math.random() - 0.5) * 0.001).toFixed(6)),
                            speed: Number(Math.max(0, Number(vehicle.speed || 0) + (Math.random() - 0.5) * 10).toFixed(2)),
                            data_hora: new Date().toISOString(),
                        };

                        updates.push(updatedVehicle);
                        return updatedVehicle;
                    }

                    return vehicle;
                });

                return nextVehicles;
            });

            if (updates.length > 0) {
                Promise.all(
                    updates.map((vehicle) =>
                        supabase
                            .from('seguranca_vehicles')
                            .update({
                                latitude: vehicle.latitude,
                                longitude: vehicle.longitude,
                                speed: vehicle.speed,
                                data_hora: vehicle.data_hora,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', vehicle.id)
                            .eq('user_id', user.id)
                    )
                ).catch((err) => {
                    console.error('Erro ao sincronizar rastreamento:', err);
                });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [user, setVehicles]);

    const filteredVehicles = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return [...vehicles].filter((vehicle) => {
            return (
                (vehicle.name || '').toLowerCase().includes(term) ||
                (vehicle.plate || '').toLowerCase().includes(term) ||
                (vehicle.status || '').toLowerCase().includes(term)
            );
        });
    }, [vehicles, searchTerm]);

    const summary = useMemo(() => {
        return {
            total: vehicles.length,
            ativos: vehicles.filter((v) => v.status === 'active').length,
            inativos: vehicles.filter((v) => v.status === 'inactive').length,
        };
    }, [vehicles]);

    const openCreateModal = () => {
        setFormData(initialForm);
        setIsModalOpen(true);
    };

    const openEditModal = (vehicle) => {
        setFormData({
            id: vehicle.id,
            name: vehicle.name || '',
            plate: vehicle.plate || '',
            latitude: Number(vehicle.latitude || 0),
            longitude: Number(vehicle.longitude || 0),
            status: vehicle.status || 'active',
            speed: Number(vehicle.speed || 0),
            observacoes: vehicle.observacoes || '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setFormData(initialForm);
        setIsModalOpen(false);
    };

    const toggleTracker = async (vehicleId) => {
        const vehicle = vehicles.find((v) => v.id === vehicleId);
        if (!vehicle || !user) return;

        const newStatus = vehicle.status === 'active' ? 'inactive' : 'active';
        const newSpeed = newStatus === 'inactive' ? 0 : Number(vehicle.speed || 0);

        const { data, error } = await supabase
            .from('seguranca_vehicles')
            .update({
                status: newStatus,
                speed: newSpeed,
                data_hora: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', vehicleId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error || !data) {
            toast({
                title: 'Erro',
                description: error?.message || 'Não foi possível alterar o rastreador.',
                variant: 'destructive',
            });
            return;
        }

        setVehicles((prev) => prev.map((item) => (item.id === vehicleId ? data : item)));

        toast({
            title: `Rastreador ${newStatus === 'active' ? 'Ativado' : 'Desativado'}`,
            description: `O rastreador do veículo "${vehicle.name}" foi ${newStatus === 'active' ? 'ativado' : 'desativado'}.`,
        });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Deseja realmente excluir este veículo?');
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

        if (!formData.name.trim() || !formData.plate.trim()) {
            toast({
                title: 'Erro',
                description: 'Preencha o nome e a placa do veículo.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            name: formData.name.trim(),
            plate: formData.plate.trim().toUpperCase(),
            latitude: Number(formData.latitude || 0),
            longitude: Number(formData.longitude || 0),
            status: formData.status || 'active',
            speed: Number(formData.speed || 0),
            data_hora: new Date().toISOString(),
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-sm text-slate-500 mb-1">Veículos monitorados</div>
                    <div className="text-2xl font-bold text-slate-800">{summary.total}</div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-sm text-slate-500 mb-1">Rastreadores ativos</div>
                    <div className="text-2xl font-bold text-green-700">{summary.ativos}</div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-sm text-slate-500 mb-1">Rastreadores inativos</div>
                    <div className="text-2xl font-bold text-red-700">{summary.inativos}</div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Rastreamento de Veículos</h2>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            className="w-full pl-10 pr-3 py-2 border rounded-lg"
                            placeholder="Buscar veículo ou placa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Button onClick={openCreateModal} className="bg-slate-900 hover:bg-slate-800 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo veículo
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                            <tr>
                                <th className="p-4">Veículo</th>
                                <th className="p-4">Placa</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Velocidade</th>
                                <th className="p-4">Localização (Lat / Lng)</th>
                                <th className="p-4">Última Atualização</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        Carregando veículos...
                                    </td>
                                </tr>
                            ) : filteredVehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        Nenhum veículo encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredVehicles.map((vehicle) => (
                                    <motion.tr
                                        key={vehicle.id}
                                        className="hover:bg-slate-50 transition-colors"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        layout
                                    >
                                        <td className="p-4">
                                            <div className="flex items-start gap-3">
                                                <Car className={`w-5 h-5 mt-0.5 ${vehicle.status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
                                                <div>
                                                    <div className="font-semibold text-slate-800">{vehicle.name}</div>
                                                    {vehicle.observacoes && (
                                                        <div className="text-xs text-slate-500 mt-1">{vehicle.observacoes}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 font-mono text-slate-600">{vehicle.plate}</td>

                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${vehicle.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : vehicle.status === 'maintenance'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {vehicle.status === 'active'
                                                    ? 'Ativo'
                                                    : vehicle.status === 'maintenance'
                                                        ? 'Manutenção'
                                                        : 'Inativo'}
                                            </span>
                                        </td>

                                        <td className="p-4 font-semibold text-slate-700">
                                            {Math.round(Number(vehicle.speed || 0))} km/h
                                        </td>

                                        <td className="p-4 font-mono text-xs text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3" />
                                                {Number(vehicle.latitude || 0).toFixed(6)}, {Number(vehicle.longitude || 0).toFixed(6)}
                                            </div>
                                        </td>

                                        <td className="p-4 text-slate-500">
                                            {formatDateTime(vehicle.data_hora)}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={vehicle.status === 'active' ? 'destructive' : 'outline'}
                                                    onClick={() => toggleTracker(vehicle.id)}
                                                >
                                                    {vehicle.status === 'active' ? (
                                                        <PowerOff className="w-4 h-4 mr-2" />
                                                    ) : (
                                                        <Power className="w-4 h-4 mr-2 text-green-600" />
                                                    )}
                                                    {vehicle.status === 'active' ? 'Desativar' : 'Ativar'}
                                                </Button>

                                                <Button variant="outline" size="icon" onClick={() => openEditModal(vehicle)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>

                                                <Button variant="destructive" size="icon" onClick={() => handleDelete(vehicle.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {formData.id ? 'Editar veículo' : 'Novo veículo'}
                            </h2>

                            <Button variant="ghost" size="icon" onClick={closeModal}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-3 border rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Placa</label>
                                    <input
                                        type="text"
                                        value={formData.plate}
                                        onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                                        className="w-full p-3 border rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        className="w-full p-3 border rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
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
                                        <option value="active">Ativo</option>
                                        <option value="inactive">Inativo</option>
                                        <option value="maintenance">Manutenção</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Velocidade inicial</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.speed}
                                        onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                                        className="w-full p-3 border rounded-lg"
                                    />
                                </div>
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

export default RastreamentoTab;