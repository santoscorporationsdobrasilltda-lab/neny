import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link2, QrCode, Calculator, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Utilitarios = () => {
    const { toast } = useToast();

    const handleBackup = () => {
        toast({ title: 'Backup Iniciado', description: 'Download do arquivo .json em andamento...' });
        // Simulating backup logic
        setTimeout(() => toast({ title: 'Sucesso', description: 'Backup concluído.' }), 1500);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h1 className="text-3xl font-bold text-[#1e3a8a]">Utilitários do Sistema</h1>

            <Tabs defaultValue="integracoes" className="w-full">
                <TabsList className="bg-white p-1 rounded-xl border border-slate-200 mb-6 flex gap-2 h-auto">
                    <TabsTrigger value="integracoes" className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white rounded-lg flex-1 py-3"><Link2 className="w-4 h-4 mr-2" /> APIs e Integrações</TabsTrigger>
                    <TabsTrigger value="qrcode" className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white rounded-lg flex-1 py-3"><QrCode className="w-4 h-4 mr-2" /> Gerador QR Code</TabsTrigger>
                    <TabsTrigger value="calculadora" className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white rounded-lg flex-1 py-3"><Calculator className="w-4 h-4 mr-2" /> Calculadora</TabsTrigger>
                    <TabsTrigger value="backup" className="data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white rounded-lg flex-1 py-3"><Database className="w-4 h-4 mr-2" /> Backup e Restauração</TabsTrigger>
                </TabsList>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[400px]">
                    <TabsContent value="integracoes" className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800">Status das Integrações</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg flex justify-between items-center bg-green-50 border-green-200">
                                <div><h4 className="font-bold text-green-900">Receita Federal</h4><p className="text-sm text-green-700">API CNPJ</p></div>
                                <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">ONLINE</span>
                            </div>
                            <div className="p-4 border rounded-lg flex justify-between items-center bg-blue-50 border-blue-200">
                                <div><h4 className="font-bold text-blue-900">Banco Central</h4><p className="text-sm text-blue-700">Taxas de Câmbio</p></div>
                                <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-bold">ONLINE</span>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="qrcode" className="text-center">
                        <div className="max-w-md mx-auto space-y-4">
                            <h3 className="text-xl font-bold text-slate-800">Gerador Rápido</h3>
                            <input placeholder="Digite URL ou Texto" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50" />
                            <div className="w-48 h-48 bg-slate-100 mx-auto rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                                <QrCode className="w-12 h-12 text-slate-300" />
                            </div>
                            <Button className="w-full bg-[#1e3a8a]">Gerar Código</Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="calculadora" className="text-center">
                        <div className="max-w-xs mx-auto p-4 bg-slate-800 rounded-xl text-white">
                            <div className="bg-slate-900 p-4 rounded-lg mb-4 text-right text-2xl font-mono">0</div>
                            <div className="grid grid-cols-4 gap-2">
                                {['C', '/', '*', '-', '7', '8', '9', '+', '4', '5', '6', '=', '1', '2', '3', '0'].map(k => (
                                    <button key={k} className="p-3 bg-slate-700 rounded hover:bg-slate-600 font-bold">{k}</button>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="backup" className="text-center space-y-6">
                        <Database className="w-16 h-16 mx-auto text-slate-300" />
                        <h3 className="text-xl font-bold text-slate-800">Cópia de Segurança</h3>
                        <p className="text-slate-500 max-w-md mx-auto">Gere um arquivo JSON contendo os dados disponíveis para backup do sistema.</p>
                        <Button onClick={handleBackup} className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg">
                            <Database className="w-5 h-5 mr-2" /> Fazer Backup Agora
                        </Button>
                    </TabsContent>
                </div>
            </Tabs>
        </motion.div>
    );
};
export default Utilitarios;