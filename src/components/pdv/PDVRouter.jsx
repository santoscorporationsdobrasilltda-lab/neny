import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PDV from '@/components/vendas/PDV';
import { Helmet } from 'react-helmet';

const PDVRouter = () => {
    return (
         <>
            <Helmet>
                <title>PDV - Frente de Caixa</title>
            </Helmet>
            <div className="min-h-screen bg-slate-900 text-white p-6">
                <Routes>
                    <Route index element={<PDV />} />
                </Routes>
            </div>
        </>
    );
};

export default PDVRouter;