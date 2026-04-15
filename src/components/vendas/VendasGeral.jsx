import React from 'react';
import { Helmet } from 'react-helmet';
import Vendas from '@/components/Vendas';

const VendasGeral = () => {
  return (
    <>
      <Helmet>
        <title>Vendas & CRM - Neny Software</title>
      </Helmet>
      <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
        <Vendas />
      </div>
    </>
  );
};

export default VendasGeral;
