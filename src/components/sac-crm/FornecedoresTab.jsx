import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit, Save, Search, X } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const FornecedoresTab = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: suppliers,
        fetchAll,
        create,
        update,
        remove,
    } = useSupabaseCrud('sac_crm_fornecedores');

    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const initialFormState = {
        id: '',
        nome: '',
        cpfCnpj: '',
        contato: '',
        email: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        segmento: '',
        responsavel: '',
        observacoes: '',
        status: 'Ativo',
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (user) {
            fetchAll();
        }
    }, [user, fetchAll]);

    const resetForm = () => {
        setFormData(initialFormState);
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Erro',
                description: 'Usuário não autenticado.',
                variant: 'destructive',
            });
            return;
        }

        if (!formData.nome) {
            toast({
                title: 'Erro',
                description: 'O nome do fornecedor é obrigatório.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            nome: formData.nome,
            cpf_cnpj: formData.cpfCnpj || null,
            contato: formData.contato || null,
            email: formData.email || null,
            telefone: formData.telefone || null,
            endereco: formData.endereco || null,
            cidade: formData.cidade || null,
            estado: formData.estado || null,
            cep: formData.cep || null,
            segmento: formData.segmento || null,
            responsavel: formData.responsavel || null,
            observacoes: formData.observacoes || null,
            status: formData.status || 'Ativo',
        };

        try {
            if (formData.id) {
                await update(formData.id, payload);
                toast({
                    title: 'Sucesso',
                    description: 'Fornecedor atualizado.',
                });
            } else {
                await create(payload);
                toast({
                    title: 'Sucesso',
                    description: 'Fornecedor cadastrado.',
                });
            }

            await fetchAll();
            resetForm();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao salvar fornecedor.',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir este fornecedor?')) return;

        try {
            await remove(id);
            await fetchAll();
            toast({
                title: 'Removido',
                description: 'Fornecedor excluído.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro',
                description: 'Falha ao excluir fornecedor.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (item) => {
        setFormData({
            id: item.id,
            nome: item.nome || '',
            cpfCnpj: item.cpf_cnpj || '',
            contato: item.contato || '',
            email: item.email || '',
            telefone: item.telefone || '',
            endereco: item.endereco || '',
            cidade: item.cidade || '',
            estado: item.estado || '',
            cep: item.cep || '',
            segmento: item.segmento || '',
            responsavel: item.responsavel || '',
            observacoes: item.observacoes || '',
            status: item.status || 'Ativo',
        });

        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter((s) =>
            (s.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.cpf_cnpj || '').includes(searchTerm) ||
            (s.cidade || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                    </h2>

                    {isEditing && (
                        <Button variant="ghost" onClick={resetForm} size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Cancelar Edição
                        </Button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        className="p-2 border rounded"
                        placeholder="Razão Social / Nome *"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                    />

                    <input
                        className="p-2 border rounded"
                        placeholder="CNPJ / CPF"
                        value={formData.cpfCnpj}
                        onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        placeholder="Nome do Contato"
                        value={formData.contato}
                        onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        placeholder="E-mail"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        placeholder="Telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded"
                        placeholder="Segmento"
                        value={formData.segmento}
                        onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
                    />

                    <input
                        className="p-2 border rounded md:col-span-2"
                        placeholder="Endereço (Rua, Nº, Bairro)"
                        value={formData.endereco}
                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    />

                    <div className="grid grid-cols-3 gap-2">
                        <input
                            className="p-2 border rounded"
                            placeholder="Cidade"
                            value={formData.cidade}
                            onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        />
                        <input
                            className="p-2 border rounded"
                            placeholder="UF"
                            value={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        />
                        <input
                            className="p-2 border rounded"
                            placeholder="CEP"
                            value={formData.cep}
                            onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                        />
                    </div>

                    <input
                        className="p-2 border rounded"
                        placeholder="Responsável Interno"
                        value={formData.responsavel}
                        onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    />

                    <select
                        className="p-2 border rounded"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Bloqueado">Bloqueado</option>
                    </select>

                    <textarea
                        className="p-2 border rounded md:col-span-3 h-20"
                        placeholder="Observações"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />

                    <div className="md:col-span-3 flex justify-end">
                        <Button type="submit" className="bg-[#1e3a8a] text-white hover:bg-blue-800">
                            <Save className="w-4 h-4 mr-2" />
                            {isEditing ? 'Atualizar Fornecedor' : 'Salvar Fornecedor'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-slate-700">
                        Lista de Fornecedores ({filteredSuppliers.length})
                    </h3>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                            placeholder="Buscar fornecedor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="p-4">Razão Social</th>
                                <th className="p-4">CNPJ</th>
                                <th className="p-4">Contato / Telefone</th>
                                <th className="p-4">Cidade/UF</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">
                                        Nenhum fornecedor encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-medium">{item.nome}</td>
                                        <td className="p-4 text-slate-500">{item.cpf_cnpj}</td>
                                        <td className="p-4">
                                            <div className="text-slate-900">{item.contato}</div>
                                            <div className="text-slate-500 text-xs">{item.telefone}</div>
                                        </td>
                                        <td className="p-4 text-slate-500">
                                            {item.cidade}/{item.estado}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Ativo'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-1">
                                            <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                                                <Edit className="w-4 h-4 text-blue-600" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FornecedoresTab;