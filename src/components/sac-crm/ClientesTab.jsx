import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Save, Plus, Search, X } from 'lucide-react';
import { useSupabaseCrud } from '@/hooks/useSupabaseCrud';
import DataTable from '@/components/ui/DataTable';
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog';
import { useAuth } from '@/contexts/AuthContext';

const ClientesTab = () => {
    const { user } = useAuth();
    const { data: clients, loading, fetchAll, create, update, remove } = useSupabaseCrud('sac_crm_clientes');
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);

    const initialFormState = { nome: '', email: '', telefone: '', cpf_cnpj: '' };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (user) fetchAll();
    }, [user, fetchAll]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData, user_id: user?.id, cpf_cnpj: formData.cpf_cnpj || formData.documento || '' };
        delete payload.documento;
        if (formData.id) {
            await update(formData.id, payload);
        } else {
            await create(payload);
        }
        resetForm();
    };

    const confirmDelete = (client) => {
        setClientToDelete(client);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (clientToDelete) {
            await remove(clientToDelete.id);
            setDeleteModalOpen(false);
            setClientToDelete(null);
        }
    };

    const handleEdit = (item) => {
        setFormData({ ...item, cpf_cnpj: item.cpf_cnpj || item.documento || '' });
        setIsEditing(true);
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setIsEditing(false);
    };

    const filteredClients = clients.filter(c =>
        c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.cpf_cnpj || c.documento || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        { header: 'Nome', accessor: 'nome', cell: (row) => <span className="font-bold text-slate-700">{row.nome}</span> },
        { header: 'Documento', accessor: 'cpf_cnpj', cell: (row) => row.cpf_cnpj || row.documento || '-' },
        {
            header: 'Contato', accessor: 'telefone', cell: (row) => (
                <div>
                    <div className="text-slate-900">{row.telefone}</div>
                    <div className="text-slate-500 text-xs">{row.email}</div>
                </div>
            )
        },
        {
            header: 'Ações', align: 'right', cell: (row) => (
                <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}><Edit className="w-4 h-4 text-blue-600" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => confirmDelete(row)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {isEditing || formData.id || !isEditing && formData.nome ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800">{formData.id ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                        <Button variant="ghost" onClick={resetForm} size="sm"><X className="w-4 h-4 mr-2" />Cancelar</Button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input className="p-2 border rounded" placeholder="Nome *" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required disabled={loading} />
                        <input className="p-2 border rounded" placeholder="CPF/CNPJ" value={formData.cpf_cnpj} onChange={e => setFormData({ ...formData, cpf_cnpj: e.target.value })} disabled={loading} />
                        <input className="p-2 border rounded" placeholder="E-mail" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} disabled={loading} />
                        <input className="p-2 border rounded" placeholder="Telefone" value={formData.telefone} onChange={e => setFormData({ ...formData, telefone: e.target.value })} disabled={loading} />
                        <div className="md:col-span-2 flex justify-end">
                            <Button type="submit" className="bg-[#1e3a8a] text-white hover:bg-blue-800" disabled={loading}>
                                <Save className="w-4 h-4 mr-2" /> {formData.id ? 'Atualizar' : 'Salvar'}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : null}

            {!isEditing && !formData.id && !formData.nome && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
                        <Button onClick={() => setIsEditing(true)} className="bg-[#1e3a8a] text-white"><Plus className="w-4 h-4 mr-2" /> Novo Cliente</Button>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                                placeholder="Buscar cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <DataTable columns={columns} data={filteredClients} loading={loading} />
                </div>
            )}

            <ConfirmDeleteDialog
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={loading}
            />
        </div>
    );
};

export default ClientesTab;