'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';
import ViewUserDialog from './view-user-dialog';


interface UserProfile {
  id: string;
  username: string;
  email: string;
  photoURL: string;
  activatedProducts?: string[];
}

interface UsersTableProps {
  users: UserProfile[];
}

export default function UsersTable({ users }: UsersTableProps) {
  if (!users.length) {
    return <p className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado.</p>;
  }

  return (
    <div className="border rounded-lg overflow-hidden border-primary/20">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/20 hover:bg-transparent">
              <TableHead className="text-white">User</TableHead>
              <TableHead className="text-white">HWID</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Last Login</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-primary/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL} alt={user.username} />
                        <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium text-white">{user.username}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{user.id.substring(0, 16).toUpperCase()}</TableCell>
                <TableCell>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 capitalize text-xs font-bold">
                        Active
                    </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  20/04/2026
                </TableCell>
                <TableCell className="text-right">
                    <ViewUserDialog user={user}>
                      <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </ViewUserDialog>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
}
