import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleAuth } from '@/contexts/ModuleAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { UserPlus, Edit, Trash2, Save, Eye, EyeOff, Users, Briefcase, ShoppingCart, Archive, Wrench, Fish, Tractor, User, BarChart, Settings, Shield, Loader2 } from 'lucide-react';

const MODULES_CONFIG = {
    financeiro: { label: 'Financeiro', icon: Briefcase },
    vendas: { label: 'Vendas', icon: ShoppingCart },
    estoque: { label: 'Estoque', icon: Archive },
    ordem_servico: { label: 'Ordem de Serviço', icon: Wrench },
    piscicultura: { label: 'Piscicultura', icon: Fish },
    fazenda: { label: 'Fazenda 5.0', icon: Tractor },
    seguranca: { label: 'Segurança Eletrônica', icon: Shield },
    clientes: { label: 'Clientes', icon: User },
    relatorios: { label: 'Relatórios', icon: BarChart },
    configuracoes: { label: 'Configurações', icon: Settings },
};

const passwordValidationRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
const passwordValidationError = "A senha deve ter no mínimo 6 caracteres, incluindo letras, números e um caractere especial (@$!%*#?&).";

const Administrador = () => {
    const [activeTab, setActiveTab] = useState('system');

    const tabs = [
        { id: 'system', label: 'Usuários do Sistema', icon: Users },
        ...Object.entries(MODULES_CONFIG).map(([id, { label, icon }]) => ({ id, label, icon })),
    ];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text text-shadow">Administração</h1>
                    <p className="text-slate-600 mt-1">Gerencie usuários e permissões do sistema e dos módulos.</p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <div className="flex space-x-1 glass-effect rounded-2xl p-1 overflow-x-auto custom-scrollbar pb-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-white/50'}`}>
                            <tab.icon className="w-5 h-5" /> {tab.label}
                        </button>
                    ))}
                </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                {activeTab === 'system' ? <SystemUsers /> : <ModuleUsers module={activeTab} />}
            </motion.div>
        </div>
    );
};

const SystemUsers = () => {
    const { users, updateUser, deleteUser, currentUser, allModulesList } = useAuth();
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSaveUser = async (userData) => {
        try {
            if (editingUser) {
                await updateUser(editingUser.id, userData);
                toast({ title: "✅ Usuário Atualizado", description: `Os dados de ${userData.username || editingUser.username} foram atualizados.` });
            } else {
                toast({ title: "🚧 Funcionalidade em desenvolvimento", description: "A criação de novos usuários do sistema principal deve ser feita via Supabase." });
            }
            setIsModalOpen(false);
        } catch (error) {
            toast({ title: "❌ Erro", description: error.message, variant: 'destructive' });
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (userId === currentUser?.id) {
            toast({ title: "🚫 Ação Proibida", description: "Você não pode excluir seu próprio usuário.", variant: 'destructive' });
            return;
        }
        try {
            await deleteUser(userId);
            toast({ title: "🗑️ Usuário Excluído", description: `O usuário ${username} foi removido.` });
        } catch(error) {
            toast({ title: "❌ Erro ao excluir", description: "Não foi possível remover o usuário. A exclusão de contas autenticadas deve ser feita pelo administrador no painel do Supabase.", variant: 'destructive' });
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={() => toast({ title: "🚧 Em breve", description: "Crie novos usuários diretamente no painel do Supabase."})} className="btn-primary"><UserPlus className="w-4 h-4 mr-2" />Novo Usuário do Sistema</Button>
            </div>
            <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Lista de Usuários do Sistema Principal</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 font-medium text-slate-600">Email</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-600">Usuário</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-600">Nível</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-600">Módulos</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="table-row">
                                    <td className="py-3 px-4 font-medium text-slate-900">{user.email}</td>
                                    <td className="py-3 px-4 text-slate-700">{user.username}</td>
                                    <td className="py-3 px-4"><span className={`status-badge ${user.role === 'admin' ? 'status-success' : 'status-info'}`}>{user.role === 'admin' ? 'Administrador' : 'Usuário'}</span></td>
                                    <td className="py-3 px-4">
                                        <div className="flex flex-wrap gap-1 max-w-md">
                                            {allModulesList.filter(m => user.permissions?.[m.id]).map(m => (
                                                <span key={m.id} className="bg-slate-200 text-slate-700 text-xs font-medium px-2 py-1 rounded-full">{m.label}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(user)}><Edit className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id, user.username)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <SystemUserModal user={editingUser} onSave={handleSaveUser} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const ModuleUsers = ({ module }) => {
    const { getUsers, addUser, updateUser, deleteUser } = useModuleAuth();
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const moduleConfig = MODULES_CONFIG[module] || { label: module, icon: User };

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const userList = await getUsers(module);
            setUsers(userList);
            setLoading(false);
        };
        fetchUsers();
    }, [module, getUsers]);

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSaveUser = async (userData) => {
        try {
            if (editingUser) {
                await updateUser(module, editingUser.id, userData);
                toast({ title: "✅ Usuário Atualizado", description: `Usuário do módulo ${moduleConfig.label} atualizado.` });
            } else {
                await addUser(module, userData);
                toast({ title: "✅ Usuário Criado", description: `Novo usuário criado para o módulo ${moduleConfig.label}.` });
            }
            const updatedUsers = await getUsers(module);
            setUsers(updatedUsers);
            setIsModalOpen(false);
            setEditingUser(null);
        } catch(error) {
            toast({ title: "❌ Erro ao salvar", description: error.message, variant: 'destructive' });
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (users.length <= 1) {
            toast({ title: "🚫 Ação Proibida", description: `O módulo ${moduleConfig.label} deve ter pelo menos um usuário.`, variant: 'destructive' });
            return;
        }
        try {
            await deleteUser(module, userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            toast({ title: "🗑️ Usuário Excluído", description: `O usuário ${username} foi removido do módulo ${moduleConfig.label}.` });
        } catch(error) {
            toast({ title: "❌ Erro ao excluir", description: error.message, variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={() => handleOpenModal()} className="btn-success"><UserPlus className="w-4 h-4 mr-2" />Novo Usuário de {moduleConfig.label}</Button>
            </div>
            <div className="glass-effect rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2"><moduleConfig.icon className="w-5 h-5" /> Usuários do Módulo: {moduleConfig.label}</h3>
                {loading ? <Loader2 className="animate-spin text-blue-500"/> : 
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 font-medium text-slate-600">Usuário</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="table-row">
                                    <td className="py-3 px-4 font-medium text-slate-900">{user.username}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(user)}><Edit className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id, user.username)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}
            </div>
            {isModalOpen && <ModuleUserModal module={module} user={editingUser} onSave={handleSaveUser} onClose={() => { setIsModalOpen(false); setEditingUser(null); }} />}
        </div>
    );
};

const SystemUserModal = ({ user, onSave, onClose }) => {
    const { allModulesList } = useAuth();
    const { toast } = useToast();
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [permissions, setPermissions] = useState(user?.permissions || {});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handlePermissionChange = (moduleId) => {
        let newPermissions = { ...permissions, [moduleId]: !permissions[moduleId] };
        setPermissions(newPermissions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const userData = { username, permissions };
        if (password) {
            toast({title: "Atenção", description: "A troca de senha para usuários do sistema deve ser feita via Supabase."});
        }
        
        try {
            await onSave(userData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass-effect rounded-2xl p-8 w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold gradient-text mb-6">{user ? 'Editar' : 'Novo'} Usuário do Sistema</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nome de Usuário</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="input-field" required />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                             <input type="email" value={user?.email || ''} className="input-field" disabled />
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Permissões de Acesso aos Módulos</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {allModulesList.map(module => (
                                <label key={module.id} className={`flex items-center gap-3 p-3 bg-white/50 rounded-lg transition-colors ${user?.role === 'admin' && module.id === 'administrador' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-white/80'}`}>
                                    <input type="checkbox" checked={!!permissions[module.id]} onChange={() => handlePermissionChange(module.id)} disabled={user?.role === 'admin'} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    <span className="font-medium text-slate-700">{module.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" onClick={onClose} variant="outline" className="btn-secondary" disabled={loading}>Cancelar</Button>
                        <Button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Salvar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ModuleUserModal = ({ module, user, onSave, onClose }) => {
    const { toast } = useToast();
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const moduleConfig = MODULES_CONFIG[module] || { label: module };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!user && !password) {
            setError("A senha é obrigatória para novos usuários.");
            return;
        }
        
        if (password && !passwordValidationRegex.test(password)) {
            setError(passwordValidationError);
            return;
        }
        
        setLoading(true);
        const userData = { username };
        if (password) {
            userData.password = password;
        }

        try {
            await onSave(userData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-effect rounded-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold gradient-text mb-6">{user ? 'Editar' : 'Novo'} Usuário de {moduleConfig.label}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nome de Usuário</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="input-field" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Senha</label>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={user ? 'Deixe em branco para manter' : 'Senha obrigatória'} className="input-field pr-10" required={!user} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" onClick={onClose} variant="outline" className="btn-secondary" disabled={loading}>Cancelar</Button>
                        <Button type="submit" className="btn-success" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2" />}
                            {loading ? "Salvando..." : "Salvar Usuário"}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Administrador;