import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, FileText } from 'lucide-react';
import ModuleSectorManagement from './ModuleSectorManagement';
import ProfilesPermissions from './ProfilesPermissions';
import AdministrativeParameters from './AdministrativeParameters';

const ModuleAdministration = () => {
  return (
    <>
      <Helmet>
        <title>Administração de Módulos - Neny Software</title>
        <meta name="description" content="Configuração e gerenciamento de módulos do sistema" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Administração de Módulos</h1>
            <p className="text-slate-300">Gerencie módulos, perfis e parâmetros do sistema</p>
          </motion.div>

          <Tabs defaultValue="modules" className="space-y-6">
            <TabsList className="bg-white/10 backdrop-blur-md border border-white/20 p-1">
              <TabsTrigger value="modules" className="data-[state=active]:bg-indigo-600">
                <Settings className="w-4 h-4 mr-2" />
                Módulos/Setores
              </TabsTrigger>
              <TabsTrigger value="profiles" className="data-[state=active]:bg-indigo-600">
                <Users className="w-4 h-4 mr-2" />
                Perfis e Permissões
              </TabsTrigger>
              <TabsTrigger value="parameters" className="data-[state=active]:bg-indigo-600">
                <FileText className="w-4 h-4 mr-2" />
                Parâmetros Gerais
              </TabsTrigger>
            </TabsList>

            <TabsContent value="modules">
              <ModuleSectorManagement />
            </TabsContent>

            <TabsContent value="profiles">
              <ProfilesPermissions />
            </TabsContent>

            <TabsContent value="parameters">
              <AdministrativeParameters />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default ModuleAdministration;