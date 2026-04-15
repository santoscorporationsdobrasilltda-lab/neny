import React from 'react';
import { Helmet } from 'react-helmet';
import ProductsList from '@/components/ProductsList';

const Store = () => {
  return (
    <>
      <Helmet>
        <title>Loja - Web Zoe</title>
        <meta name="description" content="Explore nossa coleção de produtos incríveis." />
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text text-shadow">Nossa Loja</h1>
          <p className="text-slate-600 mt-1">Encontre os melhores produtos para o seu negócio</p>
        </div>
        <ProductsList />
      </div>
    </>
  );
};

export default Store;