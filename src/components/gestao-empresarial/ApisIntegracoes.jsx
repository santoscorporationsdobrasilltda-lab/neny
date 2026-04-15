import React from 'react';
import { motion } from 'framer-motion';
import { Code, Database, Server, Key, Link as LinkIcon, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ApisIntegracoes = () => {
  const endpoints = [
    { method: 'GET', path: '/api/v1/financeiro/saldo', desc: 'Retorna o saldo atual consolidado', status: 'active' },
    { method: 'POST', path: '/api/v1/nfe/emitir', desc: 'Emite Nota Fiscal Eletrônica (Sefaz)', status: 'active' },
    { method: 'GET', path: '/api/v1/estoque/produtos', desc: 'Lista produtos e quantidades atuais', status: 'active' },
    { method: 'POST', path: '/api/v1/crm/leads', desc: 'Insere novo lead no CRM', status: 'active' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-white">APIs e Integrações</h1>
            <p className="text-slate-400">Documentação e status das integrações do sistema</p>
        </div>
        <Button className="bg-indigo-600"><Key className="w-4 h-4 mr-2"/> Gerar Chave de API</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 p-6 rounded-xl border border-white/20">
            <h3 className="text-white font-bold flex items-center gap-2 mb-2"><Server className="w-5 h-5 text-green-400"/> Status dos Serviços</h3>
            <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm text-slate-300"><span>API Gateway</span> <span className="text-green-400">Online</span></div>
                <div className="flex justify-between text-sm text-slate-300"><span>Sefaz Integration</span> <span className="text-green-400">Online</span></div>
                <div className="flex justify-between text-sm text-slate-300"><span>WhatsApp Bot</span> <span className="text-yellow-400">Instável</span></div>
            </div>
        </div>
        <div className="bg-white/10 p-6 rounded-xl border border-white/20">
            <h3 className="text-white font-bold flex items-center gap-2 mb-2"><Database className="w-5 h-5 text-blue-400"/> Webhooks</h3>
            <p className="text-slate-400 text-sm mb-4">Configure URLs para receber notificações de eventos.</p>
            <Button variant="outline" className="w-full text-white border-white/20">Configurar Webhooks</Button>
        </div>
        <div className="bg-white/10 p-6 rounded-xl border border-white/20">
            <h3 className="text-white font-bold flex items-center gap-2 mb-2"><LinkIcon className="w-5 h-5 text-purple-400"/> Conectores</h3>
            <div className="flex gap-2 mt-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1"><img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" alt="AWS" /></div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-2"><img src="https://cdn.icon-icons.com/icons2/2699/PNG/512/google_drive_logo_icon_169096.png" alt="Drive" /></div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1"><img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" /></div>
            </div>
        </div>
      </div>

      <div className="bg-white/10 p-6 rounded-xl border border-white/20">
        <Tabs defaultValue="endpoints">
            <TabsList className="bg-white/5 mb-6">
                <TabsTrigger value="endpoints">Endpoints REST</TabsTrigger>
                <TabsTrigger value="auth">Autenticação</TabsTrigger>
                <TabsTrigger value="examples">Exemplos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="endpoints">
                <div className="space-y-4">
                    {endpoints.map((ep, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition">
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded text-xs font-bold ${ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{ep.method}</span>
                                <code className="text-white font-mono text-sm">{ep.path}</code>
                                <span className="text-slate-400 text-sm hidden md:inline">- {ep.desc}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> {ep.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </TabsContent>
            
            <TabsContent value="auth">
                <div className="p-4 bg-slate-950 rounded-lg border border-white/10 font-mono text-sm text-slate-300">
                    <p className="mb-2">// Todos os requests devem incluir o header Authorization</p>
                    <p className="text-green-400">Authorization: Bearer {'<seu_token_jwt>'}</p>
                </div>
            </TabsContent>

             <TabsContent value="examples">
                <div className="p-4 bg-slate-950 rounded-lg border border-white/10 font-mono text-sm text-slate-300">
                    <pre>{`
// Exemplo de chamada GET Saldo
fetch('https://api.neny.systems/v1/financeiro/saldo', {
  headers: {
    'Authorization': 'Bearer ...'
  }
})
.then(response => response.json())
.then(data => console.log(data));
                    `}</pre>
                </div>
            </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default ApisIntegracoes;