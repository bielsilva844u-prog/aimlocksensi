'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuth, signOut } from 'firebase/auth';
import { useFirebaseApp } from '@/firebase';
import { Loader2, KeyRound, LogOut, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { addDays, formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { collection, query, where, onSnapshot, getFirestore } from 'firebase/firestore';
import Link from 'next/link';

interface LicenseKey {
  id: string;
  key: string;
  product: string;
  duration: string;
  status: 'active' | 'used';
  usedBy: string;
  createdAt: { seconds: number; nanoseconds: number };
  activatedAt?: { seconds: number; nanoseconds: number };
}

function calculateRemainingTime(key: LicenseKey): string {
  try {
    // Use activation date if available, otherwise fallback to creation date of the key
    const startDate = key.activatedAt 
      ? new Date(key.activatedAt.seconds * 1000) 
      : new Date(key.createdAt.seconds * 1000);

    const durationDays = parseInt(key.duration.split(' ')[0], 10);
    // Handle lifetime keys
    if (isNaN(durationDays) || durationDays <= 0) return 'Vitalício';
    
    const expirationDate = addDays(startDate, durationDays);
    
    if (expirationDate < new Date()) {
        return 'Expirado';
    }

    return formatDistanceToNowStrict(expirationDate, { locale: ptBR, addSuffix: true });
  } catch (e) {
    return 'N/A';
  }
}

export default function ContaPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const app = useFirebaseApp();
  const [licenseKeys, setLicenseKeys] = useState<LicenseKey[] | null>(null);
  const [keysLoading, setKeysLoading] = useState(true);

  const productPageMap: { [key: string]: string } = {
    'HEADTRICK': '/headtrick',
    'AUXILIO-ANDROID': '/auxilio-android',
    'AUXILIO-IPHONE': '/auxilio-iphone',
    'GERADOR-SENSI': '/gerador',
  };

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user && app) {
      const firestore = getFirestore(app);
      const q = query(collection(firestore, 'licenseKeys'), where('usedBy', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const keys = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as LicenseKey);
        setLicenseKeys(keys);
        setKeysLoading(false);
      }, () => {
        setKeysLoading(false);
      });
      return () => unsubscribe();
    } else if (!user && !userLoading) {
      // Not logged in, no keys to load
      setKeysLoading(false);
      setLicenseKeys([]);
    }
  }, [user, userLoading, app]);
  
  const handleLogout = async () => {
    if (!app) return;
    const auth = getAuth(app);
    await signOut(auth);
    router.push('/login');
  };

  const loading = userLoading || keysLoading;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="gerador-bg flex items-start justify-center p-4 sm:p-8 min-h-screen">
      <Card className="w-full max-w-2xl gerador-card">
        <CardHeader className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary">
            <AvatarImage src={user.photoURL ?? undefined} alt={user.username ?? ''} />
            <AvatarFallback className="text-3xl bg-muted">
                {user.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl text-white">{user.username}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-primary" />
                    Minhas Assinaturas
                </h3>
                {licenseKeys && licenseKeys.length > 0 ? (
                    <div className="space-y-3">
                        {licenseKeys.map(key => {
                            const productPath = productPageMap[key.product];
                            return (
                                <div key={key.id} className="bg-black/30 p-4 rounded-lg border border-primary/20 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-white">{key.product}</p>
                                        <p className="text-sm text-muted-foreground font-mono">{key.key}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-semibold text-primary">{calculateRemainingTime(key)}</p>
                                            <p className="text-xs text-muted-foreground">restante</p>
                                        </div>
                                        {productPath && (
                                            <Button asChild>
                                                <Link href={productPath}>
                                                    Acessar
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-black/30 p-6 rounded-lg border border-dashed border-primary/20 text-center">
                        <p className="text-muted-foreground">Você ainda não ativou nenhum produto.</p>
                        <Button variant="link" asChild><Link href="/registrar">Ativar uma chave</Link></Button>
                    </div>
                )}
            </div>
            
            <Separator className="bg-primary/20" />

            <div className="flex justify-end">
                 <Button onClick={handleLogout} variant="destructive" className="bg-destructive/80">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair da Conta
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
