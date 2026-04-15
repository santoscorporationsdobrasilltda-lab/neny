import React from 'react';
import { motion } from 'framer-motion';

const AdministracaoContratos = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Administração de Contratos</h1>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center">
        <p className="text-slate-300 mb-4">Módulo de Contratos em desenvolvimento</p>
        <p className="text-sm text-slate-400">
          🚧 Cadastro de contratos com cliente/fornecedor, objeto, valor e vigência
        </p>
      </div>
    </motion.div>
  );
};

export default AdministracaoContratos;