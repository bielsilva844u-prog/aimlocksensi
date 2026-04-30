'use client';

import { useState } from 'react';
import { useFirebaseApp } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  getDoc,
  getFirestore,
} from 'firebase/firestore';
import { addDays } from 'date-fns';
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
import {
  KeyRound,
  Loader2,
  CheckCircle,
  User,
  Lock,
  Mail,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegistrarPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const app = useFirebaseApp();

  const handleActivateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !licenseKey) {
      toast({
        variant: 'destructive',
        title: 'Campos incompletos',
        description: 'Por favor, preencha todos os campos para continuar.',
      });
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(username)) {
      toast({
        variant: 'destructive',
        title: 'Nome de usuário inválido',
        description: 'Use apenas letras, números e os símbolos: . _ -',
      });
      return;
    }

    if (!app) {
      toast({
        variant: 'destructive',
        title: 'Erro de Aplicação',
        description: 'A conexão com o serviço não foi estabelecida.',
      });
      return;
    }

    setIsLoading(true);

    const auth = getAuth(app);
    const firestore = getFirestore(app);

    try {
      // 1. Check if the key exists and is active
      const keysRef = collection(firestore, 'licenseKeys');
      const q = query(
        keysRef,
        where('key', '==', licenseKey.trim()),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Chave Inválida',
          description:
            'A chave de licença não foi encontrada ou já foi utilizada.',
        });
        setIsLoading(false);
        return;
      }

      // 2. Authenticate user (create or sign in)
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          try {
            userCredential = await signInWithEmailAndPassword(
              auth,
              email,
              password
            );
          } catch (signInError: any) {
            let errorTitle = 'Erro de Login';
            let errorMessage =
              'Não foi possível fazer login com as credenciais fornecidas.';
            if (
              signInError.code === 'auth/wrong-password' ||
              signInError.code === 'auth/invalid-credential'
            ) {
              errorTitle = 'Credenciais Inválidas';
              errorMessage =
                'A senha está incorreta para este e-mail. Verifique seus dados e tente novamente.';
            } else if (signInError.message) {
              errorMessage = signInError.message;
            }
            toast({
              variant: 'destructive',
              title: errorTitle,
              description: errorMessage,
            });
            setIsLoading(false);
            return;
          }
        } else {
          const errorTitle = `Erro de Autenticação`;
          let errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';
          if (error.code === 'auth/weak-password') {
            errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'O formato do e-mail é inválido.';
          } else {
            errorMessage = error.message;
          }
          toast({
            variant: 'destructive',
            title: errorTitle,
            description: errorMessage,
          });
          setIsLoading(false);
          return;
        }
      }

      const currentUser = userCredential.user;
      if (!currentUser) throw new Error('Falha na autenticação.');

      // 3. Update key and user profile with expiration
      const keyDoc = querySnapshot.docs[0];
      const product = keyDoc.data().product as string;
      const duration = keyDoc.data().duration as string;

      const activationDate = new Date();
      const durationDays = parseInt(duration.split(' ')[0], 10);

      let expirationDate: Date;
      if (isNaN(durationDays) || durationDays <= 0) {
        // Lifetime key, set expiration far in the future
        expirationDate = addDays(activationDate, 365 * 100); // 100 years
      } else {
        expirationDate = addDays(activationDate, durationDays);
      }

      const userRef = doc(firestore, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const batch = writeBatch(firestore);

      // Update license key
      batch.update(keyDoc.ref, {
        status: 'used',
        usedBy: currentUser.uid,
        activatedAt: activationDate,
      });

      // Safely set/update user profile with product expiration
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const existingProducts = userData.activatedProducts || {};
        const updatedProducts = {
          ...existingProducts,
          [product]: expirationDate.toISOString(),
        };
        batch.update(userRef, { activatedProducts: updatedProducts });
      } else {
        // This case handles user creation if the document doesn't exist.
        batch.set(userRef, {
          username: username,
          email: email,
          photoURL: '',
          activatedProducts: {
            [product]: expirationDate.toISOString(),
          },
        });
      }

      await batch.commit();

      toast({
        title: 'Produto Ativado!',
        description: `A chave foi ativada com sucesso para o usuário ${username}. Redirecionando...`,
      });

      // 4. Redirect to account page
      setTimeout(() => router.push('/conta'), 2000);
    } catch (error: any) {
      console.error('Key Activation Error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na Ativação',
        description:
          error.message || 'Ocorreu um erro inesperado. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gerador-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md gerador-card">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mb-4">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-white">Registrar Produto</CardTitle>
          <CardDescription>
            Use seu e-mail, crie um usuário e senha, e insira sua chave de
            licença para ativar.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleActivateKey}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Usuário
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Crie seu nome de usuário único"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="gerador-select pl-10"
                />
              </div>
            </div>
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
                  placeholder="Crie uma senha (mín. 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="gerador-select pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="license-key" className="text-white">
                Chave de Licença
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="license-key"
                  placeholder="AIMLOCK-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  required
                  className="gerador-select font-mono pl-10"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button
              type="submit"
              className="w-full gerador-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-5 w-5" />
              )}
              {isLoading ? 'Ativando...' : 'Ativar Chave'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Fazer Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
