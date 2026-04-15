import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Save, Plus, Search, X, Video } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CamerasConfigTab = () => {
    const { toast } = useToast();
    const [devices, setDevices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    
    const initialFormState = {
        nome: '', tipo: 'Camera IP', ipHost: '', porta: '554', 
        rtmpKey: '', username: '', password: '', localidade: '', status: 'Ativo'
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        const stored = localStorage.getItem('seguranca_dispositivos');
        if (stored) setDevices(JSON.parse(stored));
    }, []);

    const saveToStorage = (data) => {
        localStorage.setItem('seguranca_dispositivos', JSON.stringify(data));
        setDevices(data);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nome || !formData.ipHost) {
            toast({ title: 'Erro', description: 'Nome e Host são obrigatórios', variant: 'destructive' });
            return;
        }

        let updatedList;
        if (formData.id) {
            updatedList = devices.map(d => d.id === formData.id ? formData : d);
            toast({ title: 'Sucesso', description: 'Dispositivo atualizado.' });
        } else {
            updatedList = [...devices, { ...formData, id: uuidv4() }];
            toast({ title: 'Sucesso', description: 'Dispositivo cadastrado.' });
        }
        saveToStorage(updatedList);
        resetForm();
    };

    const handleDelete = (id) => {
        if (confirm('Excluir dispositivo?')) {
            saveToStorage(devices.filter(d => d.id !== id));
            toast({ title: 'Removido', description: 'Dispositivo excluído.' });
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setIsEditing(true);
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setIsEditing(false);
    };

    const filteredDevices = devices.filter(d => 
        d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.localidade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800">
                <strong>Nota Técnica:</strong> Para ingestão RTMP em produção, recomenda-se a integração com servidor <strong>NGINX-RTMP</strong> ou <strong>MediaMTX</strong>. As URLs configuradas abaixo devem apontar para o stream processado.
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">{isEditing ? 'Editar Dispositivo' : 'Novo Dispositivo'}</h2>
                    {isEditing && <Button variant="ghost" onClick={resetForm} size="sm"><X className="w-4 h-4 mr-2"/>Cancelar</Button>}
                </div>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input className="p-2 border rounded" placeholder="Nome do Dispositivo *" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                    <select className="p-2 border rounded" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                        <option value="Camera IP">Câmera IP</option>
                        <option value="DVR">DVR</option>
                        <option value="NVR">NVR</option>
                    </select>
                    <input className="p-2 border rounded" placeholder="IP / Host *" value={formData.ipHost} onChange={e => setFormData({...formData, ipHost: e.target.value})} />
                    
                    <input className="p-2 border rounded" placeholder="Porta (ex: 554, 80)" value={formData.porta} onChange={e => setFormData({...formData, porta: e.target.value})} />
                    <input className="p-2 border rounded" placeholder="Chave / Stream RTMP" value={formData.rtmpKey} onChange={e => setFormData({...formData, rtmpKey: e.target.value})} />
                    <input className="p-2 border rounded" placeholder="Localidade (Setor/Sala)" value={formData.localidade} onChange={e => setFormData({...formData, localidade: e.target.value})} />

                    <input className="p-2 border rounded" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                    <input className="p-2 border rounded" type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    <select className="p-2 border rounded" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Manutenção">Manutenção</option>
                    </select>

                    <div className="md:col-span-3 flex justify-end">
                         <Button type="submit" className="bg-[#1e3a8a] text-white">
                            <Save className="w-4 h-4 mr-2" /> Salvar Dispositivo
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-slate-700">Dispositivos Cadastrados ({filteredDevices.length})</h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" 
                            placeholder="Buscar dispositivo..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="p-4">Nome</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">IP/Host</th>
                                <th className="p-4">Localidade</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDevices.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-medium flex items-center gap-2">
                                        <Video className="w-4 h-4 text-slate-400"/> {item.nome}
                                    </td>
                                    <td className="p-4">{item.tipo}</td>
                                    <td className="p-4 font-mono text-xs">{item.ipHost}:{item.porta}</td>
                                    <td className="p-4">{item.localidade}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-1">
                                        <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}><Edit className="w-4 h-4 text-blue-600"/></Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-red-600"/></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CamerasConfigTab;