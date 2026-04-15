import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '@/contexts/SearchContext';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Search, X } from 'lucide-react';

const SearchResults = () => {
    const { results, isSearching, searchTerm, clearSearch } = useSearch();
    const navigate = useNavigate();

    const hasResults = Object.keys(results).length > 0;
    const showResults = searchTerm.length > 2;

    const handleNavigate = (path) => {
        navigate(path);
        clearSearch();
    };

    if (!showResults) {
        return null;
    }

    return (
        <AnimatePresence>
            {showResults && (
                <div className="fixed inset-0 bg-black/50 z-40" onClick={clearSearch}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="glass-effect rounded-2xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold gradient-text">Resultados da Busca</h2>
                                <button onClick={clearSearch} className="icon-button">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {isSearching ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                                </div>
                            ) : hasResults ? (
                                <div className="space-y-6">
                                    {Object.entries(results).map(([moduleName, data]) => (
                                        <div key={moduleName}>
                                            <h3 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">{moduleName}</h3>
                                            <ul className="space-y-2">
                                                {data.items.slice(0, 5).map(item => (
                                                    <li key={item.id}>
                                                        <a
                                                          onClick={() => handleNavigate(data.path)}
                                                          className="block p-3 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                                                        >
                                                            <p className="font-medium text-slate-900 truncate">{item[data.fields[0]]}</p>
                                                            <p className="text-sm text-slate-600 truncate">
                                                                {data.fields.slice(1).map(field => item[field]).filter(Boolean).join(' - ')}
                                                            </p>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center py-12 text-slate-500">
                                    <Search className="w-12 h-12 mb-4" />
                                    <p className="font-semibold">Nenhum resultado encontrado</p>
                                    <p className="text-sm">Tente usar termos de busca diferentes.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SearchResults;