import React from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, PieChart, Users, DollarSign, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RelatorioCard = ({ title, desc, icon: Icon, onClick }) => (
    <div onClick={onClick} className="glass-effect p-6 rounded-xl hover:bg-white/10 transition cursor-pointer group border border-white/10">
        <Icon className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition"/>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400">{desc}</p>
    </div>
);

const RelatorioGeral = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-8">Central de Relatórios Avançados</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RelatorioCard 
            title="Relatórios Financeiros" 
            desc="DRE, Fluxo de Caixa, Contas a Pagar/Receber e Análise de Custos." 
            icon={DollarSign}
        />
         <RelatorioCard 
            title="Relatórios de RH" 
            desc="Folha de Pagamento, Turnover, Férias e Custo de Pessoal." 
            icon={Users}
        />
         <RelatorioCard 
            title="Relatórios de Vendas" 
            desc="Curva ABC, Vendas por Região, Performance de Vendedores." 
            icon={PieChart}
        />
         <RelatorioCard 
            title="Relatórios de Estoque" 
            desc="Giro de Estoque, Produtos Parados, Valorização de Inventário." 
            icon={Package}
        />
         <RelatorioCard 
            title="Relatórios Contábeis" 
            desc="Balanço Patrimonial, Livros Fiscais e Balancetes." 
            icon={FileBarChart}
        />
      </div>
    </motion.div>
  );
};

export default RelatorioGeral;