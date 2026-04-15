import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Activity, HardHat, FileText, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { PdfGenerator } from '@/utils/PdfGenerator';

const SegurancaTrabalho = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('acidentes');

  // Mocks
  const acidentes = [
      { id: 1, data: '2023-11-15', hora: '14:30', local: 'Produção', tipo: 'Típico', parteCorpo: 'Mão Direita', descricao: 'Corte superficial durante manuseio.' }
  ];

  const handleGerarCAT = (acidente) => {
      PdfGenerator.generateCAT(acidente, { nome: 'Funcionário Exemplo' });
      toast({ title: "CAT Gerada", description: "Download iniciado." });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Segurança do Trabalho (SST)</h1>
            <p className="text-slate-400">Gestão de Riscos, Acidentes e Saúde Ocupacional</p>
          </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/5 p-1 rounded-xl mb-6 overflow-x-auto flex justify-start h-auto gap-2">
            <TabsTrigger value="acidentes" className="data-[state=active]:bg-red-600 rounded-lg"><ShieldAlert className="w-4 h-4 mr-2"/> Acidentes & CAT</TabsTrigger>
            <TabsTrigger value="riscos" className="data-[state=active]:bg-orange-600 rounded-lg"><Activity className="w-4 h-4 mr-2"/> Riscos & EPI</TabsTrigger>
            <TabsTrigger value="aso" className="data-[state=active]:bg-blue-600 rounded-lg"><FileText className="w-4 h-4 mr-2"/> ASO & Exames</TabsTrigger>
            <TabsTrigger value="afastamentos" className="data-[state=active]:bg-purple-600 rounded-lg"><Activity className="w-4 h-4 mr-2"/> Afastamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="acidentes" className="space-y-6">
            <div className="flex justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex gap-2">
                    <input placeholder="Buscar registro..." className="bg-slate-900 border border-white/10 rounded px-3 text-white text-sm" />
                    <Button variant="ghost" size="icon" className="text-white"><Search className="w-4 h-4"/></Button>
                </div>
                <Button className="bg-red-600 hover:bg-red-700"><Plus className="w-4 h-4 mr-2"/> Registrar Acidente</Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {acidentes.map(acd => (
                    <div key={acd.id} className="glass-effect p-6 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-red-500/20 p-3 rounded-full"><ShieldAlert className="w-6 h-6 text-red-500"/></div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{acd.tipo} - {acd.local}</h4>
                                <p className="text-slate-400 text-sm">{acd.data} às {acd.hora} • {acd.parteCorpo}</p>
                                <p className="text-slate-500 text-xs mt-1">{acd.descricao}</p>
                            </div>
                        </div>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => handleGerarCAT(acd)}>
                            <FileText className="w-4 h-4 mr-2"/> Gerar CAT (PDF)
                        </Button>
                    </div>
                ))}
            </div>
        </TabsContent>

        <TabsContent value="riscos" className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-effect p-6 rounded-xl border border-orange-500/30">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2"><HardHat className="w-5 h-5 text-orange-400"/> Controle de EPIs</h3>
                    <p className="text-sm text-slate-400 mb-4">Gestão de entrega e vencimento de equipamentos.</p>
                    <Button className="w-full bg-orange-600/20 hover:bg-orange-600/40 text-orange-100">Gerenciar Entregas</Button>
                </div>
                <div className="glass-effect p-6 rounded-xl border border-red-500/30">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2"><Activity className="w-5 h-5 text-red-400"/> Mapa de Riscos</h3>
                    <p className="text-sm text-slate-400 mb-4">Classificação de riscos por setor (Físico, Químico, etc).</p>
                    <Button className="w-full bg-red-600/20 hover:bg-red-600/40 text-red-100">Ver Mapa</Button>
                </div>
             </div>
        </TabsContent>
        
        <TabsContent value="aso" className="space-y-6">
             <div className="glass-effect p-8 rounded-xl text-center border border-white/10">
                 <p className="text-slate-400">Controle de Atestados de Saúde Ocupacional (ASO) em breve.</p>
             </div>
        </TabsContent>

        <TabsContent value="afastamentos" className="space-y-6">
             <div className="glass-effect p-8 rounded-xl text-center border border-white/10">
                 <p className="text-slate-400">Gestão de Afastamentos INSS e Licenças em breve.</p>
             </div>
        </TabsContent>

      </Tabs>
    </motion.div>
  );
};

export default SegurancaTrabalho;