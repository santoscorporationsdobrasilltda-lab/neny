import React from 'react';
import { motion } from 'framer-motion';
import Vendas from '@/components/Vendas';

const VendasModule = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Vendas />
    </motion.div>
  );
};

export default VendasModule;
