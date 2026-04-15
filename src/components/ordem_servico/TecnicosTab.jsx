import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';
import { PdfEngine } from '@/utils/PdfEngine';

const TecnicosTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const { data: techs, fetchAll, create, update, remove } = useSupabaseCrud('ordem_servicos_tecnicos');
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const initialForm = {
        nome: '', cpfCnpj: '', telefone: '', email: '', funcao: '',
        especialidades: '', regiao: '', centroCusto: '', centroGanho: '',
        cidade: '', bairro: '', pontoReferencia: '', lat: '', lng: ''
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (user) fetchAll();
    }, [user, fetchAll]);

    const handleSave = async (e) => {
        e.preventDefault();

        if (!formData.nome || !formData.telefone) {
            toast({ variant: "destructive", title: "Erro", description: "Preencha os campos obrigatórios." });
            return;
        }

        const payload = {
            user_id: user.id,
            nome: formData.nome,
            cpf_cnpj: formData.cpfCnpj || null,
            telefone: formData.telefone,
            email: formData.email || null,
            funcao: formData.funcao || null,
            especialidades: formData.especialidades || null,
            regiao_atendimento: formData.regiao || null,
            centro_custo: formData.centroCusto || null,
            centro_ganho: formData.centroGanho || null,
            cidade: formData.cidade || null,
            bairro: formData.bairro || null,
            ponto_referencia: formData.pontoReferencia || null,
            latitude: formData.lat ? Number(formData.lat) : null,
            longitude: formData.lng ? Number(formData.lng) : null,
        };

        try {
            if (formData.id) {
                await update(formData.id, payload);
                toast({ title: "Sucesso", description: "Técnico atualizado." });
            } else {
                await create(payload);
                toast({ title: "Sucesso", description: "Técnico cadastrado." });
            }

            await fetchAll();
            setIsEditing(false);
            setFormData(initialForm);
        } catch (error) {
            toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar técnico." });
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Deseja realmente excluir este técnico?')) {
            try {
                await remove(id);
                await fetchAll();
                toast({ title: "Excluído", description: "Registro removido com sucesso." });
            } catch (error) {
                toast({ variant: "destructive", title: "Erro", description: "Falha ao excluir técnico." });
            }
        }
    };


    const getValue = (tecnico, ...keys) => {
        for (const key of keys) {
            const value = tecnico?.[key];
            if (value !== undefined && value !== null && value !== '') return value;
        }
        return '-';
    };

    const handleDownloadPdf = (tecnico) => {
        try {
            const nomeTecnico = getValue(tecnico, 'nome');
            const documento = getValue(tecnico, 'cpf_cnpj', 'cpfCnpj');
            const telefone = getValue(tecnico, 'telefone');
            const email = getValue(tecnico, 'email');
            const funcao = getValue(tecnico, 'funcao');
            const especialidades = getValue(tecnico, 'especialidades');
            const regiao = getValue(tecnico, 'regiao_atendimento', 'regiao');
            const centroCusto = getValue(tecnico, 'centro_custo', 'centroCusto');
            const centroGanho = getValue(tecnico, 'centro_ganho', 'centroGanho');
            const cidade = getValue(tecnico, 'cidade');
            const bairro = getValue(tecnico, 'bairro');
            const pontoReferencia = getValue(tecnico, 'ponto_referencia', 'pontoReferencia');
            const latitude = getValue(tecnico, 'latitude', 'lat');
            const longitude = getValue(tecnico, 'longitude', 'lng');
            const criadoEm = getValue(tecnico, 'created_at', 'createdAt');
            const atualizadoEm = getValue(tecnico, 'updated_at', 'updatedAt');
            const userId = getValue(tecnico, 'user_id', 'userId');
            const tecnicoId = getValue(tecnico, 'id');

            const { doc, startY } = PdfEngine.createDocument({
                title: 'Ficha Completa do Técnico',
                subtitle: `${nomeTecnico} • Documento gerado pelo módulo Ordem de Serviços`,
            });

            let currentY = PdfEngine.addLabeledTable(doc, [
                ['ID do técnico', tecnicoId],
                ['Nome completo', nomeTecnico],
                ['CPF / CNPJ', documento],
                ['Telefone', telefone],
                ['Email', email],
                ['Função / Cargo', funcao],
                ['Especialidades', especialidades],
                ['Região de atendimento', regiao],
                ['Centro de custo', centroCusto],
                ['Centro de receita', centroGanho],
            ], {
                startY,
                tableWidth: 182,
                head: ['Dados cadastrais', 'Informações'],
            });

            currentY = PdfEngine.addSectionTitle(doc, 'Endereço e localização', currentY + 10);

            currentY = PdfEngine.addLabeledTable(doc, [
                ['Cidade', cidade],
                ['Bairro', bairro],
                ['Ponto de referência', pontoReferencia],
                ['Latitude', latitude],
                ['Longitude', longitude],
            ], {
                startY: currentY + 2,
                tableWidth: 182,
                head: ['Localização', 'Informações'],
                headColor: PdfEngine.BRAND.secondary,
            });

            currentY = PdfEngine.addSectionTitle(doc, 'Controle do registro', currentY + 10);

            PdfEngine.addLabeledTable(doc, [
                ['Usuário responsável', userId],
                ['Criado em', criadoEm !== '-' ? PdfEngine.asDate(criadoEm) : '-'],
                ['Atualizado em', atualizadoEm !== '-' ? PdfEngine.asDate(atualizadoEm) : '-'],
            ], {
                startY: currentY + 2,
                tableWidth: 182,
                head: ['Metadados', 'Informações'],
            });

            PdfEngine.finalize(
                doc,
                `Ficha_Tecnico_${PdfEngine.sanitizeFilename(nomeTecnico || 'tecnico')}.pdf`,
                'Ficha completa do técnico gerada pelo módulo Ordem de Serviços'
            );
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Não foi possível gerar o PDF do técnico.',
            });
        }
    };

    const filteredTechs = techs.filter(t => 
        t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.funcao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.regiao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {!isEditing ? (
                <>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="Buscar por nome, função ou região..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => { setFormData(initialForm); setIsEditing(true); }} className="bg-[#3b82f6] text-white w-full md:w-auto">
                            <Plus className="w-4 h-4 mr-2"/> Novo Técnico
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="p-4">Nome</th>
                                        <th className="p-4">Função</th>
                                        <th className="p-4">Especialidades</th>
                                        <th className="p-4">Região</th>
                                        <th className="p-4">Telefone</th>
                                        <th className="p-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTechs.length === 0 ? (
                                        <tr><td colSpan="6" className="p-8 text-center text-slate-500">Nenhum técnico encontrado.</td></tr>
                                    ) : (
                                        filteredTechs.map(t => (
                                            <tr key={t.id} className="hover:bg-slate-50">
                                                <td className="p-4 font-bold text-slate-700">{t.nome}</td>
                                                <td className="p-4">{t.funcao}</td>
                                                <td className="p-4 text-slate-500">{t.especialidades}</td>
                                                <td className="p-4">{t.regiao}</td>
                                                <td className="p-4">{t.telefone}</td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => handleDownloadPdf(t)} title="Baixar ficha em PDF">
                                                        <FileText className="w-4 h-4 text-slate-700"/>
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => { setFormData(t); setIsEditing(true); }}>
                                                        <Edit className="w-4 h-4 text-blue-600"/>
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(t.id)}>
                                                        <Trash2 className="w-4 h-4 text-red-600"/>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800">Cadastro de Técnico</h3>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}><X className="w-4 h-4 mr-2"/> Cancelar</Button>
                    </div>
                    
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Nome Completo *</label>
                            <input required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full p-2 border rounded" placeholder="Nome do técnico" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">CPF / CNPJ</label>
                            <input value={formData.cpfCnpj} onChange={e => setFormData({...formData, cpfCnpj: e.target.value})} className="w-full p-2 border rounded" placeholder="Documento" />
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium mb-1 block">Telefone *</label>
                            <input required value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="w-full p-2 border rounded" placeholder="(00) 00000-0000" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Email</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded" placeholder="email@exemplo.com" />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Função / Cargo</label>
                            <input value={formData.funcao} onChange={e => setFormData({...formData, funcao: e.target.value})} className="w-full p-2 border rounded" placeholder="Ex: Eletricista" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-1 block">Especialidades (Separar por vírgula)</label>
                            <input value={formData.especialidades} onChange={e => setFormData({...formData, especialidades: e.target.value})} className="w-full p-2 border rounded" placeholder="Ex: Rede, CFTV, Alarme" />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Região de Atendimento</label>
                            <input value={formData.regiao} onChange={e => setFormData({...formData, regiao: e.target.value})} className="w-full p-2 border rounded" placeholder="Zona Sul, Centro..." />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Centro de Custo</label>
                            <input value={formData.centroCusto} onChange={e => setFormData({...formData, centroCusto: e.target.value})} className="w-full p-2 border rounded" placeholder="Cód. Centro Custo" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Centro de Receita</label>
                            <input value={formData.centroGanho} onChange={e => setFormData({...formData, centroGanho: e.target.value})} className="w-full p-2 border rounded" placeholder="Cód. Centro Receita" />
                        </div>

                        <div className="md:col-span-3 border-t border-slate-100 mt-4 pt-4 mb-2">
                            <h4 className="font-semibold text-slate-700">Endereço e Localização</h4>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Cidade</label>
                            <input value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Bairro</label>
                            <input value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Ponto de Referência</label>
                            <input value={formData.pontoReferencia} onChange={e => setFormData({...formData, pontoReferencia: e.target.value})} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Latitude</label>
                            <input value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} className="w-full p-2 border rounded" placeholder="-23.5505" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Longitude</label>
                            <input value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} className="w-full p-2 border rounded" placeholder="-46.6333" />
                        </div>

                        <div className="md:col-span-3 flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-[#3b82f6] text-white">
                                <Save className="w-4 h-4 mr-2" /> Salvar Técnico
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
export default TecnicosTab;