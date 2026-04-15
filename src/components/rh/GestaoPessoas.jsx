import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, AlertTriangle, BookOpen, Target, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';

const GestaoPessoas = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('avaliacao');

  const handleAction = (action) => {
      toast({ title: "Ação Registrada", description: `${action} iniciado com sucesso.` });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestão de Pessoas & Talentos</h1>
            <p className="text-slate-400">Desenvolvimento, Performance e Carreira</p>
          </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-xl mb-6 overflow-x-auto flex justify-start h-auto gap-2">
            <TabsTrigger value="avaliacao" className="data-[state=active]:bg-indigo-600 rounded-lg"><Star className="w-4 h-4 mr-2"/> Avaliação</TabsTrigger>
            <TabsTrigger value="promocao" className="data-[state=active]:bg-indigo-600 rounded-lg"><TrendingUp className="w-4 h-4 mr-2"/> Promoções</TabsTrigger>
            <TabsTrigger value="treinamento" className="data-[state=active]:bg-indigo-600 rounded-lg"><BookOpen className="w-4 h-4 mr-2"/> Treinamentos</TabsTrigger>
            <TabsTrigger value="pdi" className="data-[state=active]:bg-indigo-600 rounded-lg"><Target className="w-4 h-4 mr-2"/> PDI</TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-indigo-600 rounded-lg"><MessageSquare className="w-4 h-4 mr-2"/> Feedbacks</TabsTrigger>
            <TabsTrigger value="advertencia" className="data-[state=active]:bg-red-600 rounded-lg"><AlertTriangle className="w-4 h-4 mr-2"/> Ocorrências</TabsTrigger>
        </TabsList>

        <TabsContent value="avaliacao" className="space-y-6">
             <div className="flex justify-end"><Button onClick={() => handleAction('Nova Avaliação')} className="bg-indigo-600"><Plus className="w-4 h-4 mr-2"/> Nova Avaliação</Button></div>
             <div className="glass-effect p-6 rounded-xl border border-white/10 text-center py-20">
                <Star className="w-16 h-16 text-indigo-500 mx-auto mb-4 opacity-50"/>
                <h3 className="text-xl font-bold text-white">Ciclo de Avaliação 2024</h3>
                <p className="text-slate-400 mt-2">Nenhuma avaliação pendente no momento.</p>
             </div>
        </TabsContent>

        <TabsContent value="promocao" className="space-y-6">
             <div className="flex justify-end"><Button onClick={() => handleAction('Solicitar Promoção')} className="bg-green-600"><Plus className="w-4 h-4 mr-2"/> Registrar Promoção</Button></div>
             <div className="glass-effect p-6 rounded-xl border border-white/10">
                <table className="w-full text-left text-white">
                    <thead className="text-slate-400 border-b border-white/10">
                        <tr><th className="p-3">Colaborador</th><th className="p-3">Cargo Anterior</th><th className="p-3">Novo Cargo</th><th className="p-3">Data</th></tr>
                    </thead>
                    <tbody>
                        <tr className="hover:bg-white/5">
                            <td className="p-3">João Silva</td>
                            <td className="p-3">Analista Jr</td>
                            <td className="p-3 text-green-400 font-bold">Analista Pleno</td>
                            <td className="p-3">01/01/2024</td>
                        </tr>
                    </tbody>
                </table>
             </div>
        </TabsContent>

        <TabsContent value="treinamento" className="space-y-6">
             <div className="flex justify-end"><Button onClick={() => handleAction('Novo Treinamento')} className="bg-blue-600"><Plus className="w-4 h-4 mr-2"/> Agendar Treinamento</Button></div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-effect p-6 rounded-xl border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-green-500 text-xs text-black font-bold px-2 py-1 rounded-bl">Concluído</div>
                    <h3 className="font-bold text-white text-lg">Segurança da Informação</h3>
                    <p className="text-sm text-slate-400 mt-1">Udemy Business</p>
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="text-xs text-slate-500">40 horas</span>
                        <span className="text-xs text-white bg-white/10 px-2 py-1 rounded">TI & Geral</span>
                    </div>
                </div>
             </div>
        </TabsContent>

         <TabsContent value="pdi" className="space-y-6">
             <div className="glass-effect p-8 rounded-xl text-center border border-white/10">
                 <p className="text-slate-400">Gerenciamento de Planos de Desenvolvimento Individual (PDI) em breve.</p>
             </div>
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-6">
             <div className="glass-effect p-8 rounded-xl text-center border border-white/10">
                 <p className="text-slate-400">Registro de Feedbacks 1:1 e Contínuos em breve.</p>
             </div>
        </TabsContent>

         <TabsContent value="advertencia" className="space-y-6">
             <div className="flex justify-end"><Button variant="destructive" onClick={() => handleAction('Nova Ocorrência')}><Plus className="w-4 h-4 mr-2"/> Nova Ocorrência</Button></div>
             <div className="glass-effect p-6 rounded-xl border border-white/10">
                <p className="text-slate-400 italic text-center">Nenhuma advertência ou suspensão registrada nos últimos 12 meses. Ótimo trabalho!</p>
             </div>
        </TabsContent>

      </Tabs>
    </motion.div>
  );
};

export default GestaoPessoas;