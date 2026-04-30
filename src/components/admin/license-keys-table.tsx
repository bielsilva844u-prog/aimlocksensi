'use client';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import ViewKeyDialog from './view-key-dialog';

interface LicenseKey {
  id: string;
  key: string;
  product: string;
  duration: string;
  status: 'active' | 'used';
  usedBy: string;
  createdAt: { seconds: number, nanoseconds: number };
}

interface UserProfile {
  id: string;
  username: string;
}

interface LicenseKeysTableProps {
  keys: LicenseKey[];
  users: UserProfile[];
  onDeleteLocal?: (id: string) => void;
}

export default function LicenseKeysTable({ keys, users, onDeleteLocal }: LicenseKeysTableProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const usersMap = new Map(users.map(u => [u.id, u.username]));

  const handleDelete = async () => {
    if (!keyToDelete) return;
    if (keyToDelete.startsWith('local-')) {
      onDeleteLocal?.(keyToDelete);
      toast({ title: "Key deletada com sucesso!" });
      setShowDeleteDialog(false);
      setKeyToDelete(null);
      return;
    }
    if (!firestore) return;

    try {
      await deleteDoc(doc(firestore, 'licenseKeys', keyToDelete));
      toast({ title: "Key deletada com sucesso!" });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({ variant: "destructive", title: "Erro ao deletar", description: "Ocorreu um erro ao tentar deletar a key." });
    } finally {
        setShowDeleteDialog(false);
        setKeyToDelete(null);
    }
  };
  
  const openDeleteDialog = (id: string) => {
    setKeyToDelete(id);
    setShowDeleteDialog(true);
  }

  if (!keys.length) {
    return <p className="text-center py-8 text-muted-foreground">Nenhuma license key encontrada.</p>;
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden border-primary/20">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/20 hover:bg-transparent">
              <TableHead className="text-white">Key</TableHead>
              <TableHead className="text-white">Subscription</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Used By</TableHead>
              <TableHead className="text-white">Created</TableHead>
              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id} className="border-primary/20">
                <TableCell className="font-mono text-xs text-white">{key.key}</TableCell>
                <TableCell>
                    <div className="font-medium text-white">{key.product}</div>
                    <div className="text-xs text-muted-foreground">{key.duration}</div>
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className={cn(
                        "capitalize text-xs font-bold",
                        key.status === 'active' && 'bg-green-500/10 text-green-400 border-green-500/20',
                        key.status === 'used' && 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
                    )}>
                        {key.status}
                    </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{usersMap.get(key.usedBy) || 'Not used'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {key.createdAt ? new Date(key.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <ViewKeyDialog licenseKey={key} usedByUsername={usersMap.get(key.usedBy) || 'Not used'}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4 text-blue-400" />
                    </Button>
                  </ViewKeyDialog>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(key.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#1a0f0f] border-primary/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente a license key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="gerador-results-button copy-all">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
