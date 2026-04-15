import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, currentUser } = useAuth();

    if (loading) {
        return <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-white font-semibold text-lg">Carregando Sessão Segura...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if email is confirmed (Supabase sets email_confirmed_at when verified)
    if (currentUser && !currentUser.email_confirmed_at && currentUser.app_metadata?.provider === 'email') {
        // Uncomment if you strictly enforce email confirmation
        // return <Navigate to="/verify-email" replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;