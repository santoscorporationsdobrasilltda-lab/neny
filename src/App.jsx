import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import MainLayout from '@/components/MainLayout';
import Login from '@/components/Login';
import SignupPage from '@/components/SignupPage';
import VerifyEmailPage from '@/components/VerifyEmailPage';
import PasswordRecoveryPage from '@/components/PasswordRecoveryPage';
import ResetPasswordPage from '@/components/ResetPasswordPage';
import Dashboard from '@/components/Dashboard';
import Financeiro from '@/components/Financeiro';
import Contabilidade from '@/components/contabilidade/Contabilidade';
import RecursosHumanos from '@/components/rh/RecursosHumanos';
import Estoque from '@/components/Estoque';
import Vendas from '@/components/Vendas';
import OrdemServico from '@/components/OrdemServico';
import ComprasRouter from '@/components/compras/ComprasRouter';
import RelatoriosRouter from '@/components/relatorios_bi/RelatoriosRouter';
import Utilitarios from '@/components/Utilitarios';
import Configuracoes from '@/components/Configuracoes';
import Fazenda50Router from '@/components/fazenda50/Fazenda50Router';
import Piscicultura from '@/components/piscicultura/Piscicultura';
import Piscicultura40Router from '@/components/piscicultura40/Piscicultura40Router';
import SegurancaEletronica from '@/components/seguranca/SegurancaEletronica';
import SegurancaMonitoramentoRouter from '@/components/seguranca-monitoramento/SegurancaMonitoramentoRouter';
import SacCrmRouter from '@/components/sac-crm/SacCrmRouter';
import OrdemServicoRouter from '@/components/ordem_servico/OrdemServicoRouter';
import SmartZapRouter from '@/components/smartzap/SmartZapRouter';
import BovinoQrPublicPage from '@/components/fazenda50/BovinoQrPublicPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import ModuleAccessRoute from '@/components/ModuleAccessRoute';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/hooks/useCart';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-white">Carregando Sistema...</div>;
  }

  return (
    <CartProvider>
      <Helmet>
        <title>Neny Software System - ERP Integrado</title>
      </Helmet>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/cadastro" element={<Navigate to="/signup" replace />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
        <Route path="/recuperar-senha" element={<Navigate to="/forgot-password" replace />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/fazenda50/qr" element={<BovinoQrPublicPage />} />

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/fazenda50/*"
            element={<ModuleAccessRoute moduleSlug="fazenda50"><Fazenda50Router /></ModuleAccessRoute>}
          />

          <Route
            path="/piscicultura"
            element={<ModuleAccessRoute moduleSlug="piscicultura40"><Piscicultura /></ModuleAccessRoute>}
          />

          <Route
            path="/piscicultura40/*"
            element={<ModuleAccessRoute moduleSlug="piscicultura40"><Piscicultura40Router /></ModuleAccessRoute>}
          />

          <Route
            path="/seguranca-eletronica"
            element={<ModuleAccessRoute moduleSlug="seguranca_eletronica"><SegurancaEletronica /></ModuleAccessRoute>}
          />

          <Route
            path="/seguranca-monitoramento/*"
            element={<ModuleAccessRoute moduleSlug="seguranca_monitoramento"><SegurancaMonitoramentoRouter /></ModuleAccessRoute>}
          />

          <Route
            path="/sac-crm/*"
            element={<ModuleAccessRoute moduleSlug="sac_crm"><SacCrmRouter /></ModuleAccessRoute>}
          />

          <Route
            path="/smartzap/*"
            element={<ModuleAccessRoute moduleSlug="smartzap"><SmartZapRouter /></ModuleAccessRoute>}
          />

          <Route
            path="/ordem-servicos/*"
            element={<ModuleAccessRoute moduleSlug="ordem_servicos"><OrdemServicoRouter /></ModuleAccessRoute>}
          />

          <Route
            path="/financeiro/*"
            element={<ModuleAccessRoute moduleSlug="gestao_empresarial"><Financeiro /></ModuleAccessRoute>}
          />
          <Route
            path="/contabilidade/*"
            element={<ModuleAccessRoute moduleSlug="gestao_empresarial"><Contabilidade /></ModuleAccessRoute>}
          />
          <Route
            path="/rh/*"
            element={<ModuleAccessRoute moduleSlug="gestao_empresarial"><RecursosHumanos /></ModuleAccessRoute>}
          />
          <Route
            path="/estoque/*"
            element={<ModuleAccessRoute moduleSlug="gestao_empresarial"><Estoque /></ModuleAccessRoute>}
          />
          <Route
            path="/vendas/*"
            element={<ModuleAccessRoute moduleSlug="gestao_empresarial"><Vendas /></ModuleAccessRoute>}
          />
          <Route
            path="/ordem-servicos-old/*"
            element={<ModuleAccessRoute moduleSlug="gestao_empresarial"><OrdemServico /></ModuleAccessRoute>}
          />
          <Route
            path="/compras/*"
            element={<ModuleAccessRoute moduleSlug="gestao_empresarial"><ComprasRouter /></ModuleAccessRoute>}
          />

          <Route
            path="/relatorios/*"
            element={<ModuleAccessRoute moduleSlug="relatorios_bi"><RelatoriosRouter /></ModuleAccessRoute>}
          />
          <Route
            path="/utilitarios"
            element={<ModuleAccessRoute moduleSlug="utilitarios"><Utilitarios /></ModuleAccessRoute>}
          />
          <Route
            path="/configuracoes"
            element={<ModuleAccessRoute moduleSlug="configuracoes"><Configuracoes /></ModuleAccessRoute>}
          />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <Toaster />
    </CartProvider>
  );
}

export default App;
