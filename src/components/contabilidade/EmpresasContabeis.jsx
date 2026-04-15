import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Edit, Trash2, Search, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { getSelectedEmpresaId, setSelectedEmpresaId } from './companyStorage';

const initialForm = {
  id: '',
  nome_fantasia: '',
  razao_social: '',
  cnpj: '',
  inscricao_estadual: '',
  inscricao_municipal: '',
  regime_tributacao: 'Simples Nacional',
  email: '',
  telefone: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  observacoes: '',
  ativo: true,
};

const EmpresasContabeis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: empresas = [], loading, fetchAll, create, update, remove } = useSupabaseCrud('contabilidade_empresas');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEmpresaId, setSelectedEmpresaIdState] = useState(getSelectedEmpresaId());

  useEffect(() => {
    fetchAll(1, 1000);
  }, [fetchAll]);

  useEffect(() => {
    const handler = () => setSelectedEmpresaIdState(getSelectedEmpresaId());
    window.addEventListener('neny-contabilidade-empresa-change', handler);
    return () => window.removeEventListener('neny-contabilidade-empresa-change', handler);
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (empresas || []).filter((empresa) => {
      if (!term) return true;
      return [empresa.nome_fantasia, empresa.razao_social, empresa.cnpj, empresa.cidade, empresa.regime_tributacao]
        .some((v) => String(v || '').toLowerCase().includes(term));
    });
  }, [empresas, searchTerm]);

  const resetForm = () => {
    setFormData(initialForm);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.nome_fantasia || !formData.cnpj) {
      toast({ title: 'Campos obrigatórios', description: 'Informe pelo menos nome fantasia e CNPJ.', variant: 'destructive' });
      return;
    }

    const payload = {
      user_id: user.id,
      nome_fantasia: formData.nome_fantasia.trim(),
      razao_social: formData.razao_social.trim() || null,
      cnpj: formData.cnpj.trim(),
      inscricao_estadual: formData.inscricao_estadual.trim() || null,
      inscricao_municipal: formData.inscricao_municipal.trim() || null,
      regime_tributacao: formData.regime_tributacao,
      email: formData.email.trim() || null,
      telefone: formData.telefone.trim() || null,
      logradouro: formData.logradouro.trim() || null,
      numero: formData.numero.trim() || null,
      complemento: formData.complemento.trim() || null,
      bairro: formData.bairro.trim() || null,
      cidade: formData.cidade.trim() || null,
      estado: formData.estado.trim() || null,
      cep: formData.cep.trim() || null,
      observacoes: formData.observacoes.trim() || null,
      ativo: !!formData.ativo,
      updated_at: new Date().toISOString(),
    };

    const saved = formData.id ? await update(formData.id, payload) : await create(payload);
    if (saved) {
      await fetchAll(1, 1000);
      if (!selectedEmpresaId) {
        setSelectedEmpresaId(saved.id);
        setSelectedEmpresaIdState(saved.id);
      }
      resetForm();
    }
  };

  const handleEdit = (empresa) => {
    setFormData({ ...initialForm, ...empresa });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir esta empresa?')) return;
    const ok = await remove(id);
    if (ok) {
      if (selectedEmpresaId === id) {
        setSelectedEmpresaId('');
        setSelectedEmpresaIdState('');
      }
      await fetchAll(1, 1000);
    }
  };

  const activateEmpresa = (id) => {
    setSelectedEmpresaId(id);
    setSelectedEmpresaIdState(id);
    toast({ title: 'Empresa ativa definida', description: 'Os próximos lançamentos e relatórios usarão esta empresa.' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Empresas Atendidas</h2>
          <p className="text-slate-500 text-sm mt-1">Cadastre os dados fiscais e de endereço de cada empresa que você atende.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
            Empresa ativa: <strong>{empresas.find((e) => e.id === selectedEmpresaId)?.nome_fantasia || 'Nenhuma'}</strong>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="bg-[#3b82f6] text-white">
              <Plus className="w-4 h-4 mr-2" /> Nova Empresa
            </Button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">{formData.id ? 'Editar Empresa' : 'Nova Empresa'}</h3>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[
              ['nome_fantasia','Nome fantasia*'],['razao_social','Razão social'],['cnpj','CNPJ*'],['inscricao_estadual','Inscrição estadual'],['inscricao_municipal','Inscrição municipal'],['email','E-mail'],['telefone','Telefone'],['logradouro','Logradouro'],['numero','Número'],['complemento','Complemento'],['bairro','Bairro'],['cidade','Cidade'],['estado','Estado'],['cep','CEP']
            ].map(([key,label]) => (
              <input key={key} placeholder={label} value={formData[key] || ''} onChange={(e)=>setFormData((p)=>({...p,[key]:e.target.value}))} className="input-field" />
            ))}
            <select value={formData.regime_tributacao} onChange={(e)=>setFormData((p)=>({...p,regime_tributacao:e.target.value}))} className="input-field">
              <option>Simples Nacional</option>
              <option>Lucro Presumido</option>
              <option>Lucro Real</option>
            </select>
            <select value={String(formData.ativo)} onChange={(e)=>setFormData((p)=>({...p,ativo:e.target.value==='true'}))} className="input-field">
              <option value="true">Ativa</option>
              <option value="false">Inativa</option>
            </select>
            <textarea placeholder="Observações" value={formData.observacoes || ''} onChange={(e)=>setFormData((p)=>({...p,observacoes:e.target.value}))} className="input-field min-h-[110px] md:col-span-2 xl:col-span-3" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-[#3b82f6] text-white">Salvar Empresa</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900" placeholder="Buscar empresa por nome, CNPJ, cidade ou regime..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map((empresa)=> (
          <div key={empresa.id} className={`bg-white rounded-xl border shadow-sm p-5 ${selectedEmpresaId===empresa.id ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-700" /> {empresa.nome_fantasia}</h3>
                <p className="text-sm text-slate-500">{empresa.razao_social || 'Razão social não informada'}</p>
              </div>
              {selectedEmpresaId === empresa.id ? <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"><CheckCircle2 className="w-3.5 h-3.5" /> Ativa</span> : null}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm text-slate-700">
              <div><strong>CNPJ:</strong> {empresa.cnpj || '-'}</div>
              <div><strong>Regime:</strong> {empresa.regime_tributacao || '-'}</div>
              <div><strong>IE:</strong> {empresa.inscricao_estadual || '-'}</div>
              <div><strong>IM:</strong> {empresa.inscricao_municipal || '-'}</div>
              <div><strong>E-mail:</strong> {empresa.email || '-'}</div>
              <div><strong>Telefone:</strong> {empresa.telefone || '-'}</div>
              <div className="md:col-span-2"><strong>Endereço:</strong> {[empresa.logradouro, empresa.numero, empresa.complemento, empresa.bairro, empresa.cidade, empresa.estado, empresa.cep].filter(Boolean).join(', ') || '-'}</div>
            </div>
            {empresa.observacoes ? <p className="mt-3 text-sm text-slate-500">{empresa.observacoes}</p> : null}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button variant="outline" onClick={()=>activateEmpresa(empresa.id)} className="border-blue-200 text-blue-700">Usar nesta sessão</Button>
              <Button variant="outline" onClick={()=>handleEdit(empresa)}><Edit className="w-4 h-4 mr-2" />Editar</Button>
              <Button variant="outline" onClick={()=>handleDelete(empresa.id)} className="border-red-200 text-red-600"><Trash2 className="w-4 h-4 mr-2" />Excluir</Button>
            </div>
          </div>
        ))}
        {!filtered.length && !loading && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm col-span-full">Nenhuma empresa cadastrada.</div>
        )}
      </div>
    </motion.div>
  );
};

export default EmpresasContabeis;
