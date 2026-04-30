'use client';

import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useFirebaseApp } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Loader2, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const app = useFirebaseApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Campos incompletos',
        description: 'Por favor, preencha e-mail e senha.',
      });
      return;
    }

    if (!app) {
        toast({
            variant: 'destructive',
            title: 'Erro de conexão',
            description: 'Não foi possível conectar ao serviço de autenticação.',
        });
        return;
    }

    setIsLoading(true);
    const auth = getAuth(app);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      toast({
        title: 'Login bem-sucedido!',
        description: 'Redirecionando...',
      });
      router.push('/conta');

    } catch (error: any) {
      let title = 'Erro no Login';
      let description = 'Ocorreu um erro inesperado. Tente novamente.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        title = 'Credenciais Inválidas';
        description = 'E-mail ou senha incorretos. Verifique seus dados.';
      } else if (error.code === 'auth/invalid-email') {
        title = 'E-mail Inválido';
        description = 'O formato do e-mail é inválido.';
      }
      
      toast({
        variant: 'destructive',
        title,
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gerador-bg flex items-center justify-center p-4 min-h-screen">
      <Card className="w-full max-w-md gerador-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Acessar Conta</CardTitle>
          <CardDescription>
            Faça login para acessar seus produtos e gerenciar sua conta.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="gerador-select pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="gerador-select pl-10"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full gerador-button" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Não tem uma chave?{' '}
              <Link href="/registrar" className="text-primary hover:underline">
                Registre um produto
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
