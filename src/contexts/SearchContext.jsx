import React, { createContext, useContext, useMemo, useState } from 'react';

const SearchContext = createContext(null);

export const SearchProvider = ({ children }) => {
  const [globalSearch, setGlobalSearch] = useState('');

  const value = useMemo(
    () => ({
      globalSearch,
      setGlobalSearch,
      clearGlobalSearch: () => setGlobalSearch(''),
    }),
    [globalSearch]
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};