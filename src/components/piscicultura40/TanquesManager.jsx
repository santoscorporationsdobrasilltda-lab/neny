import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Box, Radio } from 'lucide-react';
import TanquesTab from './TanquesTab';
import SensoresTab from './SensoresTab';

const TanquesManager = () => {
    return (
        <Tabs defaultValue="tanques" className="w-full space-y-6">
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm inline-flex">
                <TabsList className="bg-transparent p-0 flex flex-wrap gap-2 h-auto">
                    <TabsTrigger value="tanques" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent rounded-lg px-4 py-2">
                        <Box className="w-4 h-4 mr-2"/> Cadastro de Tanques
                    </TabsTrigger>
                    <TabsTrigger value="sensores" className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700 data-[state=active]:border-cyan-200 border border-transparent rounded-lg px-4 py-2">
                        <Radio className="w-4 h-4 mr-2"/> Sensores IoT
                    </TabsTrigger>
                </TabsList>
            </div>
            
            <TabsContent value="tanques" className="outline-none">
                <TanquesTab />
            </TabsContent>
            <TabsContent value="sensores" className="outline-none">
                <SensoresTab />
            </TabsContent>
        </Tabs>
    );
};

export default TanquesManager;