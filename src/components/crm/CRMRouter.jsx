import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Users, Cone as Funnel, Phone } from 'lucide-react';

const CRMHome = () => (
     <div className="text-white space-y-6">
        <h1 className="text-3xl font-bold">CRM Avançado</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                <Users className="w-10 h-10 text-indigo-400 mb-3" />
                <h3 className="text-xl font-bold mb-2">Clientes e Leads</h3>
                <p className="text-slate-400">Gestão completa de contatos e histórico.</p>
            </div>
             <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                <Funnel className="w-10 h-10 text-pink-400 mb-3" />
                <h3 className="text-xl font-bold mb-2">Funil de Vendas</h3>
                <p className="text-slate-400">Pipeline visual e gestão de oportunidades.</p>
            </div>
             <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                <Phone className="w-10 h-10 text-green-400 mb-3" />
                <h3 className="text-xl font-bold mb-2">Interações</h3>
                <p className="text-slate-400">Registro de chamadas, emails e reuniões.</p>
            </div>
        </div>
    </div>
);

const CRMRouter = () => {
    return (
        <>
            <Helmet>
                <title>CRM - Neny Software</title>
            </Helmet>
            <div className="min-h-screen bg-slate-900 text-white p-6">
                <Routes>
                    <Route index element={<CRMHome />} />
                </Routes>
            </div>
        </>
    );
};

export default CRMRouter;