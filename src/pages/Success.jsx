import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Success = () => {
  return (
    <>
      <Helmet>
        <title>Compra Concluída! - Web Zoe</title>
        <meta name="description" content="Sua compra foi concluída com sucesso." />
      </Helmet>
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="glass-effect rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 150 }}
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">Pagamento bem-sucedido!</h1>
          <p className="text-slate-600 text-lg mb-8">
            Obrigado pela sua compra! Seu pedido está sendo processado e você receberá uma confirmação por e-mail em breve.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/store">
              <Button className="btn-primary w-full sm:w-auto">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continuar Comprando
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="btn-secondary w-full sm:w-auto">
                Ir para o Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Success;