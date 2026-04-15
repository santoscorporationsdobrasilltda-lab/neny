import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Fazenda50Layout from './Fazenda50Layout';
import DashboardRuralTab from './DashboardRuralTab';
import BovinosTab from './BovinosTab';
import LeitorAgroTab from './LeitorAgroTab';
import SanidadeTab from './SanidadeTab';
import LavourasCadastroTab from './LavourasCadastroTab';
import DefensivosTab from './DefensivosTab';
import FinanceiroFazendaTab from './FinanceiroFazendaTab';
import RelatoriosFazendaAvancado from './RelatoriosFazendaAvancado';
import FazendasCadastroTab from './FazendasCadastroTab';

const Fazenda50Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Fazenda50Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardRuralTab />} />
        <Route path="fazendas" element={<FazendasCadastroTab />} />
        <Route path="bovinos" element={<BovinosTab />} />
        <Route path="leitor" element={<LeitorAgroTab />} />
        <Route path="sanidade" element={<SanidadeTab />} />
        <Route
          path="lavouras"
          element={
            <div className="space-y-6">
              <LavourasCadastroTab />
              <div className="border-t border-slate-200 my-6"></div>
              <DefensivosTab />
            </div>
          }
        />
        <Route path="financeiro" element={<FinanceiroFazendaTab />} />
        <Route path="relatorios" element={<RelatoriosFazendaAvancado />} />
      </Route>
    </Routes>
  );
};

export default Fazenda50Router;
