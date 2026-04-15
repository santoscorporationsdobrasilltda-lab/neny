import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Briefcase, Clock, DollarSign } from 'lucide-react';

const ProjetosHome = () => (
     <div className="text-white space-y-6">
        <h1 className="text-3xl font-bold">Projetos e Serviços</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                <Briefcase className="w-10 h-10 text-yellow-400 mb-3" />
                <h3 className="text-xl font-bold mb-2">Meus Projetos</h3>
                <p className="text-slate-400">Gerenciamento de etapas e prazos.</p>
            </div>
             <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                <Clock className="w-10 h-10 text-cyan-400 mb-3" />
                <h3 className="text-xl font-bold mb-2">Timesheet</h3>
                <p className="text-slate-400">Controle de horas trabalhadas.</p>
            </div>
             <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                <DollarSign className="w-10 h-10 text-green-400 mb-3" />
                <h3 className="text-xl font-bold mb-2">Custos e Margem</h3>
                <p className="text-slate-400">Análise de rentabilidade por projeto.</p>
            </div>
        </div>
    </div>
);

const ProjetosRouter = () => {
    return (
        <>
            <Helmet>
                <title>Projetos - Neny Software</title>
            </Helmet>
            <div className="min-h-screen bg-slate-900 text-white p-6">
                <Routes>
                    <Route index element={<ProjetosHome />} />
                </Routes>
            </div>
        </>
    );
};

export default ProjetosRouter;