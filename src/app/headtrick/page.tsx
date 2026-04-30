'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Target, Settings, SlidersHorizontal, Package, X, RefreshCw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import FeatureCard from '@/components/feature-card';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

function LoadingScreen() {
  return (
    <div className="flex flex-col gap-4 justify-center items-center h-screen bg-[#0d0404]">
        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-semibold text-white tracking-wider">Verificando acesso...</p>
    </div>
  );
}

export default function HeadtrickPage() {
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
    if (!user.activatedProducts?.includes('HEADTRICK')) {
        toast({
            variant: 'destructive',
            title: 'Produto não ativado',
            description: 'Você não tem acesso ao HEADTRICK. Ative uma chave para continuar.',
        });
        router.push('/inicio');
    }
  }, [user, loading, router, toast]);

  const [activeTab, setActiveTab] = useState('aimbot');
  const [silentAim, setSilentAim] = useState(false);
  const [noRecoil, setNoRecoil] = useState(true);
  const [fov, setFov] = useState(15);

  const aimlokIcon = PlaceHolderImages.find((img) => img.id === 'aimlok-sensi-icon');

  const tabs = [
    { id: 'aimbot', icon: <Target className="w-6 h-6" /> },
    { id: 'settings', icon: <Settings className="w-6 h-6" /> },
    { id: 'adjustments', icon: <SlidersHorizontal className="w-6 h-6" /> },
    { id: 'extra', icon: <Package className="w-6 h-6" /> },
  ];
  
  if (loading || !user || !user.activatedProducts?.includes('HEADTRICK')) {
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
              <h1 className="text-lg font-bold tracking-wider">HEADTRICK</h1>
            </div>
            <Link href="/inicio" className="close-button">
              <X className="w-4 h-4" />
            </Link>
          </div>

          {/* Body */}
          <div className="panel-body">
            <FeatureCard
              title="Silent Aim"
              risk="risk"
              description="Aumente em 25% a hitbox de capa."
              checked={silentAim}
              onCheckedChange={setSilentAim}
            />
            <FeatureCard
              title="No Recoil"
              risk="baixo"
              description="Remove completamente o recuo das armas."
              checked={noRecoil}
              onCheckedChange={setNoRecoil}
            />
            <div className="slider-row">
                <label htmlFor="fov-slider" className="text-white font-medium">FOV</label>
                <Slider
                    id="fov-slider"
                    value={[fov]}
                    onValueChange={(value) => setFov(value[0])}
                    max={100}
                    step={1}
                />
                <span className="slider-value">{fov}</span>
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
    </div>
  );
}
