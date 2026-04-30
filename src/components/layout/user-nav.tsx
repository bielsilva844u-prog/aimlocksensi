'use client';

import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { getAuth, signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutGrid, LogOut, User as UserIcon } from 'lucide-react';
import { useFirebaseApp } from '@/firebase/provider';
import { useEffect, useState } from 'react';

export default function UserNav() {
  const { user, loading } = useUser();
  const router = useRouter();
  const app = useFirebaseApp();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);


  const handleLogout = async () => {
    if (!app) return;
    const auth = getAuth(app);
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!user) {
    const loginPath = isStandalone ? '/registrar' : '/login';
    return (
      <Button asChild>
        <Link href={loginPath}>{isStandalone ? 'Registrar Chave' : 'Fazer Login'}</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL ?? undefined} alt={user.username ?? ''} />
            <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#0d0404] border-primary/30 text-white" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-primary/20" />
        {!isStandalone && (
            <DropdownMenuItem onSelect={() => router.push('/inicio')}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            <span>Início</span>
            </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => router.push('/conta')}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Minha Conta</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-primary/20" />
        <DropdownMenuItem onSelect={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
