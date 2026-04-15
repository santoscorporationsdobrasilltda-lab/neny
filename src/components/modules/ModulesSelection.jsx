import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Helmet } from 'react-helmet';
import ModuloCard from './ModuloCard';
import { allModulesList } from '@/data/modulesData';

const ModulesSelection = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModules = allModulesList.filter(module =>
    module.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Módulos do Sistema - Neny Software</title>
        <meta name="description" content="Selecione o módulo desejado para acessar o sistema" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Módulos do Sistema</h1>
            <p className="text-slate-300">Selecione o módulo que deseja acessar</p>
          </motion.div>

          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar módulo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModules.map((module, index) => (
              <ModuloCard key={module.id} module={module} index={index} />
            ))}
          </div>

          {filteredModules.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-slate-400 mt-12"
            >
              <p className="text-xl">Nenhum módulo encontrado</p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default ModulesSelection;