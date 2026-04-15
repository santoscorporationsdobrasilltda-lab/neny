import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Search, Tag, Truck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import { useAuth } from '@/contexts/AuthContext';

const INITIAL_CATEGORIA_FORM = {
    id: '',
    nome: '',
    descricao: '',
    status: 'Ativa',
};

const INITIAL_FORNECEDOR_FORM = {
    id: '',
    nome: '',
    cpfCnpj: '',
    contato: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: '',
    status: 'Ativo',
};

const CadastrosEstoque = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const {
        data: categorias,
        loading: loadingCategorias,
        fetchAll: fetchCategorias,
        create: createCategoria,
        update: updateCategoria,
        remove: removeCategoria,
    } = useSupabaseCrud('estoque_categorias');

    const {
        data: fornecedores,
        loading: loadingFornecedores,
        fetchAll: fetchFornecedores,
        create: createFornecedor,
        update: updateFornecedor,
        remove: removeFornecedor,
    } = useSupabaseCrud('estoque_fornecedores');

    const [view, setView] = useState('categorias');
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoriaForm, setCategoriaForm] = useState(INITIAL_CATEGORIA_FORM);
    const [fornecedorForm, setFornecedorForm] = useState(INITIAL_FORNECEDOR_FORM);

    useEffect(() => {
        if (user) {
            fetchCategorias();
            fetchFornecedores();
        }
    }, [user, fetchCategorias, fetchFornecedores]);

    useEffect(() => {
        setIsEditing(false);
        setSearchTerm('');

        if (view === 'categorias') {
            setCategoriaForm(INITIAL_CATEGORIA_FORM);
        } else {
            setFornecedorForm(INITIAL_FORNECEDOR_FORM);
        }
    }, [view]);

    const loading = loadingCategorias || loadingFornecedores;

    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        if (view === 'categorias') {
            return categorias.filter((item) =>
                (item.nome || '').toLowerCase().includes(term) ||
                (item.descricao || '').toLowerCase().includes(term) ||
                (item.status || '').toLowerCase().includes(term)
            );
        }

        return fornecedores.filter((item) =>
            (item.nome || '').toLowerCase().includes(term) ||
            (item.cpf_cnpj || '').toLowerCase().includes(term) ||
            (item.contato || '').toLowerCase().includes(term) ||
            (item.telefone || '').toLowerCase().includes(term) ||
            (item.cidade || '').toLowerCase().includes(term) ||
            (item.estado || '').toLowerCase().includes(term) ||
            (item.status || '').toLowerCase().includes(term)
        );
    }, [view, categorias, fornecedores, searchTerm]);

    const resetForm = () => {
        setIsEditing(false);

        if (view === 'categorias') {
            setCategoriaForm(INITIAL_CATEGORIA_FORM);
        } else {
            setFornecedorForm(INITIAL_FORNECEDOR_FORM);
        }
    };

    const handleEdit = (item) => {
        if (view === 'categorias') {
            setCategoriaForm({
                id: item.id,
                nome: item.nome || '',
                descricao: item.descricao || '',
                status: item.status || 'Ativa',
            });
        } else {
            setFornecedorForm({
                id: item.id,
                nome: item.nome || '',
                cpfCnpj: item.cpf_cnpj || '',
                contato: item.contato || '',
                telefone: item.telefone || '',
                email: item.email || '',
                endereco: item.endereco || '',
                cidade: item.cidade || '',
                estado: item.estado || '',
                cep: item.cep || '',
                observacoes: item.observacoes || '',
                status: item.status || 'Ativo',
            });
        }

        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            `Deseja realmente excluir ${view === 'categorias' ? 'esta categoria' : 'este fornecedor'}?`
        );

        if (!confirmed) return;

        const success =
            view === 'categorias'
                ? await removeCategoria(id)
                : await removeFornecedor(id);

        if (success) {
            if (view === 'categorias') {
                await fetchCategorias();
            } else {
                await fetchFornecedores();
            }
        }
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

        if (view === 'categorias') {
            if (!categoriaForm.nome.trim()) {
                toast({
                    title: 'Erro',
                    description: 'O nome da categoria é obrigatório.',
                    variant: 'destructive',
                });
                return;
            }

            const payload = {
                user_id: user.id,
                nome: categoriaForm.nome.trim(),
                descricao: categoriaForm.descricao?.trim() || null,
                status: categoriaForm.status || 'Ativa',
                updated_at: new Date().toISOString(),
            };

            const saved = categoriaForm.id
                ? await updateCategoria(categoriaForm.id, payload)
                : await createCategoria(payload);

            if (saved) {
                await fetchCategorias();
                resetForm();
            }

            return;
        }

        if (!fornecedorForm.nome.trim()) {
            toast({
                title: 'Erro',
                description: 'O nome do fornecedor é obrigatório.',
                variant: 'destructive',
            });
            return;
        }

        const payload = {
            user_id: user.id,
            nome: fornecedorForm.nome.trim(),
            cpf_cnpj: fornecedorForm.cpfCnpj?.trim() || null,
            contato: fornecedorForm.contato?.trim() || null,
            telefone: fornecedorForm.telefone?.trim() || null,
            email: fornecedorForm.email?.trim() || null,
            endereco: fornecedorForm.endereco?.trim() || null,
            cidade: fornecedorForm.cidade?.trim() || null,
            estado: fornecedorForm.estado?.trim() || null,
            cep: fornecedorForm.cep?.trim() || null,
            observacoes: fornecedorForm.observacoes?.trim() || null,
            status: fornecedorForm.status || 'Ativo',
            updated_at: new Date().toISOString(),
        };

        const saved = fornecedorForm.id
            ? await updateFornecedor(fornecedorForm.id, payload)
            : await createFornecedor(payload);

        if (saved) {
            await fetchFornecedores();
            resetForm();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
                <Button
                    type="button"
                    variant={view === 'categorias' ? 'default' : 'outline'}
                    onClick={() => setView('categorias')}
                    className={view === 'categorias' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                >
                    <Tag className="w-4 h-4 mr-2" />
                    Categorias
                </Button>

                <Button
                    type="button"
                    variant={view === 'fornecedores' ? 'default' : 'outline'}
                    onClick={() => setView('fornecedores')}
                    className={view === 'fornecedores' ? 'bg-sky-600 hover:bg-sky-700' : ''}
                >
                    <Truck className="w-4 h-4 mr-2" />
                    Fornecedores
                </Button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">
                        {view === 'categorias'
                            ? isEditing
                                ? 'Editar Categoria'
                                : 'Nova Categoria'
                            : isEditing
                                ? 'Editar Fornecedor'
                                : 'Novo Fornecedor'}
                    </h2>

                    {isEditing && (
                        <Button variant="ghost" onClick={resetForm} size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Cancelar edição
                        </Button>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className={`grid grid-cols-1 ${view === 'categorias' ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4`}
                >
                    {view === 'categorias' ? (
                        <>
                            <input
                                className="p-2 border rounded"
                                placeholder="Nome da categoria *"
                                value={categoriaForm.nome}
                                onChange={(e) =>
                                    setCategoriaForm({ ...categoriaForm, nome: e.target.value })
                                }
                                required
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Descrição"
                                value={categoriaForm.descricao}
                                onChange={(e) =>
                                    setCategoriaForm({ ...categoriaForm, descricao: e.target.value })
                                }
                            />

                            <select
                                className="p-2 border rounded"
                                value={categoriaForm.status}
                                onChange={(e) =>
                                    setCategoriaForm({ ...categoriaForm, status: e.target.value })
                                }
                            >
                                <option value="Ativa">Ativa</option>
                                <option value="Inativa">Inativa</option>
                            </select>
                        </>
                    ) : (
                        <>
                            <input
                                className="p-2 border rounded"
                                placeholder="Razão Social / Nome *"
                                value={fornecedorForm.nome}
                                onChange={(e) =>
                                    setFornecedorForm({ ...fornecedorForm, nome: e.target.value })
                                }
                                required
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="CNPJ / CPF"
                                value={fornecedorForm.cpfCnpj}
                                onChange={(e) =>
                                    setFornecedorForm({ ...fornecedorForm, cpfCnpj: e.target.value })
                                }
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Contato"
                                value={fornecedorForm.contato}
                                onChange={(e) =>
                                    setFornecedorForm({ ...fornecedorForm, contato: e.target.value })
                                }
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Telefone"
                                value={fornecedorForm.telefone}
                                onChange={(e) =>
                                    setFornecedorForm({ ...fornecedorForm, telefone: e.target.value })
                                }
                            />

                            <input
                                className="p-2 border rounded"
                                type="email"
                                placeholder="E-mail"
                                value={fornecedorForm.email}
                                onChange={(e) =>
                                    setFornecedorForm({ ...fornecedorForm, email: e.target.value })
                                }
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Endereço"
                                value={fornecedorForm.endereco}
                                onChange={(e) =>
                                    setFornecedorForm({ ...fornecedorForm, endereco: e.target.value })
                                }
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Cidade"
                                value={fornecedorForm.cidade}
                                onChange={(e) =>
                                    setFornecedorForm({ ...fornecedorForm, cidade: e.target.value })
                                }
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="Estado"
                                value={fornecedorForm.estado}
                                onChange={(e) =>
                                    setFornecedorForm({ ...fornecedorForm, estado: e.target.value })
                                }
                            />

                            <input
                                className="p-2 border rounded"
                                placeholder="CEP"
                                value={fornecedorForm.cep}
                                onChange={(e) =>
                                    setFornecedorForm({ ...fornecedorForm, cep: e.target.value })
                                }
                            />

                            <select
                                className="p-2 border rounded"
                                value={fornecedorForm.status}
                                onChange={(e) =>
                                    setFornecedorForm({ ...fornecedorForm, status: e.target.value })
                                }
                            >
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                            </select>

                            <textarea
                                className="p-2 border rounded md:col-span-2"
                                placeholder="Observações"
                                rows={3}
                                value={fornecedorForm.observacoes}
                                onChange={(e) =>
                                    setFornecedorForm({
                                        ...fornecedorForm,
                                        observacoes: e.target.value,
                                    })
                                }
                            />
                        </>
                    )}

                    <div className="md:col-span-full flex justify-end gap-2 pt-2">
                        {isEditing && (
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Cancelar
                            </Button>
                        )}

                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="w-4 h-4 mr-2" />
                            {isEditing ? 'Salvar alterações' : 'Cadastrar'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                        {view === 'categorias' ? 'Categorias cadastradas' : 'Fornecedores cadastrados'}
                    </h3>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            className="w-full pl-10 pr-3 py-2 border rounded-lg"
                            placeholder={
                                view === 'categorias'
                                    ? 'Buscar categoria...'
                                    : 'Buscar fornecedor...'
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-700">
                            <tr>
                                <th className="p-3 font-semibold">
                                    {view === 'categorias' ? 'Nome' : 'Fornecedor'}
                                </th>
                                <th className="p-3 font-semibold">
                                    {view === 'categorias' ? 'Descrição' : 'Documento'}
                                </th>
                                <th className="p-3 font-semibold">
                                    {view === 'categorias' ? 'Status' : 'Contato'}
                                </th>
                                <th className="p-3 font-semibold">
                                    {view === 'categorias' ? 'Ações' : 'Telefone'}
                                </th>
                                {view === 'fornecedores' && (
                                    <>
                                        <th className="p-3 font-semibold">Status</th>
                                        <th className="p-3 font-semibold">Ações</th>
                                    </>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={view === 'categorias' ? 4 : 6}
                                        className="p-6 text-center text-slate-500"
                                    >
                                        Carregando...
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={view === 'categorias' ? 4 : 6}
                                        className="p-6 text-center text-slate-500"
                                    >
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="border-b last:border-b-0">
                                        {view === 'categorias' ? (
                                            <>
                                                <td className="p-3 font-medium text-slate-800">
                                                    {item.nome}
                                                </td>
                                                <td className="p-3 text-slate-600">
                                                    {item.descricao || '-'}
                                                </td>
                                                <td className="p-3 text-slate-600">
                                                    {item.status || 'Ativa'}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>

                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-3 font-medium text-slate-800">
                                                    {item.nome}
                                                </td>
                                                <td className="p-3 text-slate-600">
                                                    {item.cpf_cnpj || '-'}
                                                </td>
                                                <td className="p-3 text-slate-600">
                                                    {item.contato || '-'}
                                                </td>
                                                <td className="p-3 text-slate-600">
                                                    {item.telefone || '-'}
                                                </td>
                                                <td className="p-3 text-slate-600">
                                                    {item.status || 'Ativo'}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>

                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => handleDelete(item.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
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

export default CadastrosEstoque;