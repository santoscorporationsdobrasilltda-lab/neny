import React from 'react';
import { motion } from 'framer-motion';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import useLocalStorage from '@/hooks/useLocalStorage';

const FazendaDashboard = ({ setActiveTab }) => {
  const [bovinos] = useLocalStorage('fazenda_bovinos', []);
  const [suinos] = useLocalStorage('fazenda_suinos', []);
  const [frangos] = useLocalStorage('fazenda_frangos', []);
  const [lavouras] = useLocalStorage('fazenda_lavouras', []);

  const metrics = [
    { title: 'Bovinos', value: bovinos.length, change: '+5', trend: 'up', color: 'from-orange-500 to-amber-500', action: () => setActiveTab('bovino') },
    { title: 'Suínos', value: suinos.length, change: '+20', trend: 'up', color: 'from-pink-500 to-rose-500', action: () => setActiveTab('suino') },
    { title: 'Frangos', value: frangos.length, change: '-50', trend: 'down', color: 'from-yellow-500 to-lime-500', action: () => setActiveTab('frango') },
    { title: 'Hectares Plantados', value: lavouras.reduce((acc, l) => acc + (Number(l.hectares) || 0), 0), change: '+10ha', trend: 'up', color: 'from-green-500 to-emerald-500', action: () => setActiveTab('lavoura') },
  ];

  const productionData = [
    { name: 'Bovinos', producao: 4000 },
    { name: 'Suínos', producao: 3000 },
    { name: 'Frangos', producao: 5000 },
    { name: 'Milho', producao: 8000 },
    { name: 'Soja', producao: 7500 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const TrendIcon = metric.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="metric-card cursor-pointer"
              onClick={metric.action}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-2">{metric.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</p>
                  <div className={`flex items-center gap-1 text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="font-medium">{metric.change}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="chart-container h-96"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Produção Geral (Estimativa em Kg)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip wrapperClassName="!bg-white/80 !backdrop-blur-sm !border-slate-200 !rounded-xl !shadow-lg" />
              <Legend />
              <Bar dataKey="producao" fill="url(#colorFazenda)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
      <svg>
        <defs>
          <linearGradient id="colorFazenda" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#f97316" stopOpacity={0.8}/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default FazendaDashboard;