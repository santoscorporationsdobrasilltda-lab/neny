import React, { createContext, useContext, useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

const FazendaAuthContext = createContext();

export const useFazendaAuth = () => useContext(FazendaAuthContext);

const defaultFazendaUser = {
    id: 'fazenda_user',
    username: 'fazenda',
    password: '123',
};

export const FazendaAuthProvider = ({ children }) => {
    const [fazendaUsers, setFazendaUsers] = useLocalStorage('webzoe_fazenda_users', [defaultFazendaUser]);
    const [fazendaUser, setFazendaUser] = useState(() => {
        try {
            const storedUser = sessionStorage.getItem('webzoe_fazendaUser');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            return null;
        }
    });

    useEffect(() => {
        if (fazendaUser) {
            sessionStorage.setItem('webzoe_fazendaUser', JSON.stringify(fazendaUser));
        } else {
            sessionStorage.removeItem('webzoe_fazendaUser');
        }
    }, [fazendaUser]);

    const login = (username, password) => {
        const user = fazendaUsers.find(u => u.username === username && u.password === password);
        if (user) {
            setFazendaUser(user);
            return user;
        }
        return null;
    };

    const logout = () => {
        setFazendaUser(null);
    };

    const addFazendaUser = (userData) => {
        const newUser = { id: uuidv4(), ...userData };
        setFazendaUsers(prev => [...prev, newUser]);
        return newUser;
    };

    const updateFazendaUser = (userId, updatedData) => {
        setFazendaUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedData } : u));
    };

    const deleteFazendaUser = (userId) => {
        setFazendaUsers(prev => prev.filter(u => u.id !== userId));
    };

    const value = {
        fazendaUser,
        fazendaUsers,
        login,
        logout,
        addFazendaUser,
        updateFazendaUser,
        deleteFazendaUser,
    };

    return (
        <FazendaAuthContext.Provider value={value}>
            {children}
        </FazendaAuthContext.Provider>
    );
};