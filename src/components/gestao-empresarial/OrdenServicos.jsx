import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OrdensServicoTab from '@/components/ordem_servico/OrdensServicoTab';
import TecnicosTab from '@/components/ordem_servico/TecnicosTab';
import EquipamentosTab from '@/components/ordem_servico/EquipamentosTab';
import FinanceiroOSTab from '@/components/ordem_servico/FinanceiroOSTab';
import MateriaisTecnicoTab from '@/components/ordem_servico/MateriaisTecnicoTab';
import LocalizacaoTab from '@/components/ordem_servico/LocalizacaoTab';
import AnexosTab from '@/components/ordem_servico/AnexosTab';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const OrdenServicos = () => {
    const [activeTab, setActiveTab] = useState('os');
    const { user } = useAuth();
    const { toast } = useToast();

    const {
        data: techniciansDb,
        fetchAll: fetchTechnicians,
    } = useSupabaseCrud('ordem_servicos_tecnicos');

    const {
        data: serviceOrdersDb,
        fetchAll: fetchServiceOrders,
    } = useSupabaseCrud('ordem_servicos_ordens');

    const {
        data: equipmentsDb,
        fetchAll: fetchEquipments,
        create: createEquipment,
        update: updateEquipment,
        remove: removeEquipment,
    } = useSupabaseCrud('ordem_servicos_equipamentos');

    useEffect(() => {
        if (user) {
            fetchTechnicians(1, 1000);
            fetchServiceOrders(1, 1000);
            fetchEquipments(1, 1000);
        }
    }, [user, fetchTechnicians, fetchServiceOrders, fetchEquipments]);

    const technicians = useMemo(() => {
        return techniciansDb.map((tech) => ({
            id: tech.id,
            name: tech.nome || '',
            email: tech.email || '',
            phone: tech.telefone || '',
            cost: tech.centro_custo || '',
            role: tech.funcao || '',
            city: tech.cidade || '',
            neighborhood: tech.bairro || '',
            lat: tech.latitude || '',
            lng: tech.longitude || '',
        }));
    }, [techniciansDb]);

    const serviceOrders = useMemo(() => {
        return serviceOrdersDb.map((order) => ({
            id: order.id,
            clienteNome: order.cliente_nome || order.cliente || '',
            tecnicoNome: order.tecnico_nome || techniciansDb.find((t) => t.id === order.tecnico_id)?.nome || '',
            status: order.status || '',
            descricao: order.descricao || '',
            observacoes: order.observacoes || '',
            dataPrevista: order.data_prevista || '',
            dataExecucao: order.data_execucao || '',
            anexo: order.anexo || '',
        }));
    }, [serviceOrdersDb]);

    const equipments = useMemo(() => {
        return equipmentsDb.map((eq) => ({
            id: eq.id,
            name: eq.name || '',
            serialNumber: eq.serial_number || '',
            model: eq.model || '',
        }));
    }, [equipmentsDb]);

    const syncEquipments = async (nextValue) => {
        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        const nextEquipments =
            typeof nextValue === 'function' ? nextValue(equipments) : nextValue;

        const previousMap = new Map(equipments.map((item) => [item.id, item]));
        const nextMap = new Map(nextEquipments.map((item) => [item.id, item]));

        const toCreate = nextEquipments.filter((item) => !previousMap.has(item.id));
        const toDelete = equipments.filter((item) => !nextMap.has(item.id));
        const toUpdate = nextEquipments.filter((item) => {
            const previous = previousMap.get(item.id);
            if (!previous) return false;

            return (
                previous.name !== item.name ||
                previous.serialNumber !== item.serialNumber ||
                previous.model !== item.model
            );
        });

        try {
            for (const item of toCreate) {
                await createEquipment({
                    id: item.id,
                    user_id: user.id,
                    name: item.name,
                    serial_number: item.serialNumber,
                    model: item.model || null,
                });
            }

            for (const item of toUpdate) {
                await updateEquipment(item.id, {
                    name: item.name,
                    serial_number: item.serialNumber,
                    model: item.model || null,
                    updated_at: new Date().toISOString(),
                });
            }

            for (const item of toDelete) {
                await removeEquipment(item.id);
            }

            await fetchEquipments(1, 1000);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao sincronizar equipamentos com o Supabase.',
                variant: 'destructive',
            });
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text text-shadow">Gestão de Serviços</h1>
                    <p className="text-slate-600">Controle completo de Ordens de Serviço e Equipe Técnica</p>
                </div>
            </div>

            <Tabs defaultValue="os" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white/50 p-1 rounded-xl mb-6 overflow-x-auto flex flex-wrap justify-start h-auto gap-2">
                    <TabsTrigger value="os" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg">
                        Ordens de Serviço
                    </TabsTrigger>
                    <TabsTrigger value="tecnicos" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg">
                        Técnicos
                    </TabsTrigger>
                    <TabsTrigger value="equipamentos" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg">
                        Equipamentos
                    </TabsTrigger>
                    <TabsTrigger value="financeiro" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg">
                        Financeiro
                    </TabsTrigger>
                    <TabsTrigger value="materiais" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg">
                        Materiais
                    </TabsTrigger>
                    <TabsTrigger value="localizacao" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg">
                        Localização
                    </TabsTrigger>
                    <TabsTrigger value="anexos" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg">
                        Anexos
                    </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <TabsContent value="os">
                            <OrdensServicoTab serviceOrders={serviceOrders} technicians={technicians} />
                        </TabsContent>

                        <TabsContent value="tecnicos">
                            <TecnicosTab technicians={technicians} />
                        </TabsContent>

                        <TabsContent value="equipamentos">
                            <EquipamentosTab equipments={equipments} setEquipments={syncEquipments} />
                        </TabsContent>

                        <TabsContent value="financeiro">
                            <FinanceiroOSTab serviceOrders={serviceOrders} />
                        </TabsContent>

                        <TabsContent value="materiais">
                            <MateriaisTecnicoTab technicians={technicians} />
                        </TabsContent>

                        <TabsContent value="localizacao">
                            <LocalizacaoTab technicians={technicians} />
                        </TabsContent>

                        <TabsContent value="anexos">
                            <AnexosTab serviceOrders={serviceOrders} />
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>
        </motion.div>
    );
};

export default OrdenServicos;