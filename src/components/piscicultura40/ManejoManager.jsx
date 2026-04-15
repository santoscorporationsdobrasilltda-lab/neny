import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClipboardList, Scale, BarChart2, FileText } from 'lucide-react';
import ManejoTab from './manejo/ManejoTab';
import BiometriaTab from './manejo/BiometriaTab';
import ProducaoTab from './manejo/ProducaoTab';
import RelatorioProducaoTab from './manejo/RelatorioProducaoTab';

const ManejoManager = () => {
    return (
        <Tabs defaultValue="diario" className="w-full space-y-6">
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm inline-flex">
                <TabsList className="bg-transparent p-0 flex flex-wrap gap-2 h-auto">
                    <TabsTrigger value="diario" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-200 border border-transparent rounded-lg px-4 py-2">
                        <ClipboardList className="w-4 h-4 mr-2"/> Manejo Diário
                    </TabsTrigger>
                    <TabsTrigger value="biometria" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-purple-200 border border-transparent rounded-lg px-4 py-2">
                        <Scale className="w-4 h-4 mr-2"/> Biometria
                    </TabsTrigger>
                    <TabsTrigger value="producao" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent rounded-lg px-4 py-2">
                        <BarChart2 className="w-4 h-4 mr-2"/> Produção Atual
                    </TabsTrigger>
                    <TabsTrigger value="relatorio" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200 border border-transparent rounded-lg px-4 py-2">
                        <FileText className="w-4 h-4 mr-2"/> Relatórios
                    </TabsTrigger>
                </TabsList>
            </div>
            
            <TabsContent value="diario" className="outline-none"><ManejoTab /></TabsContent>
            <TabsContent value="biometria" className="outline-none"><BiometriaTab /></TabsContent>
            <TabsContent value="producao" className="outline-none"><ProducaoTab /></TabsContent>
            <TabsContent value="relatorio" className="outline-none"><RelatorioProducaoTab /></TabsContent>
        </Tabs>
    );
};

export default ManejoManager;