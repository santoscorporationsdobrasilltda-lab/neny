import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Save, Droplets, AlertTriangle, Edit, Search, X } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const LeituraAguaTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: readings,
        fetchAll: fetchReadings,
        create,
        update,
        remove,
    } = useSupabaseCrud('piscicultura40_leituras_agua');

    const {
        data: tanques,
        fetchAll: fetchTanques,
    } = useSupabaseCrud('piscicultura40_tanques');

    const {
        data: sensores,
        fetchAll: fetchSensores,
    } = useSupabaseCrud('piscicultura40_sensores');

    const [filteredSensores, setFilteredSensores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const initialForm = {
        id: '',
        dataHora: new Date().toISOString().slice(0, 16),
        tanqueId: '',
        tanqueNome: '',
        sensorId: '',
        sensorNome: '',
        od: '',
        ph: '',
        temp: '',
        amonia: '',
        condutividade: '',
        turbidez: '',
        observacoes: '',
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (user) {
            fetchReadings();
            fetchTanques();
            fetchSensores();
        }
    }, [user, fetchReadings, fetchTanques, fetchSensores]);

    useEffect(() => {
        if (!formData.tanqueId) {
            setFilteredSensores([]);
            return;
        }

        const relevant = sensores.filter((s) => s.tanque_id === formData.tanqueId);
        setFilteredSensores(relevant);
    }, [formData.tanqueId, sensores]);

    const resetForm = () => {
        setFormData({
            ...initialForm,
            dataHora: new Date().toISOString().slice(0, 16),
        });
        setFilteredSensores([]);
        setIsEditing(false);
    };

    const calculateStatus = (data) => {
        let status = 'Normal';

        const od = parseFloat(data.od);
        const ph = parseFloat(data.ph);
        const temp = parseFloat(data.temperatura ?? data.temp);
        const amonia = parseFloat(data.amonia);

        if (!Number.isNaN(od)) {
            if (od < 3.0) status = 'Crítico';
            else if (od < 5.0) status = 'Alerta';
        }

        if (!Number.isNaN(ph)) {
            if (ph < 6.0 || ph > 9.0) status = 'Crítico';
        }

        if (!Number.isNaN(temp)) {
            if (temp < 20 || temp > 32) {
                status = status === 'Crítico' ? 'Crítico' : 'Alerta';
            }
        }

        if (!Number.isNaN(amonia)) {
            if (amonia > 1.0) status = 'Crítico';
        }

        return status;
    };

    const handleTanqueChange = (e) => {
        const id = e.target.value;
        const tanque = tanques.find((item) => item.id === id);

        setFormData((prev) => ({
            ...prev,
            tanqueId: id,
            tanqueNome: tanque ? tanque.codigo : '',
            sensorId: '',
            sensorNome: '',
        }));
    };

    const handleSensorChange = (e) => {
        const id = e.target.value;
        const sensor = sensores.find((item) => item.id === id);

        setFormData((prev) => ({
            ...prev,
            sensorId: id,
            sensorNome: sensor ? `${sensor.tipo_sensor} (${sensor.codigo_integracao})` : '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!formData.tanqueId) {
            toast({
                title: 'Erro',
                description: 'Selecione o tanque.',
                variant: 'destructive',
            });
            return;
        }

        const status = calculateStatus({
            od: formData.od,
            ph: formData.ph,
            temp: formData.temp,
            amonia: formData.amonia,
        });

        const payload = {
            user_id: user.id,
            tanque_id: formData.tanqueId,
            sensor_id: formData.sensorId || null,
            data_hora: formData.dataHora ? new Date(formData.dataHora).toISOString() : null,
            od: formData.od ? Number(formData.od) : null,
            ph: formData.ph ? Number(formData.ph) : null,
            temperatura: formData.temp ? Number(formData.temp) : null,
            amonia: formData.amonia ? Number(formData.amonia) : null,
            condutividade: formData.condutividade ? Number(formData.condutividade) : null,
            turbidez: formData.turbidez ? Number(formData.turbidez) : null,
            observacoes: formData.observacoes || null,
            alerta: status !== 'Normal',
        };

        try {
            if (formData.id) {
                await update(formData.id, payload);
                toast({
                    title: 'Sucesso',
                    description: `Leitura atualizada. Status: ${status}`,
                    variant: status === 'Normal' ? 'default' : 'destructive',
                });
            } else {
                await create(payload);
                toast({
                    title: 'Leitura registrada',
                    description: `Status: ${status}`,
                    variant: status === 'Normal' ? 'default' : 'destructive',
                });
            }

            await fetchReadings();
            resetForm();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao salvar leitura da água.',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir leitura?')) return;

        try {
            await remove(id);
            await fetchReadings();
            toast({
                title: 'Sucesso',
                description: 'Leitura removida.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao excluir leitura.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (item) => {
        const tanque = tanques.find((t) => t.id === item.tanque_id);
        const sensor = sensores.find((s) => s.id === item.sensor_id);

        setFormData({
            id: item.id,
            dataHora: item.data_hora ? new Date(item.data_hora).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
            tanqueId: item.tanque_id || '',
            tanqueNome: tanque ? tanque.codigo : '',
            sensorId: item.sensor_id || '',
            sensorNome: sensor ? `${sensor.tipo_sensor} (${sensor.codigo_integracao})` : '',
            od: item.od ?? '',
            ph: item.ph ?? '',
            temp: item.temperatura ?? '',
            amonia: item.amonia ?? '',
            condutividade: item.condutividade ?? '',
            turbidez: item.turbidez ?? '',
            observacoes: item.observacoes || '',
        });

        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const orderedReadings = useMemo(() => {
        const ordered = [...readings].sort((a, b) => {
            const da = a.data_hora ? new Date(a.data_hora).getTime() : 0;
            const db = b.data_hora ? new Date(b.data_hora).getTime() : 0;
            return db - da;
        });

        return ordered.filter((item) => {
            const tanque = tanques.find((t) => t.id === item.tanque_id);
            const sensor = sensores.find((s) => s.id === item.sensor_id);
            const tanqueNome = tanque ? tanque.codigo : '';
            const sensorNome = sensor ? `${sensor.tipo_sensor} ${sensor.codigo_integracao}` : 'manual';
            const status = calculateStatus(item);
            const term = searchTerm.toLowerCase();

            return (
                tanqueNome.toLowerCase().includes(term) ||
                sensorNome.toLowerCase().includes(term) ||
                status.toLowerCase().includes(term)
            );
        });
    }, [readings, tanques, sensores, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-600" />
                        {isEditing ? 'Editar Leitura da Água' : 'Registro de Qualidade da Água'}
                    </h2>

                    {isEditing && (
                        <Button variant="ghost" onClick={resetForm} size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        className="p-2 border rounded"
                        type="datetime-local"
                        value={formData.dataHora}
                        onChange={(e) => setFormData({ ...formData, dataHora: e.target.value })}
                        required
                    />

                    <select
                        className="p-2 border rounded"
                        value={formData.tanqueId}
                        onChange={handleTanqueChange}
                        required
                    >
                        <option value="">Selecione o Tanque...</option>
                        {tanques.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.codigo}
                            </option>
                        ))}
                    </select>

                    <select
                        className="p-2 border rounded"
                        value={formData.sensorId}
                        onChange={handleSensorChange}
                    >
                        <option value="">Sensor (Opcional)...</option>
                        {filteredSensores.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.tipo_sensor} - {s.codigo_integracao}
                            </option>
                        ))}
                    </select>

                    <input
                        className="p-2 border rounded"
                        placeholder="Observações"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        type="number"
                        step="0.1"
                        placeholder="OD (mg/L)"
                        value={formData.od}
                        onChange={(e) => setFormData({ ...formData, od: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        type="number"
                        step="0.1"
                        placeholder="pH"
                        value={formData.ph}
                        onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        type="number"
                        step="0.1"
                        placeholder="Temp (°C)"
                        value={formData.temp}
                        onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        type="number"
                        step="0.01"
                        placeholder="Amônia (mg/L)"
                        value={formData.amonia}
                        onChange={(e) => setFormData({ ...formData, amonia: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        type="number"
                        step="0.01"
                        placeholder="Condutividade"
                        value={formData.condutividade}
                        onChange={(e) => setFormData({ ...formData, condutividade: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        type="number"
                        step="0.01"
                        placeholder="Turbidez"
                        value={formData.turbidez}
                        onChange={(e) => setFormData({ ...formData, turbidez: e.target.value })}
                    />

                    <div className="md:col-span-2" />

                    <div className="md:col-span-4 flex justify-end">
                        <Button type="submit" className="bg-[#1e3a8a] text-white">
                            <Save className="w-4 h-4 mr-2" />
                            {isEditing ? 'Atualizar Leitura' : 'Salvar Leitura'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <h3 className="font-semibold text-slate-700">
                        Leituras Registradas ({orderedReadings.length})
                    </h3>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                            placeholder="Buscar tanque, sensor, status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="p-4">Data/Hora</th>
                                <th className="p-4">Tanque</th>
                                <th className="p-4">Sensor/Origem</th>
                                <th className="p-4">OD</th>
                                <th className="p-4">pH</th>
                                <th className="p-4">Temp</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {orderedReadings.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500">
                                        Nenhuma leitura registrada.
                                    </td>
                                </tr>
                            ) : (
                                orderedReadings.map((item) => {
                                    const tanque = tanques.find((t) => t.id === item.tanque_id);
                                    const sensor = sensores.find((s) => s.id === item.sensor_id);
                                    const status = calculateStatus(item);

                                    return (
                                        <tr
                                            key={item.id}
                                            className={`hover:bg-slate-50 ${status === 'Crítico'
                                                    ? 'bg-red-50'
                                                    : status === 'Alerta'
                                                        ? 'bg-orange-50'
                                                        : ''
                                                }`}
                                        >
                                            <td className="p-4 text-slate-500">
                                                {item.data_hora ? new Date(item.data_hora).toLocaleString() : '-'}
                                            </td>
                                            <td className="p-4 font-bold text-slate-700">
                                                {tanque ? tanque.codigo : 'Tanque não encontrado'}
                                            </td>
                                            <td className="p-4 text-xs">
                                                {sensor ? `${sensor.tipo_sensor} (${sensor.codigo_integracao})` : 'Manual'}
                                            </td>
                                            <td className="p-4">{item.od ?? '-'}</td>
                                            <td className="p-4">{item.ph ?? '-'}</td>
                                            <td className="p-4">{item.temperatura ?? '-'}{item.temperatura ? '°C' : ''}</td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${status === 'Normal'
                                                            ? 'bg-green-100 text-green-700'
                                                            : status === 'Alerta'
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {status !== 'Normal' && <AlertTriangle className="w-3 h-3" />}
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right space-x-1">
                                                <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeituraAguaTab;