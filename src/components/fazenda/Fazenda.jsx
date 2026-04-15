import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tractor, Plus, Download, Stethoscope, Bug, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import FazendaDashboard from '@/components/fazenda/FazendaDashboard';
import Bovino from '@/components/fazenda/Bovino';
import Suino from '@/components/fazenda/Suino';
import Frango from '@/components/fazenda/Frango';
import Lavoura from '@/components/fazenda/Lavoura';
import FazendaFinanceiro from '@/components/fazenda/FazendaFinanceiro';
import FazendaRelatorios from '@/components/fazenda/FazendaRelatorios';
import ConciliacaoBancaria from '@/components/fazenda/ConciliacaoBancaria';
import RastreabilidadeAnimais from '@/components/fazenda/RastreabilidadeAnimais';
import RastreabilidadeLavouras from '@/components/fazenda/RastreabilidadeLavouras';
import QrScannerModal from '@/components/fazenda/QrScannerModal';

const Fazenda = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleNotImplemented = () => {
    toast({
      title: "🚧 Em Desenvolvimento",
      description: "Esta funcionalidade está sendo preparada para você!",
    });
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'bovino', label: 'Bovinos' },
    { id: 'suino', label: 'Suínos' },
    { id: 'frango', label: 'Frangos' },
    { id: 'lavoura', label: 'Lavouras' },
    { id: 'rastreabilidade_animais', label: 'Sanidade Animal', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'rastreabilidade_lavouras', label: 'Sanidade Lavoura', icon: <Bug className="w-4 h-4" /> },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'conciliacao', label: 'Conciliação Bancária' },
    { id: 'relatorios', label: 'Relatórios' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <FazendaDashboard setActiveTab={setActiveTab} />;
      case 'bovino': return <Bovino />;
      case 'suino': return <Suino />;
      case 'frango': return <Frango />;
      case 'lavoura': return <Lavoura />;
      case 'rastreabilidade_animais': return <RastreabilidadeAnimais />;
      case 'rastreabilidade_lavouras': return <RastreabilidadeLavouras />;
      case 'financeiro': return <FazendaFinanceiro />;
      case 'conciliacao': return <ConciliacaoBancaria />;
      case 'relatorios': return <FazendaRelatorios />;
      default: return <FazendaDashboard setActiveTab={setActiveTab} />;
    }
  };

  const handleScanSuccess = async (decodedText) => {
    setIsScannerOpen(false);
    toast({ title: "🔍 QR Code Lido!", description: `Conteúdo: ${decodedText}. Ativando...` });
    setTimeout(() => {
        toast({ title: "✅ Ativação Simulada", description: `O registro para ${decodedText} foi ativado no sistema.` });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a8a] flex items-center gap-3">
            <Tractor className="w-8 h-8" /> Fazenda 5.0
          </h1>
          <p className="text-[#64748b] mt-1">Gestão completa da sua produção agropecuária.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleNotImplemented}> <Download className="w-4 h-4 mr-2" /> Exportar Relatório Geral </Button>
          <Button onClick={() => setIsScannerOpen(true)} className="bg-green-600 hover:bg-green-700 text-white"> <QrCode className="w-4 h-4 mr-2" /> Ativar Animal (QR) </Button>
          <Button onClick={handleNotImplemented} className="bg-[#3b82f6] text-white"> <Plus className="w-4 h-4 mr-2" /> Novo Lançamento </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex space-x-1 min-w-max pb-1">
          {tabs.map((tab) => (
            <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`
                    flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm
                    ${activeTab === tab.id 
                        ? 'bg-[#3b82f6] text-white shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }
                `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="min-h-[500px]">
        {renderContent()}
      </motion.div>
      
      {isScannerOpen && (
        <QrScannerModal 
          onClose={() => setIsScannerOpen(false)} 
          onScanSuccess={handleScanSuccess} 
        />
      )}
    </div>
  );
};

export default Fazenda;