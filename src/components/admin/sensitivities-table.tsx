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
import { Trash2 } from 'lucide-react';
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


interface Sensitivity {
  id: string;
  authorId: string;
  platform: string;
  device: string;
  createdAt: { seconds: number, nanoseconds: number };
  geral: number;
  redDot: number;
  mira2x: number;
  mira4x: number;
  awm: number;
  olhadinha: number;
}

interface UserProfile {
  id: string;
  displayName: string;
}

interface SensitivitiesTableProps {
  sensitivities: Sensitivity[];
  users: UserProfile[];
}

export default function SensitivitiesTable({ sensitivities, users }: SensitivitiesTableProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const usersMap = new Map(users.map(u => [u.id, u.displayName]));

  const handleDelete = async () => {
    if (!firestore || !isDeleting) return;
    try {
      await deleteDoc(doc(firestore, 'sensitivities', isDeleting));
      toast({ title: "Sensibilidade deletada com sucesso!" });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({ variant: "destructive", title: "Erro ao deletar", description: "Ocorreu um erro ao tentar deletar a sensibilidade." });
    } finally {
        setShowDeleteDialog(false);
        setIsDeleting(null);
    }
  };
  
  const openDeleteDialog = (id: string) => {
    setIsDeleting(id);
    setShowDeleteDialog(true);
  }

  if (!sensitivities.length) {
    return <p className="text-muted-foreground">Nenhuma sensibilidade encontrada.</p>;
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden border-primary/20">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/20">
              <TableHead className="text-white">Autor</TableHead>
              <TableHead className="text-white">Plataforma</TableHead>
              <TableHead className="text-white">Dispositivo</TableHead>
              <TableHead className="text-white">Data</TableHead>
              <TableHead className="text-right text-white">Geral</TableHead>
              <TableHead className="text-right text-white">Red Dot</TableHead>
              <TableHead className="text-right text-white">2x</TableHead>
              <TableHead className="text-right text-white">4x</TableHead>
              <TableHead className="text-right text-white">AWM</TableHead>
              <TableHead className="text-right text-white">Olhadinha</TableHead>
              <TableHead className="text-right text-white">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sensitivities.map((sensi) => (
              <TableRow key={sensi.id} className="border-primary/20">
                <TableCell className="font-medium text-white">{usersMap.get(sensi.authorId) || sensi.authorId.substring(0,7)}</TableCell>
                <TableCell className="text-muted-foreground">{sensi.platform}</TableCell>
                <TableCell className="text-muted-foreground">{sensi.device}</TableCell>
                <TableCell className="text-muted-foreground">
                  {sensi.createdAt ? new Date(sensi.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell className="text-right text-primary font-semibold">{sensi.geral}</TableCell>
                <TableCell className="text-right text-primary font-semibold">{sensi.redDot}</TableCell>
                <TableCell className="text-right text-primary font-semibold">{sensi.mira2x}</TableCell>
                <TableCell className="text-right text-primary font-semibold">{sensi.mira4x}</TableCell>
                <TableCell className="text-right text-primary font-semibold">{sensi.awm}</TableCell>
                <TableCell className="text-right text-primary font-semibold">{sensi.olhadinha}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(sensi.id)}>
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
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente a sensibilidade.
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
