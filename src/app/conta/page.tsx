'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuth, signOut } from 'firebase/auth';
import { useFirebaseApp } from '@/firebase';
import { Loader2, KeyRound, LogOut, ArrowRight, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { addDays, formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { collection, query, where, onSnapshot, getFirestore, getDocs, doc, getDoc, writeBatch } from 'firebase/firestore';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  const { toast } = useToast();
  const [licenseKeys, setLicenseKeys] = useState<LicenseKey[] | null>(null);
  const [keysLoading, setKeysLoading] = useState(true);
  const [newLicenseKey, setNewLicenseKey] = useState('');
  const [addKeyOpen, setAddKeyOpen] = useState(false);
  const [addingKey, setAddingKey] = useState(false);

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

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || !user || addingKey) return;

    const keyToActivate = newLicenseKey.trim();
    if (!keyToActivate) {
      toast({
        variant: 'destructive',
        title: 'Digite uma key',
        description: 'Informe a chave que voce quer adicionar.',
      });
      return;
    }

    setAddingKey(true);
    const firestore = getFirestore(app);

    try {
      const keysRef = collection(firestore, 'licenseKeys');
      const q = query(keysRef, where('key', '==', keyToActivate), where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Key invalida',
          description: 'Essa key nao foi encontrada ou ja foi usada.',
        });
        return;
      }

      const keyDoc = querySnapshot.docs[0];
      const keyData = keyDoc.data();
      const product = keyData.product as string;
      const duration = keyData.duration as string;
      const activationDate = new Date();
      const durationDays = parseInt(duration.split(' ')[0], 10);
      const expirationDate = isNaN(durationDays) || durationDays <= 0
        ? addDays(activationDate, 365 * 100)
        : addDays(activationDate, durationDays);

      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const batch = writeBatch(firestore);

      batch.update(keyDoc.ref, {
        status: 'used',
        usedBy: user.uid,
        activatedAt: activationDate,
      });

      const existingProducts = userDoc.exists() ? userDoc.data().activatedProducts || {} : {};
      batch.set(userRef, {
        username: user.username,
        email: user.email,
        photoURL: user.photoURL || '',
        activatedProducts: {
          ...existingProducts,
          [product]: expirationDate.toISOString(),
        },
      }, { merge: true });

      await batch.commit();

      toast({
        title: 'Key adicionada!',
        description: 'Sua nova assinatura foi ativada com sucesso.',
      });
      setNewLicenseKey('');
      setAddKeyOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar key',
        description: error.message || 'Tente novamente.',
      });
    } finally {
      setAddingKey(false);
    }
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
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-primary" />
                    Minhas Assinaturas
                  </h3>
                  <Dialog open={addKeyOpen} onOpenChange={setAddKeyOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gerador-button h-10 px-4 text-sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar key
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1a0f0f] border-primary/20">
                      <DialogHeader>
                        <DialogTitle className="text-white">Adicionar nova key</DialogTitle>
                        <DialogDescription>
                          Digite uma key ativa para adicionar outra assinatura na sua conta.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddKey} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-license-key" className="text-white">Key</Label>
                          <Input
                            id="new-license-key"
                            value={newLicenseKey}
                            onChange={(e) => setNewLicenseKey(e.target.value)}
                            placeholder="AIMLOCK-XXXX-XXXX"
                            className="gerador-select font-mono"
                          />
                        </div>
                        <Button type="submit" className="w-full gerador-button" disabled={addingKey}>
                          {addingKey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                          {addingKey ? 'Adicionando...' : 'Adicionar key'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                {licenseKeys && licenseKeys.length > 0 ? (
                    <div className="space-y-3">
                        {licenseKeys.map(key => {
                            const productPath = productPageMap[key.product];
                            const remainingTime = calculateRemainingTime(key);
                            return (
                                <div key={key.id} className="bg-black/30 p-4 rounded-lg border border-primary/20 space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-bold text-white leading-tight">{key.product}</p>
                                            <p className="mt-1 text-xs text-muted-foreground font-mono break-all">{key.key}</p>
                                        </div>
                                        <div className="shrink-0 rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-center">
                                            <p className="text-sm font-black leading-none text-primary">{remainingTime}</p>
                                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">restante</p>
                                        </div>
                                    </div>
                                    {productPath && (
                                        <Button asChild className="w-full sm:w-auto">
                                            <Link href={productPath}>
                                                Acessar
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    )}
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
