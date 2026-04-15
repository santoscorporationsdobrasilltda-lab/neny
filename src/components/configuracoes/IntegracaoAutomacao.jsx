import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wifi,
  Cpu,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const protocols = [
  { name: 'OPC UA', description: 'Plataforma aberta para comunicação industrial.', type: 'IIoT' },
  { name: 'MQTT', description: 'Protocolo de mensagens leve para IoT.', type: 'IoT' },
  { name: 'Modbus TCP/IP', description: 'Protocolo de comunicação serial padrão.', type: 'Industrial' },
  { name: 'Profinet', description: 'Padrão Ethernet Industrial para automação.', type: 'Industrial' },
  { name: 'EtherNet/IP', description: 'Protocolo de rede industrial para automação.', type: 'Industrial' },
  { name: 'ONVIF', description: 'Fórum de interface de vídeo em rede aberta.', type: 'Video' },
  { name: 'RTSP', description: 'Protocolo de streaming em tempo real.', type: 'Video' },
  { name: 'RTMP', description: 'Protocolo de mensagens em tempo real.', type: 'Video' },
  { name: 'Wiegand', description: 'Padrão para controle de acesso.', type: 'Acesso' },
  { name: 'RS-485', description: 'Comunicação serial para automação.', type: 'Serial' },
  { name: 'Profibus', description: 'Padrão de fieldbus para automação.', type: 'Serial' },
  { name: 'DeviceNet', description: 'Rede de comunicação para dispositivos.', type: 'Serial' },
  { name: 'SensorBus', description: 'Protocolo para comunicação com sensores.', type: 'Sensor' },
];

const statusMap = {
  connecting: {
    icon: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
    text: 'Conectando...',
    textClass: 'text-blue-600',
  },
  connected: {
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    text: 'Conectado',
    textClass: 'text-green-600',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    text: 'Falha na Conexão',
    textClass: 'text-red-600',
  },
  disconnected: {
    icon: <XCircle className="w-5 h-5 text-slate-500" />,
    text: 'Desconectado',
    textClass: 'text-slate-600',
  },
};

const ProtocolCard = ({ protocol, connection, onConnect }) => {
  const [endpoint, setEndpoint] = useState(connection?.endpoint || '');

  useEffect(() => {
    setEndpoint(connection?.endpoint || '');
  }, [connection?.endpoint]);

  const status = connection?.status || 'disconnected';
  const statusInfo = statusMap[status] || statusMap.disconnected;

  return (
    <motion.div
      className="bg-white/50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-slate-800">{protocol.name}</h3>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-200 text-slate-700">
            {protocol.type}
          </span>
        </div>

        <p className="text-sm text-slate-600 mt-1 mb-4 h-10">{protocol.description}</p>
      </div>

      <div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Endpoint do Servidor
          </label>

          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder={`${protocol.name.toLowerCase()}://...`}
            className="input-field-sm"
            disabled={status === 'connecting'}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <span className={`text-sm font-semibold ${statusInfo.textClass}`}>
              {statusInfo.text}
            </span>
          </div>

          <Button
            size="sm"
            className={status === 'connected' ? 'btn-danger-outline' : 'btn-primary'}
            onClick={() => onConnect(protocol.name, endpoint)}
            disabled={status === 'connecting'}
          >
            {status === 'connecting' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {status === 'connected' ? 'Desconectar' : 'Conectar'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const IntegracaoAutomacao = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    data: connections,
    fetchAll,
    create,
    update,
  } = useSupabaseCrud('configuracoes_integracoes');

  useEffect(() => {
    if (user) {
      fetchAll(1, 1000);
    }
  }, [user, fetchAll]);

  const connectionsMap = useMemo(() => {
    return Object.fromEntries(
      connections.map((item) => [item.protocol_name, item])
    );
  }, [connections]);

  const handleConnect = async (protocolName, endpoint) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado.',
        variant: 'destructive',
      });
      return;
    }

    const current = connectionsMap[protocolName];
    const currentStatus = current?.status;

    if (currentStatus === 'connected') {
      const updated = await update(current.id, {
        endpoint: endpoint || current.endpoint || null,
        status: 'disconnected',
        last_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (updated) {
        toast({
          title: '🔌 Desconectado',
          description: `Conexão com ${protocolName} encerrada.`,
        });
      }
      return;
    }

    if (!endpoint?.trim()) {
      toast({
        variant: 'destructive',
        title: '⚠️ Endpoint vazio',
        description: 'Por favor, insira o endereço do servidor para conectar.',
      });
      return;
    }

    let savedConnection = null;

    if (current?.id) {
      savedConnection = await update(current.id, {
        endpoint: endpoint.trim(),
        status: 'connecting',
        last_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      savedConnection = await create({
        user_id: user.id,
        protocol_name: protocolName,
        endpoint: endpoint.trim(),
        status: 'connecting',
        last_checked_at: new Date().toISOString(),
      });
    }

    if (!savedConnection?.id) return;

    setTimeout(async () => {
      const isSuccess = Math.random() > 0.3;

      const result = await update(savedConnection.id, {
        endpoint: endpoint.trim(),
        status: isSuccess ? 'connected' : 'error',
        last_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (!result) return;

      if (isSuccess) {
        toast({
          title: '✅ Conectado!',
          description: `Conexão com ${protocolName} estabelecida com sucesso.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: '❌ Falha na conexão',
          description: `Não foi possível conectar a ${protocolName}. Verifique o endpoint.`,
        });
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center">
          <Wifi className="w-8 h-8 text-white" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">Integrações & Automação</h2>
          <p className="text-slate-600">
            Conecte o WebZoe a máquinas, equipamentos e outros softwares.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg">
        <div className="flex">
          <div className="py-1">
            <Cpu className="w-6 h-6 text-blue-500 mr-4" />
          </div>

          <div>
            <p className="font-bold">Aviso de Implementação</p>
            <p className="text-sm">
              Esta é uma interface de simulação. A conexão direta com hardware requer um gateway de IoT
              ou um serviço de nuvem intermediário para funcionar em um ambiente de produção real.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {protocols.map((protocol) => (
          <ProtocolCard
            key={protocol.name}
            protocol={protocol}
            onConnect={handleConnect}
            connection={connectionsMap[protocol.name]}
          />
        ))}
      </div>
    </div>
  );
};

export default IntegracaoAutomacao;