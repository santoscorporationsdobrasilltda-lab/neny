import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, FileText, Activity, DollarSign, Package, Paperclip, BarChart } from 'lucide-react';
import TecnicosTab from './ordem_servico/TecnicosTab';
import OrdensServicoTab from './ordem_servico/OrdensServicoTab';
import AtividadesTab from './ordem_servico/AtividadesTab';
import FinanceiroOSTab from './ordem_servico/FinanceiroOSTab';
import MateriaisTab from './ordem_servico/MateriaisTab';
import AnexosTab from './ordem_servico/AnexosTab';
import RelatoriosOS from './ordem_servico/RelatoriosOS';

const OrdemServico = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-3xl font-bold gradient-text text-shadow">Gestão de Ordens de Serviço</h1>

      <Tabs defaultValue="os" className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-xl mb-6 flex flex-wrap h-auto gap-2">
          <TabsTrigger value="os" className="data-[state=active]:bg-indigo-600 rounded-lg"><FileText className="w-4 h-4 mr-2" /> OS</TabsTrigger>
          <TabsTrigger value="tecnicos" className="data-[state=active]:bg-blue-600 rounded-lg"><Users className="w-4 h-4 mr-2" /> Técnicos</TabsTrigger>
          <TabsTrigger value="atividades" className="data-[state=active]:bg-green-600 rounded-lg"><Activity className="w-4 h-4 mr-2" /> Atividades</TabsTrigger>
          <TabsTrigger value="financeiro" className="data-[state=active]:bg-yellow-600 rounded-lg"><DollarSign className="w-4 h-4 mr-2" /> Financeiro</TabsTrigger>
          <TabsTrigger value="materiais" className="data-[state=active]:bg-orange-600 rounded-lg"><Package className="w-4 h-4 mr-2" /> Materiais</TabsTrigger>
          <TabsTrigger value="anexos" className="data-[state=active]:bg-purple-600 rounded-lg"><Paperclip className="w-4 h-4 mr-2" /> Anexos</TabsTrigger>
          <TabsTrigger value="relatorios" className="data-[state=active]:bg-pink-600 rounded-lg"><BarChart className="w-4 h-4 mr-2" /> Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="os"><OrdensServicoTab /></TabsContent>
        <TabsContent value="tecnicos"><TecnicosTab /></TabsContent>
        <TabsContent value="atividades"><AtividadesTab /></TabsContent>
        <TabsContent value="financeiro"><FinanceiroOSTab /></TabsContent>
        <TabsContent value="materiais"><MateriaisTab /></TabsContent>
        <TabsContent value="anexos"><AnexosTab /></TabsContent>
        <TabsContent value="relatorios"><RelatoriosOS /></TabsContent>
      </Tabs>
    </motion.div>
  );
};
export default OrdemServico;