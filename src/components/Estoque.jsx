import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Boxes, PackagePlus, Tag, ArrowDownToLine, ArrowUpFromLine, ClipboardList } from 'lucide-react';
import CadastroProdutos from './estoque/CadastroProdutos';
import CadastrosEstoque from './estoque/CadastrosEstoque';
import MovimentacoesEstoque from './estoque/MovimentacoesEstoque';
import InventarioEstoque from './estoque/InventarioEstoque';

const Estoque = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#1e3a8a]">Gestão de Estoque</h1>
        <p className="text-slate-500 max-w-3xl">
          Controle produtos, cadastros auxiliares, entradas, saídas e inventário em um único fluxo operacional.
        </p>
      </div>

      <Tabs defaultValue="produtos" className="w-full space-y-6">
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm inline-flex max-w-full overflow-x-auto">
          <TabsList className="bg-transparent p-0 flex flex-wrap gap-2 h-auto">
            <TabsTrigger value="produtos" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent rounded-xl px-4 py-2.5 whitespace-nowrap">
              <Boxes className="w-4 h-4 mr-2" /> Produtos
            </TabsTrigger>
            <TabsTrigger value="cadastros" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 data-[state=active]:border-violet-200 border border-transparent rounded-xl px-4 py-2.5 whitespace-nowrap">
              <Tag className="w-4 h-4 mr-2" /> Cadastros auxiliares
            </TabsTrigger>
            <TabsTrigger value="entrada" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:border-emerald-200 border border-transparent rounded-xl px-4 py-2.5 whitespace-nowrap">
              <ArrowDownToLine className="w-4 h-4 mr-2" /> Entrada
            </TabsTrigger>
            <TabsTrigger value="saida" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-200 border border-transparent rounded-xl px-4 py-2.5 whitespace-nowrap">
              <ArrowUpFromLine className="w-4 h-4 mr-2" /> Saída
            </TabsTrigger>
            <TabsTrigger value="inventario" className="data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700 data-[state=active]:border-sky-200 border border-transparent rounded-xl px-4 py-2.5 whitespace-nowrap">
              <ClipboardList className="w-4 h-4 mr-2" /> Inventário
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="produtos" className="outline-none"><CadastroProdutos /></TabsContent>
        <TabsContent value="cadastros" className="outline-none"><CadastrosEstoque /></TabsContent>
        <TabsContent value="entrada" className="outline-none"><MovimentacoesEstoque type="Entrada" /></TabsContent>
        <TabsContent value="saida" className="outline-none"><MovimentacoesEstoque type="Saída" /></TabsContent>
        <TabsContent value="inventario" className="outline-none"><InventarioEstoque /></TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Estoque;
