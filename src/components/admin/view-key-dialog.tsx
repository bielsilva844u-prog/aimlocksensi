'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  KeyRound,
  Copy,
  User,
  ShieldAlert,
  CheckCircle2,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface LicenseKey {
  id: string;
  key: string;
  product: string;
  duration: string;
  status: 'active' | 'used';
  usedBy: string;
  createdAt: { seconds: number; nanoseconds: number };
}

interface ViewKeyDialogProps {
  licenseKey: LicenseKey;
  usedByUsername: string;
  children: React.ReactNode;
}

function InfoRow({ label, value, isMono = false }: { label: string, value: string | undefined, isMono?: boolean }) {
    if (!value) return null;
    return (
        <div className="bg-black/20 p-3 rounded-md border border-white/5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn("text-sm font-semibold text-white", isMono && 'font-mono')}>{value}</p>
        </div>
    )
}

export default function ViewKeyDialog({ licenseKey, usedByUsername, children }: ViewKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "A chave foi copiada para a área de transferência.",
    });
  };

  const createdDate = licenseKey.createdAt ? format(new Date(licenseKey.createdAt.seconds * 1000), 'dd/MM/yyyy') : 'N/A';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl bg-[#0A0606] border-primary/20 p-0 text-white">
        <DialogHeader className="p-6">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
                    <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <DialogTitle className="text-white text-lg font-mono">{licenseKey.key}</DialogTitle>
                    <DialogDescription>
                        License Key Details & Information
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
        
        <div className="px-6 pb-6 space-y-6">
            <div className={cn(
                "flex items-center gap-4 rounded-lg p-4 border",
                 licenseKey.status === 'used' ? 'bg-zinc-500/10 border-zinc-500/20 text-zinc-300' : 'bg-green-500/10 border-green-500/20 text-green-300'
            )}>
                {licenseKey.status === 'used' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                <div>
                    <h3 className="font-bold">{licenseKey.status === 'used' ? 'Key is Used' : 'Key is Active'}</h3>
                    <p className="text-sm">Status: <span className="capitalize">{licenseKey.status}</span></p>
                </div>
                <Badge variant="outline" className={cn(
                    "ml-auto capitalize text-xs font-bold",
                    licenseKey.status === 'active' && 'bg-green-500/10 text-green-400 border-green-500/20',
                    licenseKey.status === 'used' && 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
                )}>
                    {licenseKey.status}
                </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2"><KeyRound className="w-4 h-4 text-primary" /> Key Information</h3>
                    
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">License Key</Label>
                        <div className="relative">
                            <Input value={licenseKey.key} readOnly className="gerador-select pr-10 font-mono text-xs" />
                            <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => handleCopy(licenseKey.key)}>
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <InfoRow label="Subscription Plan" value={licenseKey.product} />
                     <InfoRow label="Status" value={licenseKey.status.charAt(0).toUpperCase() + licenseKey.status.slice(1)} />

                </div>
                 <div className="space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Usage Information</h3>
                    <InfoRow label="Used By" value={usedByUsername === 'Not used' ? 'N/A' : usedByUsername} />
                    <InfoRow label="Created Date" value={createdDate} />
                    <InfoRow label="Duration" value={licenseKey.duration} />
                    <InfoRow label="Key ID" value={licenseKey.id} isMono={true} />
                </div>
            </div>
            
             <div className="space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-primary" /> Administrative Actions</h3>
                <div className="flex gap-4">
                     <Button variant="destructive">
                        Delete Key
                    </Button>
                </div>
            </div>
        </div>
         <DialogClose className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
