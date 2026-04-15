import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const ModuloCard = ({ module, index }) => {
  const navigate = useNavigate();
  const Icon = module.icon;

  const handleClick = () => {
    navigate(`/modulos/${module.id}/login`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleClick}
      className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 cursor-pointer hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full group-hover:scale-110 transition-transform">
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-white mb-2">{module.label}</h3>
          <p className="text-sm text-slate-300 line-clamp-2">{module.description}</p>
        </div>

        <div className="flex items-center text-indigo-300 group-hover:text-indigo-200 transition-colors">
          <span className="text-sm font-medium">Acessar</span>
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {module.status === 'novo' && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
          NOVO
        </div>
      )}
    </motion.div>
  );
};

export default ModuloCard;