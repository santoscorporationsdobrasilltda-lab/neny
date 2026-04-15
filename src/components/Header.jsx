import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Loader2 } from 'lucide-react';

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            navigate('/login');
            toast({ title: 'Logout realizado com sucesso' });
        } catch (error) {
            toast({ title: 'Erro ao sair', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoggingOut(false);
        }
    };

    const userName = user?.user_metadata?.nome_completo || 'Usuário';
    const initial = userName.charAt(0).toUpperCase();
    
    // Mask email: jo***@dominio.com
    const maskEmail = (email) => {
        if (!email) return '';
        const [name, domain] = email.split('@');
        if (!name || !domain) return email;
        const maskedName = name.length > 2 ? `${name.substring(0, 2)}***` : `${name.charAt(0)}***`;
        return `${maskedName}@${domain}`;
    };

    const displayEmail = maskEmail(user?.email);

    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center">
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 mr-4 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-[#1e3a8a] hidden md:block">Neny Software System</h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {initial}
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-[#1e293b]">{userName}</p>
                        <p className="text-xs text-[#64748b]">{displayEmail}</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Sair"
                >
                    {isLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                    <span className="hidden md:inline text-sm font-medium">Sair</span>
                </button>
            </div>
        </header>
    );
};

export default Header;