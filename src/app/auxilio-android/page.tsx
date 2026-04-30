'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Target,
  Settings,
  SlidersHorizontal,
  Package,
  X,
  RefreshCw,
  Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

function LoadingScreen() {
  return (
    <div className="flex flex-col gap-4 justify-center items-center h-screen bg-[#0d0404]">
      <RefreshCw className="h-10 w-10 animate-spin text-primary" />
      <p className="text-lg font-semibold text-white tracking-wider">
        Verificando acesso...
      </p>
    </div>
  );
}

export default function AuxilioPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return; // Wait until loading is complete
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Acesso Negado',
        description: 'Você precisa estar logado para acessar esta página.',
      });
      router.push('/login');
      return;
    }
    if (!user.activatedProducts?.includes('AUXILIO-ANDROID')) {
      toast({
        variant: 'destructive',
        title: 'Produto não ativado',
        description:
          'Você não tem acesso ao AUXILIO DE MIRA ANDROID. Ative uma chave para continuar.',
      });
      router.push('/inicio');
    }
  }, [user, loading, router, toast]);

  const [activeTab, setActiveTab] = useState('aimbot');
  const [precision, setPrecision] = useState(false);
  const [diminuirRecuo, setDiminuirRecuo] = useState(false);
  const [forcarTravada, setForcarTravada] = useState('cabeça');

  const [isInjecting, setIsInjecting] = useState(false);
  const [injectionCompleted, setInjectionCompleted] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingTexts = [
    'Analisando sistema...',
    'Aplicando configurações...',
    'Injetando...',
    'Injetado com sucesso!',
  ];

  const aimlokIcon = PlaceHolderImages.find(
    (img) => img.id === 'aimlok-sensi-icon'
  );

  const tabs = [
    { id: 'aimbot', icon: <Target className="w-6 h-6" /> },
    { id: 'settings', icon: <Settings className="w-6 h-6" /> },
    { id: 'adjustments', icon: <SlidersHorizontal className="w-6 h-6" /> },
    { id: 'extra', icon: <Package className="w-6 h-6" /> },
  ];

  const handleInject = () => {
    setIsInjecting(true);
    setShowLoadingModal(true);
    setLoadingStep(0);
    setInjectionCompleted(false);

    const stepDuration = 1200; // ms

    setTimeout(() => setLoadingStep(1), stepDuration);
    setTimeout(() => setLoadingStep(2), stepDuration * 2);
    setTimeout(() => {
      setLoadingStep(3);
      setInjectionCompleted(true);
    }, stepDuration * 3);

    setTimeout(() => {
      setShowLoadingModal(false);
      setIsInjecting(false);
    }, stepDuration * 4);
  };

  const handleOpenGame = () => {
    // This will attempt to open the Free Fire app via its URL scheme.
    // It will only work if the app is installed.
    window.location.href = 'freefire://';
  };

  const handleOpenGameMax = () => {
    // This will attempt to open the Free Fire Max app via its URL scheme.
    // It will only work if the app is installed.
    window.location.href = 'freefiremax://';
  };

  if (
    loading ||
    !user ||
    !user.activatedProducts?.includes('AUXILIO-ANDROID')
  ) {
    return <LoadingScreen />;
  }

  return (
    <div className="headtrick-panel-bg">
      <div className="panel-container">
        {/* Sidebar */}
        <div className="panel-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'sidebar-button',
                activeTab === tab.id && 'active'
              )}
            >
              {tab.icon}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="panel-main">
          {/* Header */}
          <div className="panel-header">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5" />
              <h1 className="text-lg font-bold tracking-wider">
                AUXILIO DE MIRA ANDROID
              </h1>
            </div>
            <Link href="/inicio" className="close-button">
              <X className="w-4 h-4" />
            </Link>
          </div>

          {/* Body */}
          <div className="panel-body justify-between">
            <div className="flex flex-col gap-6">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="precision"
                  checked={precision}
                  onCheckedChange={(c) => setPrecision(!!c)}
                  className="w-5 h-5 rounded-[4px] border-muted-foreground/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor="precision"
                  className="text-base text-white font-medium -translate-y-px"
                >
                  Precision
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="diminuir-recuo"
                  checked={diminuirRecuo}
                  onCheckedChange={(c) => setDiminuirRecuo(!!c)}
                  className="w-5 h-5 rounded-[4px] border-muted-foreground/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor="diminuir-recuo"
                  className="text-base text-white font-medium -translate-y-px"
                >
                  Diminuir recuo
                </Label>
              </div>

              <div className="space-y-3 pt-6">
                <Label className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                  FORÇAR TRAVADA:
                </Label>
                <Select value={forcarTravada} onValueChange={setForcarTravada}>
                  <SelectTrigger className="w-full gerador-select text-base h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d0404] border-primary/30 text-white">
                    <SelectItem value="cabeça">Cabeça</SelectItem>
                    <SelectItem value="pescoço">Pescoço</SelectItem>
                    <SelectItem value="peito">Peito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-8">
              <Button
                size="lg"
                className="w-full gerador-button text-base tracking-widest font-bold h-14"
                onClick={handleInject}
                disabled={isInjecting}
              >
                {isInjecting ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    INJETANDO...
                  </>
                ) : injectionCompleted ? (
                  'RE-INJETAR'
                ) : (
                  'INJETAR'
                )}
              </Button>
              {injectionCompleted && (
                <>
                  <Button
                    size="lg"
                    className="w-full gerador-button text-base tracking-widest font-bold h-14"
                    onClick={handleOpenGame}
                  >
                    <Rocket className="mr-2 h-5 w-5" />
                    ABRIR FREE FIRE
                  </Button>
                  <Button
                    size="lg"
                    className="w-full gerador-button text-base tracking-widest font-bold h-14"
                    onClick={handleOpenGameMax}
                  >
                    <Rocket className="mr-2 h-5 w-5" />
                    ABRIR FREE FIRE MAX
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="panel-footer">
            <p>Todos os direitos reservados</p>
            <div
              className="flex justify-center items-center gap-1.5 text-primary font-bold"
              style={{ margin: '4px 0' }}
            >
              {aimlokIcon && (
                <Image
                  src={aimlokIcon.imageUrl}
                  alt={aimlokIcon.description}
                  width={20}
                  height={20}
                  data-ai-hint={aimlokIcon.imageHint}
                />
              )}
              <span>aimlock.sensi</span>
            </div>
          </div>
        </div>
      </div>
      {showLoadingModal && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
          <RefreshCw className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-center text-lg font-semibold text-white tracking-wider">
            {loadingTexts[loadingStep]}
          </p>
        </div>
      )}
    </div>
  );
}
