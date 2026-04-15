import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Save, Radio, X, Search } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const SensoresTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: sensores,
        fetchAll: fetchSensores,
        create,
        update,
        remove,
    } = useSupabaseCrud('piscicultura40_sensores');

    const {
        data: tanques,
        fetchAll: fetchTanques,
    } = useSupabaseCrud('piscicultura40_tanques');

    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const initialForm = {
        id: '',
        tanqueId: '',
        tanqueNome: '',
        tipo: 'Oxigênio Dissolvido',
        fabricante: '',
        codigoIntegracao: '',
        status: 'Ativo',
        endpoint: '',
        apiKey: '',
        mqttTopic: '',
        interval: '60',
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (user) {
            fetchSensores();
            fetchTanques();
        }
    }, [user, fetchSensores, fetchTanques]);

    const resetForm = () => {
        setFormData(initialForm);
        setIsEditing(false);
    };

    const handleTanqueChange = (e) => {
        const id = e.target.value;
        const tanque = tanques.find((item) => item.id === id);

        setFormData((prev) => ({
            ...prev,
            tanqueId: id,
            tanqueNome: tanque ? tanque.codigo : '',
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

        if (!formData.tanqueId || !formData.codigoIntegracao) {
            toast({
                title: 'Erro',
                description: 'Tanque e código de integração são obrigatórios.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            tanque_id: formData.tanqueId,
            tipo_sensor: formData.tipo || null,
            fabricante: formData.fabricante || null,
            modelo: null,
            codigo_integracao: formData.codigoIntegracao,
            status: formData.status || 'Ativo',
            endpoint: formData.endpoint || null,
            api_key: formData.apiKey || null,
            mqtt_topic: formData.mqttTopic || null,
            intervalo_segundos: formData.interval ? Number(formData.interval) : null,
        };

        try {
            if (formData.id) {
                await update(formData.id, payload);
                toast({
                    title: 'Sucesso',
                    description: 'Sensor atualizado.',
                });
            } else {
                await create(payload);
                toast({
                    title: 'Sucesso',
                    description: 'Sensor cadastrado.',
                });
            }

            await fetchSensores();
            resetForm();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao salvar sensor.',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir sensor?')) return;

        try {
            await remove(id);
            await fetchSensores();
            toast({
                title: 'Sucesso',
                description: 'Sensor removido.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao excluir sensor.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (item) => {
        const tanque = tanques.find((t) => t.id === item.tanque_id);

        setFormData({
            id: item.id,
            tanqueId: item.tanque_id || '',
            tanqueNome: tanque ? tanque.codigo : '',
            tipo: item.tipo_sensor || 'Oxigênio Dissolvido',
            fabricante: item.fabricante || '',
            codigoIntegracao: item.codigo_integracao || '',
            status: item.status || 'Ativo',
            endpoint: item.endpoint || '',
            apiKey: item.api_key || '',
            mqttTopic: item.mqtt_topic || '',
            interval: item.intervalo_segundos ?? '60',
        });

        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredSensores = useMemo(() => {
        return sensores.filter((item) => {
            const tanque = tanques.find((t) => t.id === item.tanque_id);
            const tanqueNome = tanque ? tanque.codigo : '';
            const term = searchTerm.toLowerCase();

            return (
                (item.codigo_integracao || '').toLowerCase().includes(term) ||
                tanqueNome.toLowerCase().includes(term) ||
                (item.tipo_sensor || '').toLowerCase().includes(term) ||
                (item.fabricante || '').toLowerCase().includes(term) ||
                (item.status || '').toLowerCase().includes(term)
            );
        });
    }, [sensores, tanques, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isEditing ? 'Editar Sensor IoT' : 'Novo Sensor IoT'}
                    </h2>

                    {isEditing && (
                        <Button variant="ghost" onClick={resetForm} size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        className="p-2 border rounded"
                        value={formData.tanqueId}
                        onChange={handleTanqueChange}
                        required
                    >
                        <option value="">Vincular ao Tanque...</option>
                        {tanques.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.codigo} ({t.especie})
                            </option>
                        ))}
                    </select>

                    <select
                        className="p-2 border rounded"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    >
                        <option value="Oxigênio Dissolvido">Oxigênio Dissolvido (OD)</option>
                        <option value="pH">pH</option>
                        <option value="Temperatura">Temperatura</option>
                        <option value="Amônia">Amônia</option>
                        <option value="Condutividade">Condutividade</option>
                        <option value="Turbidez">Turbidez</option>
                        <option value="Multiparamétrico">Multiparamétrico</option>
                    </select>

                    <input
                        className="p-2 border rounded"
                        placeholder="Fabricante / Modelo"
                        value={formData.fabricante}
                        onChange={(e) => setFormData({ ...formData, fabricante: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        placeholder="Código Integração (ID Hardware)"
                        value={formData.codigoIntegracao}
                        onChange={(e) => setFormData({ ...formData, codigoIntegracao: e.target.value })}
                        required
                    />

                    <select
                        className="p-2 border rounded"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Manutenção">Manutenção</option>
                    </select>

                    <div className="md:col-span-3 border-t border-slate-100 pt-4 mt-2">
                        <p className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                            <Radio className="w-4 h-4" />
                            Configuração de Telemetria (Opcional)
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                className="p-2 border rounded"
                                placeholder="API Endpoint URL"
                                value={formData.endpoint}
                                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                            />

                            <input
                                className="p-2 border rounded"
                                type="password"
                                placeholder="API Key / Token"
                                value={formData.apiKey}
                                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Tópico MQTT"
                                value={formData.mqttTopic}
                                onChange={(e) => setFormData({ ...formData, mqttTopic: e.target.value })}
                            />

                            <input
                                className="p-2 border rounded"
                                type="number"
                                placeholder="Intervalo Polling (seg)"
                                value={formData.interval}
                                onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-3 flex justify-end mt-2">
                        <Button type="submit" className="bg-[#1e3a8a] text-white">
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Sensor
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <h3 className="font-semibold text-slate-700">
                        Sensores Cadastrados ({filteredSensores.length})
                    </h3>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                            placeholder="Buscar sensor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                        <tr>
                            <th className="p-4">ID Hardware</th>
                            <th className="p-4">Tanque</th>
                            <th className="p-4">Tipo Sensor</th>
                            <th className="p-4">Fabricante</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {filteredSensores.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-500">
                                    Nenhum sensor cadastrado.
                                </td>
                            </tr>
                        ) : (
                            filteredSensores.map((item) => {
                                const tanque = tanques.find((t) => t.id === item.tanque_id);
                                const tanqueNome = tanque ? tanque.codigo : 'Tanque não encontrado';

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-mono text-xs">{item.codigo_integracao}</td>
                                        <td className="p-4 font-bold text-slate-700">{tanqueNome}</td>
                                        <td className="p-4">{item.tipo_sensor}</td>
                                        <td className="p-4">{item.fabricante}</td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Ativo'
                                                        ? 'bg-green-100 text-green-700'
                                                        : item.status === 'Manutenção'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {item.status}
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
    );
};

export default SensoresTab;