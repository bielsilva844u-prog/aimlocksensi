'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestore } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, KeyRound } from 'lucide-react';

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

interface GenerateKeyDialogProps {
  onGenerated?: (keys: LicenseKey[]) => void;
}

function generateKey(product: string, format?: string): string {
    if (format && format.trim() !== '' && format.includes('X')) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return format.replace(/X/g, () => chars.charAt(Math.floor(Math.random() * chars.length)));
    }

    const prefixMap: { [key: string]: string } = {
        'HEADTRICK': 'AIMLOCKH-',
        'AUXILIO-ANDROID': 'AIMLOCKAA-',
        'AUXILIO-IPHONE': 'AIMLOCKAI-',
        'GERADOR-SENSI': 'AIMLOCKS-',
    };
    const prefix = prefixMap[product] || `AIMLOCK-`;
    const randomPart = (Math.random().toString(36) + '00000000000000000').slice(2, 10).toUpperCase();
    return prefix + randomPart;
}

function createLicenseKey(product: string, duration: string, keyFormat: string): LicenseKey {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    key: generateKey(product, keyFormat),
    product,
    duration: `${duration} days`,
    status: 'active',
    usedBy: 'Not used',
    createdAt: {
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
    },
    authorId: 'admin',
  };
}

export default function GenerateKeyDialog({ onGenerated }: GenerateKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState('HEADTRICK');
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState('30');
  const [keyFormat, setKeyFormat] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating || quantity < 1) return;

    setIsGenerating(true);

    try {
        const generatedKeys = Array.from({ length: quantity }, () => createLicenseKey(product, duration, keyFormat));

        if (!firestore) {
            const storedKeys = JSON.parse(localStorage.getItem('localLicenseKeys') || '[]') as LicenseKey[];
            const nextKeys = [...generatedKeys, ...storedKeys];
            localStorage.setItem('localLicenseKeys', JSON.stringify(nextKeys));
            onGenerated?.(nextKeys);

            toast({
                title: `${quantity} ${quantity > 1 ? 'Keys Geradas' : 'Key Gerada'}!`,
                description: 'Firebase nao configurado. As chaves foram salvas localmente neste navegador.',
            });

            setOpen(false);
            setQuantity(1);
            setKeyFormat('');
            return;
        }

        const batch = writeBatch(firestore);
        
        for (const generatedKey of generatedKeys) {
            const keyRef = doc(collection(firestore, 'licenseKeys'));
            batch.set(keyRef, {
                key: generatedKey.key,
                product: generatedKey.product,
                duration: generatedKey.duration,
                status: generatedKey.status,
                usedBy: generatedKey.usedBy,
                createdAt: new Date(),
                authorId: generatedKey.authorId,
            });
        }

        await batch.commit();

        toast({
            title: `${quantity} ${quantity > 1 ? 'Keys Geradas' : 'Key Gerada'}!`,
            description: `As chaves foram geradas com sucesso.`,
        });
        
        setOpen(false);
        setQuantity(1);
        setKeyFormat('');

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar keys',
        description: 'Não foi possível gerar as chaves. Tente novamente.',
      });
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white font-bold">
          <PlusCircle className="mr-2 h-4 w-4" />
          Generate Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#1a0f0f] border-primary/20">
        <DialogHeader>
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-600/10 border border-green-600/30">
                    <KeyRound className="h-6 w-6 text-green-500" />
                </div>
                <div>
                    <DialogTitle className="text-white text-lg">Generate License Keys</DialogTitle>
                    <DialogDescription>
                        Create new license keys for your application
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="product" className="text-white">Subscription Plan *</Label>
                    <Select value={product} onValueChange={setProduct}>
                        <SelectTrigger id="product" className="gerador-select">
                            <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d0404] border-primary/30 text-white">
                            <SelectItem value="HEADTRICK">HEADTRICK</SelectItem>
                            <SelectItem value="AUXILIO-ANDROID">AUXILIO ANDROID</SelectItem>
                            <SelectItem value="AUXILIO-IPHONE">AUXILIO IPHONE</SelectItem>
                            <SelectItem value="GERADOR-SENSI">GERADOR DE SENSI</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-white">Quantity *</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="gerador-select"
                            min="1"
                            max="100"
                        />
                         <p className="text-xs text-muted-foreground mt-1">Number of keys to generate (1-100)</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="duration" className="text-white">Duration (days) *</Label>
                        <Input
                            id="duration"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="gerador-select"
                        />
                        <p className="text-xs text-muted-foreground mt-1">How long keys remain valid</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="keyFormat" className="text-white">Key Format (Optional)</Label>
                    <Input
                        id="keyFormat"
                        placeholder="e.g., AIMLOCK-XXXX-XXXX-XXXX"
                        value={keyFormat}
                        onChange={(e) => setKeyFormat(e.target.value)}
                        className="gerador-select font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Use X for random characters. Leave empty for default format.</p>
                </div>
            </div>
            <DialogFooter className="gap-2 sm:justify-end mt-4">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="hover:bg-white/5 hover:text-white">
                    Cancel
                </Button>
                <Button type="submit" disabled={isGenerating} className="bg-green-600 hover:bg-green-700 text-white font-bold">
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                    {isGenerating ? `Generating ${quantity} ${quantity === 1 ? 'key' : 'keys'}...` : 'Generate Keys'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
