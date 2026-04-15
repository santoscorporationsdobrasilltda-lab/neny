import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ModuleAuthContext = createContext(null);

export const useModuleAuth = () => useContext(ModuleAuthContext);

const mockModuleUsers = {
    fazenda: [{ id: 'm1', module: 'fazenda', username: 'fazenda_user', password: '123' }],
    piscicultura: [{ id: 'm2', module: 'piscicultura', username: 'pisc_user', password: '123' }],
};

export const ModuleAuthProvider = ({ children }) => {
    const [currentModuleUser, setCurrentModuleUser] = useState(null);
    const [allUsers, setAllUsers] = useState(mockModuleUsers);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('neny_currentModuleUser');
        if (storedUser) {
            setCurrentModuleUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        for (const module in allUsers) {
            const user = allUsers[module].find(u => u.username === username && u.password === password);
            if (user) {
                setCurrentModuleUser(user);
                sessionStorage.setItem('neny_currentModuleUser', JSON.stringify(user));
                return user;
            }
        }
        return null;
    };

    const logout = () => {
        setCurrentModuleUser(null);
        sessionStorage.removeItem('neny_currentModuleUser');
    };

    const getUsers = async (module) => {
        return allUsers[module] || [];
    };

    const getAllModuleUsers = async () => {
        return allUsers;
    };

    const addUser = async (module, userData) => {
        const newUser = { ...userData, module, id: uuidv4() };
        setAllUsers(prev => ({
            ...prev,
            [module]: [...(prev[module] || []), newUser],
        }));
        return newUser;
    };

    const updateUser = async (module, userId, updatedData) => {
        let updatedUser = null;
        setAllUsers(prev => ({
            ...prev,
            [module]: prev[module].map(u => {
                if (u.id === userId) {
                    updatedUser = { ...u, ...updatedData };
                    return updatedUser;
                }
                return u;
            }),
        }));
        return updatedUser;
    };

    const deleteUser = async (module, userId) => {
        setAllUsers(prev => ({
            ...prev,
            [module]: prev[module].filter(u => u.id !== userId),
        }));
    };


    const value = {
        currentModuleUser,
        login,
        logout,
        getUsers,
        getAllModuleUsers,
        addUser,
        updateUser,
        deleteUser,
        loading,
    };

    return (
        <ModuleAuthContext.Provider value={value}>
            {children}
        </ModuleAuthContext.Provider>
    );
};