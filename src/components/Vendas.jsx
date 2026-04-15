import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Target, TrendingUp, ShoppingCart } from 'lucide-react';
import Propostas from './vendas/Propostas';
import MetasVendas from './vendas/MetasVendas';
import FunilVendas from './vendas/FunilVendas';
import PDV from './vendas/PDV';

const Vendas = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1e3a8a] mb-2">Gestão de Vendas</h1>
        <p className="text-slate-500">PDV, propostas, metas e visão comercial em um só lugar.</p>
      </div>
      
      <Tabs defaultValue="pdv" className="w-full space-y-6">
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm inline-flex">
            <TabsList className="bg-transparent p-0 flex flex-wrap gap-2 h-auto">
                <TabsTrigger value="pdv" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent rounded-lg px-4 py-2">
                    <ShoppingCart className="w-4 h-4 mr-2"/> PDV
                </TabsTrigger>
                <TabsTrigger value="propostas" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:border-indigo-200 border border-transparent rounded-lg px-4 py-2">
                    <FileText className="w-4 h-4 mr-2"/> Propostas
                </TabsTrigger>
                <TabsTrigger value="metas" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-purple-200 border border-transparent rounded-lg px-4 py-2">
                    <Target className="w-4 h-4 mr-2"/> Metas
                </TabsTrigger>
                <TabsTrigger value="funil" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700 data-[state=active]:border-pink-200 border border-transparent rounded-lg px-4 py-2">
                    <TrendingUp className="w-4 h-4 mr-2"/> Funil de Vendas
                </TabsTrigger>
            </TabsList>
        </div>
        
        <TabsContent value="pdv" className="outline-none"><PDV /></TabsContent>
        <TabsContent value="propostas" className="outline-none"><Propostas /></TabsContent>
        <TabsContent value="metas" className="outline-none"><MetasVendas /></TabsContent>
        <TabsContent value="funil" className="outline-none"><FunilVendas /></TabsContent>
      </Tabs>
    </motion.div>
  );
};
export default Vendas;
