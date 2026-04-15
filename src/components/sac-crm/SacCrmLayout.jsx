import React from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Truck, MessageSquare, History, CheckSquare, BarChart2 } from 'lucide-react';
import ClientesTab from './ClientesTab';
import FornecedoresTab from './FornecedoresTab';
import AtendimentosTab from './AtendimentosTab';
import HistoricoTab from './HistoricoTab';
import FollowUpTab from './FollowUpTab';
import RelatoriosTab from './RelatoriosTab';

const SacCrmLayout = () => {
    return (
        <div className="space-y-6">
            <Helmet>
                <title>SAC / CRM - Gestão de Relacionamento | NenySoft</title>
            </Helmet>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1e3a8a]">SAC / CRM</h1>
                    <p className="text-slate-500">Gestão de Clientes, Fornecedores e Atendimentos</p>
                </div>
            </div>

            <Tabs defaultValue="atendimentos" className="w-full space-y-6">
                <TabsList className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full flex flex-wrap h-auto gap-2 justify-start">
                    <TabsTrigger value="clientes" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 flex gap-2">
                        <Users className="w-4 h-4" /> Clientes
                    </TabsTrigger>
                    <TabsTrigger value="fornecedores" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 flex gap-2">
                        <Truck className="w-4 h-4" /> Fornecedores
                    </TabsTrigger>
                    <TabsTrigger value="atendimentos" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 flex gap-2">
                        <MessageSquare className="w-4 h-4" /> Atendimentos
                    </TabsTrigger>
                    <TabsTrigger value="historico" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 flex gap-2">
                        <History className="w-4 h-4" /> Histórico
                    </TabsTrigger>
                    <TabsTrigger value="followup" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 flex gap-2">
                        <CheckSquare className="w-4 h-4" /> Follow-up
                    </TabsTrigger>
                    <TabsTrigger value="relatorios" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 flex gap-2">
                        <BarChart2 className="w-4 h-4" /> Relatórios
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="clientes" className="outline-none">
                    <ClientesTab />
                </TabsContent>
                <TabsContent value="fornecedores" className="outline-none">
                    <FornecedoresTab />
                </TabsContent>
                <TabsContent value="atendimentos" className="outline-none">
                    <AtendimentosTab />
                </TabsContent>
                <TabsContent value="historico" className="outline-none">
                    <HistoricoTab />
                </TabsContent>
                <TabsContent value="followup" className="outline-none">
                    <FollowUpTab />
                </TabsContent>
                <TabsContent value="relatorios" className="outline-none">
                    <RelatoriosTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SacCrmLayout;