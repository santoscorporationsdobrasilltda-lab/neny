import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import GestaoEmpresarialLayout from './GestaoEmpresarialLayout';
import SaldosFinancas from './SaldosFinancas';
import RHEmpresarial from './RHEmpresarial';
import FolhaPagamento from './FolhaPagamento';
import DRE from './DRE';
import ContasAPagar from './ContasAPagar';
import ContasAReceber from './ContasAReceber';
import GestaoCustomia from './GestaoCustomia';
import ConciliacaoBancaria from './ConciliacaoBancaria';
import AdministracaoContratos from './AdministracaoContratos';
import OrdenServicos from './OrdenServicos';
import VendasModule from './VendasModule';
import RelatorioGeral from './RelatorioGeral';

const GestaoEmpresarial = () => {
  return (
    <>
      <Helmet>
        <title>Gestão Empresarial - Neny Software System</title>
        <meta name="description" content="ERP completo para gestão empresarial integrada" />
      </Helmet>
      
      <Routes>
        <Route path="/" element={<GestaoEmpresarialLayout />}>
          <Route index element={<Navigate to="saldos-financas" />} />
          <Route path="saldos-financas" element={<SaldosFinancas />} />
          <Route path="rh-empresarial" element={<RHEmpresarial />} />
          <Route path="folha-pagamento" element={<FolhaPagamento />} />
          <Route path="dre" element={<DRE />} />
          <Route path="contas-pagar" element={<ContasAPagar />} />
          <Route path="contas-receber" element={<ContasAReceber />} />
          <Route path="gestao-customia" element={<GestaoCustomia />} />
          <Route path="conciliacao-bancaria" element={<ConciliacaoBancaria />} />
          <Route path="contratos" element={<AdministracaoContratos />} />
          <Route path="ordem-servicos" element={<OrdenServicos />} />
          <Route path="vendas/*" element={<VendasModule />} />
          <Route path="relatorios" element={<RelatorioGeral />} />
        </Route>
      </Routes>
    </>
  );
};

export default GestaoEmpresarial;