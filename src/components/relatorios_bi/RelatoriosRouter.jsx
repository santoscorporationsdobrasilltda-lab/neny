import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Relatorios from '@/components/Relatorios';

const RelatoriosRouter = () => {
    return (
        <>
            <Helmet>
                <title>BI e Relatórios - Neny Software</title>
            </Helmet>
            <Routes>
                <Route index element={<Relatorios />} />
            </Routes>
        </>
    );
};

export default RelatoriosRouter;
