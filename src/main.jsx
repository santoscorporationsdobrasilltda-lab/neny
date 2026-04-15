import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { CartProvider } from '@/hooks/useCart';
import { AuthProvider } from '@/contexts/AuthContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { Toaster } from '@/components/ui/toaster';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <App />
            <Toaster />
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  </>
);