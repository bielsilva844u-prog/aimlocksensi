'use client';

import { useEffect, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, KeyRound, Key, Search } from 'lucide-react';
import UsersTable from '@/components/admin/users-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import LicenseKeysTable from '@/components/admin/license-keys-table';
import GenerateKeyDialog from '@/components/admin/generate-key-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserProfile {
  id: string;
  username: string;
  photoURL: string;
  email: string;
  activatedProducts?: { [product: string]: string };
}

interface LicenseKey {
  id: string;
  key: string;
  product: string;
  duration: string;
  status: 'active' | 'used';
  usedBy: string;
  createdAt: { seconds: number; nanoseconds: number };
  authorId: string;
}

function AdminSkeleton() {
    return (
        <div className="p-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
                <Skeleton className="h-9 w-72" />
            </header>
            <Skeleton className="h-10 w-full max-w-lg mb-4" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-64" />
                    <Skeleton className="h-4 w-80" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

function AdminLogin({ onLogin }: { onLogin: (success: boolean) => void }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // WARNING: This is not a secure way to handle passwords.
        // This is a temporary solution for a simple admin panel.
        // In a real application, use a secure authentication system.
        if (password === 'adminpass') {
            setError('');
            onLogin(true);
        } else {
            setError('Senha incorreta. Tente novamente.');
            onLogin(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen p-4">
            <Card className="w-full max-w-sm gerador-card">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                       <KeyRound className="w-6 h-6 text-primary" /> Painel Administrativo
                    </CardTitle>
                    <CardDescription>
                        Digite a senha para acessar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="gerador-select"
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button type="submit" className="w-full gerador-button">
                            Entrar
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}


export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [localLicenseKeys, setLocalLicenseKeys] = useState<LicenseKey[]>([]);
  const firestore = useFirestore();
  const { data: users, loading: usersLoading } = useCollection<UserProfile>('users');
  const { data: licenseKeys, loading: keysLoading } = useCollection<LicenseKey>('licenseKeys');

  const loading = usersLoading || keysLoading;
  const displayedLicenseKeys = firestore ? licenseKeys || [] : localLicenseKeys;

  useEffect(() => {
    if (firestore) return;

    const storedKeys = JSON.parse(localStorage.getItem('localLicenseKeys') || '[]') as LicenseKey[];
    setLocalLicenseKeys(storedKeys);
  }, [firestore]);

  const handleLocalKeysGenerated = (keys: LicenseKey[]) => {
    setLocalLicenseKeys(keys);
  };

  const handleDeleteLocalKey = (id: string) => {
    const nextKeys = localLicenseKeys.filter((key) => key.id !== id);
    localStorage.setItem('localLicenseKeys', JSON.stringify(nextKeys));
    setLocalLicenseKeys(nextKeys);
  };

  if (!isAuthenticated) {
      return <AdminLogin onLogin={setIsAuthenticated} />;
  }

  if (loading) {
    return <AdminSkeleton />;
  }
  
  return (
    <div className="admin-container p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
      </header>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mb-4 gerador-tabs-list">
          <TabsTrigger value="licenseKeys">
            <Key className="w-4 h-4 mr-2" />
            License Keys ({displayedLicenseKeys.length})
          </TabsTrigger>
           <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Usuários {users && `(${users.length})`}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="licenseKeys">
          <Card className="gerador-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">License Keys ({displayedLicenseKeys.length})</CardTitle>
                <CardDescription>Gere e gerencie as licenças dos produtos.</CardDescription>
              </div>
              <GenerateKeyDialog />
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search keys..." className="pl-10 gerador-select" />
                    </div>
                    <Select>
                        <SelectTrigger className="w-[180px] gerador-select">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d0404] border-primary/30 text-white">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="used">Used</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="gerador-results-button copy-all">Clear Filters</Button>
                </div>
                <LicenseKeysTable keys={licenseKeys || []} users={users || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card className="gerador-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Application Users</CardTitle>
                <CardDescription>{users?.length || 0} users total</CardDescription>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                Create User
              </Button>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search users..." className="pl-10 gerador-select" />
                    </div>
                    <Select>
                        <SelectTrigger className="w-[180px] gerador-select">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d0404] border-primary/30 text-white">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="gerador-results-button copy-all">Clear Filters</Button>
                </div>
              <UsersTable users={users || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
