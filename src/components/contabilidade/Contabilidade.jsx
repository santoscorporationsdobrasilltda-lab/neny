import React from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PlanoContas from './PlanoContas';
import LancamentosContabeis from './LancamentosContabeis';
import IntegracaoFinanceira from './IntegracaoFinanceira';
import RelatoriosContabeis from './RelatoriosContabeis';
import DemonstracoesContabeis from './DemonstracoesContabeis';
import EmpresasContabeis from './EmpresasContabeis';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Link as LinkIcon, BarChart, Landmark, Building2 } from 'lucide-react';

const Contabilidade = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();
  const isActive = (path) => currentPath === path;

  return (
    <>
      <Helmet>
        <title>Contabilidade - Neny Software</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1e3a8a]">Contabilidade</h1>
            <p className="text-[#64748b]">Gestão contábil por empresa, com dados fiscais, lançamentos e relatórios profissionais.</p>
          </div>
        </div>

        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-x-auto mb-6">
          <div className="flex space-x-2 min-w-max">
            <Link to="empresas"><Button variant={isActive('empresas') ? 'default' : 'ghost'} size="sm"><Building2 className="w-4 h-4 mr-2" /> Empresas</Button></Link>
            <Link to="plano-contas"><Button variant={isActive('plano-contas') ? 'default' : 'ghost'} size="sm"><BookOpen className="w-4 h-4 mr-2" /> Plano de Contas</Button></Link>
            <Link to="lancamentos"><Button variant={isActive('lancamentos') ? 'default' : 'ghost'} size="sm"><FileText className="w-4 h-4 mr-2" /> Lançamentos</Button></Link>
            <Link to="relatorios"><Button variant={isActive('relatorios') ? 'default' : 'ghost'} size="sm"><BarChart className="w-4 h-4 mr-2" /> Relatórios</Button></Link>
            <Link to="demonstracoes"><Button variant={isActive('demonstracoes') ? 'default' : 'ghost'} size="sm"><Landmark className="w-4 h-4 mr-2" /> Demonstrações</Button></Link>
            <Link to="integracao"><Button variant={isActive('integracao') ? 'default' : 'ghost'} size="sm"><LinkIcon className="w-4 h-4 mr-2" /> Integração</Button></Link>
          </div>
        </div>

        <div className="min-h-[500px]">
          <Routes>
            <Route index element={<Navigate to="empresas" />} />
            <Route path="empresas" element={<EmpresasContabeis />} />
            <Route path="plano-contas" element={<PlanoContas />} />
            <Route path="lancamentos" element={<LancamentosContabeis />} />
            <Route path="relatorios" element={<RelatoriosContabeis />} />
            <Route path="demonstracoes" element={<DemonstracoesContabeis />} />
            <Route path="integracao" element={<IntegracaoFinanceira />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default Contabilidade;
