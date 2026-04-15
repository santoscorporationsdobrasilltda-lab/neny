import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import CadastroProdutos from './CadastroProdutos';

const EstoqueGeral = () => {
  return (
    <>
      <Helmet>
        <title>Estoque Avançado - Neny Software</title>
      </Helmet>
      
      <div className="min-h-screen bg-slate-900 text-white p-6">
          <Routes>
            <Route index element={<Navigate to="produtos" />} />
            <Route path="produtos" element={<CadastroProdutos />} />
          </Routes>
      </div>
    </>
  );
};

export default EstoqueGeral;