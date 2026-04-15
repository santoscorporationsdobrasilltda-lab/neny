import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-[#f8fafc] flex text-[#111827]">
            {/* Sidebar Component */}
            <Sidebar isSidebarOpen={isSidebarOpen} />

            {/* Main Content Area */}
            <div 
                className={`flex-1 flex flex-col transition-all duration-300 min-h-screen ${
                    isSidebarOpen ? 'ml-64' : 'ml-20'
                }`}
            >
                <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                
                <main className="flex-1 p-6 overflow-x-hidden bg-[#f8fafc]">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-[1920px] mx-auto"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;