import React, { useEffect, useMemo, useState } from 'react';
import { Shield, Plus, Trash2, Edit, Search, X, Save, Siren, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const initialDevice = {
  id: '',
  tipo: 'Câmera',
  nome: '',
  ip: '',
  porta: '',
  usuario: '',
  status: 'Ativo',
  localizacao: '',
};

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR');
};

const SegurancaEletronica = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    data: dispositivos,
    loading: loadingDispositivos,
    fetchAll: fetchDispositivos,
    create: createDispositivo,
    update: updateDispositivo,
    remove: removeDispositivo,
  } = useSupabaseCrud('seguranca_dispositivos');

  const {
    data: alarmes,
    loading: loadingAlarmes,
    fetchAll: fetchAlarmes,
  } = useSupabaseCrud('seguranca_alarmes');

  const {
    data: rastreamento,
    loading: loadingRastreamento,
    fetchAll: fetchRastreamento,
  } = useSupabaseCrud('seguranca_rastreamento');

  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(initialDevice);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDispositivos(1, 1000);
      fetchAlarmes(1, 1000);
      fetchRastreamento(1, 1000);
    }
  }, [user, fetchDispositivos, fetchAlarmes, fetchRastreamento]);

  const filteredDevices = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return [...dispositivos].filter((d) =>
      (d.nome || '').toLowerCase().includes(term) ||
      (d.tipo || '').toLowerCase().includes(term) ||
      (d.ip || '').toLowerCase().includes(term) ||
      (d.localizacao || '').toLowerCase().includes(term)
    );
  }, [dispositivos, searchTerm]);

  const resetForm = () => {
    setFormData(initialDevice);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;

    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'Informe o nome do dispositivo.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      user_id: user.id,
      tipo: formData.tipo || 'Câmera',
      nome: formData.nome.trim(),
      ip: formData.ip?.trim() || null,
      porta: formData.porta ? Number(formData.porta) : null,
      usuario: formData.usuario?.trim() || null,
      status: formData.status || 'Ativo',
      localizacao: formData.localizacao?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const saved = formData.id
      ? await updateDispositivo(formData.id, payload)
      : await createDispositivo(payload);

    if (saved) {
      await fetchDispositivos(1, 1000);
      resetForm();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir este dispositivo?')) return;
    const ok = await removeDispositivo(id);
    if (ok) await fetchDispositivos(1, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Segurança Eletrônica</h1>
        <p className="text-slate-500">Central de dispositivos, alarmes e rastreamento.</p>
      </div>

      <Tabs defaultValue="dispositivos" className="w-full">
        <TabsList className="bg-white border rounded-xl p-2">
          <TabsTrigger value="dispositivos">Dispositivos</TabsTrigger>
          <TabsTrigger value="alarmes">Alarmes</TabsTrigger>
          <TabsTrigger value="rastreamento">Rastreamento</TabsTrigger>
        </TabsList>

        <TabsContent value="dispositivos" className="space-y-4 mt-4">
          {!isEditing ? (
            <>
              <div className="flex justify-between gap-3">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-3 py-2 border rounded-lg"
                    placeholder="Buscar dispositivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Button onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo dispositivo
                </Button>
              </div>

              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Nome</th>
                      <th className="p-4">IP</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Localização</th>
                      <th className="p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingDispositivos ? (
                      <tr><td colSpan={6} className="p-6 text-center text-slate-500">Carregando...</td></tr>
                    ) : filteredDevices.length === 0 ? (
                      <tr><td colSpan={6} className="p-6 text-center text-slate-500">Nenhum dispositivo encontrado.</td></tr>
                    ) : filteredDevices.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-4">{item.tipo || '-'}</td>
                        <td className="p-4 font-medium text-slate-800">{item.nome}</td>
                        <td className="p-4">{item.ip || '-'}</td>
                        <td className="p-4">{item.status || '-'}</td>
                        <td className="p-4">{item.localizacao || '-'}</td>
                        <td className="p-4 flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => {
                            setFormData({
                              id: item.id,
                              tipo: item.tipo || 'Câmera',
                              nome: item.nome || '',
                              ip: item.ip || '',
                              porta: item.porta || '',
                              usuario: item.usuario || '',
                              status: item.status || 'Ativo',
                              localizacao: item.localizacao || '',
                            });
                            setIsEditing(true);
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-600" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800">{formData.id ? 'Editar' : 'Novo'} dispositivo</h3>
                <Button variant="ghost" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select className="p-2 border rounded-lg" value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}>
                  <option>Câmera</option>
                  <option>DVR</option>
                  <option>NVR</option>
                  <option>Controladora</option>
                  <option>Alarme</option>
                  <option>Sensor</option>
                </select>
                <input className="p-2 border rounded-lg" placeholder="Nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
                <input className="p-2 border rounded-lg" placeholder="IP" value={formData.ip} onChange={(e) => setFormData({ ...formData, ip: e.target.value })} />
                <input className="p-2 border rounded-lg" placeholder="Porta" value={formData.porta} onChange={(e) => setFormData({ ...formData, porta: e.target.value })} />
                <input className="p-2 border rounded-lg" placeholder="Usuário" value={formData.usuario} onChange={(e) => setFormData({ ...formData, usuario: e.target.value })} />
                <input className="p-2 border rounded-lg" placeholder="Localização" value={formData.localizacao} onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })} />
                <select className="p-2 border rounded-lg md:col-span-2" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option>Ativo</option>
                  <option>Inativo</option>
                  <option>Manutenção</option>
                </select>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alarmes" className="mt-4">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4">Zona</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Data/Hora</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Observações</th>
                </tr>
              </thead>
              <tbody>
                {loadingAlarmes ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-500">Carregando...</td></tr>
                ) : alarmes.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-500">Nenhum alarme encontrado.</td></tr>
                ) : alarmes.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-4">{item.zona || '-'}</td>
                    <td className="p-4">{item.tipo_evento || '-'}</td>
                    <td className="p-4">{formatDateTime(item.data_hora)}</td>
                    <td className="p-4">{item.status || '-'}</td>
                    <td className="p-4">{item.observacoes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="rastreamento" className="mt-4">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4">Veículo</th>
                  <th className="p-4">Placa</th>
                  <th className="p-4">Velocidade</th>
                  <th className="p-4">Localização</th>
                  <th className="p-4">Data/Hora</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingRastreamento ? (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-500">Carregando...</td></tr>
                ) : rastreamento.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-500">Nenhum rastreamento encontrado.</td></tr>
                ) : rastreamento.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-4">{item.veiculo || '-'}</td>
                    <td className="p-4">{item.placa || '-'}</td>
                    <td className="p-4">{item.velocidade || 0} km/h</td>
                    <td className="p-4">{item.latitude}, {item.longitude}</td>
                    <td className="p-4">{formatDateTime(item.data_hora)}</td>
                    <td className="p-4">{item.status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SegurancaEletronica;