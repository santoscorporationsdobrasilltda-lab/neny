import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const PasswordRecoveryDialog = ({ open, onOpenChange }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordRecovery = async () => {
    if (!email) {
      toast({
        title: '📧 Campo Vazio',
        description: 'Por favor, insira seu endereço de e-mail.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-reset`,
    });

    setLoading(false);

    if (error) {
        toast({
            title: '❌ Erro na Recuperação',
            description: 'Não foi possível enviar o e-mail. Verifique se o e-mail está correto ou tente novamente mais tarde.',
            variant: 'destructive'
        });
        console.error('Password recovery error:', error.message);
    } else {
        toast({
            title: '✅ Verifique seu E-mail!',
            description: `Se o e-mail "${email}" estiver cadastrado, você receberá um link para redefinir sua senha.`,
            duration: 9000,
        });
        onOpenChange(false);
        setEmail('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            Recuperar Senha
          </DialogTitle>
          <DialogDescription>
            Digite seu e-mail abaixo. Enviaremos um link para você criar uma nova senha.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button type="button" onClick={handlePasswordRecovery} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordRecoveryDialog;