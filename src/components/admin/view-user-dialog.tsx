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
import { Badge } from '@/components/ui/badge';
import {
  User,
  X,
  CheckCircle2,
  ShieldCheck,
  Ticket,
  Zap,
  Ban,
  UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  photoURL: string;
  activatedProducts?: { [product: string]: string };
}

interface ViewUserDialogProps {
  user: UserProfile;
  children: React.ReactNode;
}

function InfoRow({ label, value, isMono = false, children }: { label: string, value?: string | null, isMono?: boolean, children?: React.ReactNode }) {
    if (!value && !children) return null;
    return (
        <div className="bg-black/20 p-3 rounded-md border border-white/5">
            <p className="text-xs text-muted-foreground">{label}</p>
            {children ? children : <p className={cn("text-sm font-semibold text-white", isMono && 'font-mono')}>{value}</p>}
        </div>
    )
}

export default function ViewUserDialog({ user, children }: ViewUserDialogProps) {
  const [open, setOpen] = useState(false);
  const activeProducts = user.activatedProducts ? Object.keys(user.activatedProducts) : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-[#0A0606] border-purple-500/20 p-0 text-white">
        <DialogHeader className="p-6 bg-black/20">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <UserCog className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                    <DialogTitle className="text-white text-lg">{user.username}</DialogTitle>
                    <DialogDescription>
                        User Account Details & Management
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
        
        <div className="px-6 py-6 space-y-6">
            <div className="flex items-center gap-4 rounded-lg p-4 border bg-green-500/10 border-green-500/20 text-green-300">
                <CheckCircle2 className="w-5 h-5" />
                <div>
                    <h3 className="font-bold">User is Active</h3>
                    <p className="text-sm">Status: <span className="capitalize">Active</span></p>
                </div>
                <Badge variant="outline" className="ml-auto capitalize text-xs font-bold bg-green-500/10 text-green-400 border-green-500/20">
                    Active
                </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2"><User className="w-4 h-4 text-purple-400" /> Basic Information</h3>
                    <InfoRow label="Username" value={user.username} />
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="Hardware ID (HWID)" value={user.id.substring(0, 16).toUpperCase()} isMono />
                    <InfoRow label="User ID" value={user.id} isMono />
                </div>
                 <div className="space-y-4">
                    <h3 className="font-bold text-white flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-purple-400" /> Account Details</h3>
                    <InfoRow label="Registration Date" value="20/04/2026" />
                    <InfoRow label="Last Login" value="20/04/2026" />
                    <InfoRow label="Cooldown" value="0 seconds" />
                    <InfoRow label="Two-Factor Auth">
                        <div className="flex items-center gap-2 text-sm font-semibold text-orange-400">
                            <Ban className="w-4 h-4" /> Disabled
                        </div>
                    </InfoRow>
                </div>
            </div>
            
             <div className="space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2"><Ticket className="w-4 h-4 text-purple-400" /> Active Subscriptions</h3>
                {activeProducts && activeProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {activeProducts.map(product => (
                            <div key={product} className="bg-black/20 p-3 rounded-md border border-white/10 flex items-center gap-3">
                                <Zap className="w-5 h-5 text-primary" />
                                <span className="font-semibold text-sm">{product}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-black/20 p-4 rounded-md border border-dashed border-white/20 text-center">
                        <p className="text-muted-foreground text-sm">No active subscriptions found for this user.</p>
                    </div>
                )}
            </div>
        </div>
         <DialogClose className="absolute right-6 top-6 rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none bg-black/30 hover:bg-white/10">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
