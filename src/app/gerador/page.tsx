'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, RefreshCw, Copy, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

type SensitivityProfile = {
    geral: number;
    redDot: number;
    mira2x: number;
    mira4x: number;
    awm: number;
    olhadinha: number;
};

function LoadingScreen() {
  return (
    <div className="flex flex-col gap-4 justify-center items-center h-screen bg-[#0d0404]">
        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-semibold text-white tracking-wider">Verificando acesso...</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-bold text-primary tracking-widest uppercase mb-3">
      <ChevronRight className="w-4 h-4" />
      {children}
    </h3>
  );
}

function OptimizationToggle({ title, subtitle, checked, onCheckedChange }: { title: string, subtitle: string, checked: boolean, onCheckedChange: (checked: boolean) => void }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h4 className="font-semibold text-white">{title}</h4>
                <p className={cn("text-xs uppercase tracking-wider", checked ? 'text-primary' : 'text-muted-foreground')}>{subtitle}</p>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
            />
        </div>
    );
}

export default function GeradorPage() {
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
        if (!user.activatedProducts?.includes('GERADOR-SENSI')) {
            toast({
                variant: 'destructive',
                title: 'Produto não ativado',
                description: 'Você não tem acesso ao GERADOR DE SENSI. Ative uma chave para continuar.',
            });
            router.push('/inicio');
        }
    }, [user, loading, router, toast]);

    const [platform, setPlatform] = useState('android');
    const [device, setDevice] = useState('');
    const [fps, setFps] = useState(true);
    const [fullHs, setFullHs] = useState(true);
    const [mira, setMira] = useState(false);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedSensi, setGeneratedSensi] = useState<SensitivityProfile | null>(null);

    const [showLoadingModal, setShowLoadingModal] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const loadingTexts = [
        "Analisando...",
        "Decifrando a melhor sensibilidade...",
        "Gerando...",
        "Sensibilidade Gerada!"
    ];

    const resultsRef = useRef<HTMLDivElement>(null);
    
    const aimlokIcon = PlaceHolderImages.find((img) => img.id === 'aimlok-sensi-icon');

    useEffect(() => {
        if (generatedSensi && !isGenerating) {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [generatedSensi, isGenerating]);


    const handleGenerate = () => {
        setIsGenerating(true);
        setShowLoadingModal(true);
        setLoadingStep(0);

        const stepDuration = 1200; // ms

        setTimeout(() => setLoadingStep(1), stepDuration);

        setTimeout(() => setLoadingStep(2), stepDuration * 2);

        setTimeout(() => {
            const sensis: SensitivityProfile = {
                geral: Math.floor(Math.random() * (180 - 120 + 1)) + 120,
                redDot: Math.floor(Math.random() * (180 - 120 + 1)) + 120,
                mira2x: Math.floor(Math.random() * (180 - 120 + 1)) + 120,
                mira4x: Math.floor(Math.random() * (180 - 120 + 1)) + 120,
                awm: Math.floor(Math.random() * (180 - 100 + 1)) + 100,
                olhadinha: Math.floor(Math.random() * (180 - 120 + 1)) + 120,
            };
            setGeneratedSensi(sensis);
            setLoadingStep(3);
        }, stepDuration * 3);

        setTimeout(() => {
            setShowLoadingModal(false);
            setIsGenerating(false);
        }, stepDuration * 4);
    };

    const handleCopy = () => {
        if (!generatedSensi) return;

        const textToCopy = `
Estilo: Balanceada
Geral: ${generatedSensi.geral}
Red Dot: ${generatedSensi.redDot}
Mira 2x: ${generatedSensi.mira2x}
Mira 4x: ${generatedSensi.mira4x}
AWM / Sniper: ${generatedSensi.awm}
Olhadinha: ${generatedSensi.olhadinha}
        `.trim().replace(/^\s+/gm, '');
        navigator.clipboard.writeText(textToCopy);
        toast({
            title: "Copiado!",
            description: "A sensibilidade foi copiada para a área de transferência.",
        });
    };

    if (loading || !user || !user.activatedProducts?.includes('GERADOR-SENSI')) {
        return <LoadingScreen />;
    }

    return (
        <div className="gerador-bg">
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
                {aimlokIcon && (
                    <Image
                        src={aimlokIcon.imageUrl}
                        alt={aimlokIcon.description}
                        width={48}
                        height={48}
                        data-ai-hint={aimlokIcon.imageHint}
                        className="rounded-md"
                    />
                )}
            </div>

            <div className="gerador-container">
                <header className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-headline text-primary tracking-wider">
                        GERADOR DE
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-headline text-white tracking-wider">
                        SENSIBILIDADE AIMLOCK
                    </h2>
                    <p className="text-sm text-muted-foreground tracking-widest mt-1">
                        OTIMIZADOR DE DPI & SENSI
                    </p>
                </header>

                <div className="space-y-8">
                    <Tabs defaultValue="android" onValueChange={setPlatform} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 gerador-tabs-list">
                            <TabsTrigger value="android">ANDROID</TabsTrigger>
                            <TabsTrigger value="ios">IOS</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="gerador-card">
                        <SectionTitle>MODELO DO DISPOSITIVO</SectionTitle>
                        <Input
                            type="text"
                            value={device}
                            onChange={(e) => setDevice(e.target.value)}
                            placeholder="Digite o modelo do seu celular"
                            className="w-full gerador-select"
                        />
                    </div>

                    <div className="gerador-card space-y-4">
                        <SectionTitle>FUNÇÕES & OTIMIZAÇÃO</SectionTitle>
                        <OptimizationToggle
                            title="FPS a Milhão (120+ FPS)"
                            subtitle={fps ? 'Ativado' : 'Desativado'}
                            checked={fps}
                            onCheckedChange={setFps}
                        />
                        <OptimizationToggle
                            title="Método Full HS"
                            subtitle={fullHs ? 'Ativado' : 'Desativado'}
                            checked={fullHs}
                            onCheckedChange={setFullHs}
                        />
                        <OptimizationToggle
                            title="Mira Não Passar"
                            subtitle={mira ? 'Ativado' : 'Desativado'}
                            checked={mira}
                            onCheckedChange={setMira}
                        />
                    </div>

                    <Button size="lg" className="w-full gerador-button" onClick={handleGenerate} disabled={isGenerating}>
                         {isGenerating ? (
                            <>
                                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                GERANDO...
                            </>
                        ) : (
                            <>
                                GERAR SENSIBILIDADE <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </Button>
                </div>

                {generatedSensi && (
                    <div ref={resultsRef} className="gerador-results-container mt-12">
                        <header className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-headline text-white tracking-wider">
                                SENSIBILIDADE GERADA
                            </h2>
                            <p className="text-sm text-muted-foreground tracking-widest mt-1">
                                ESTILO: <span className="font-bold text-white">BALANCEADA</span>
                            </p>
                        </header>

                        <div className="gerador-results-card">
                            <ul className="sensis-list">
                                <li className="sensis-item">
                                    <span className="text-muted-foreground">Geral</span>
                                    <span className="font-bold text-primary text-lg">{generatedSensi.geral}</span>
                                </li>
                                <li className="sensis-item">
                                    <span className="text-muted-foreground">Red Dot</span>
                                    <span className="font-bold text-primary text-lg">{generatedSensi.redDot}</span>
                                </li>
                                <li className="sensis-item">
                                    <span className="text-muted-foreground">Mira 2x</span>
                                    <span className="font-bold text-primary text-lg">{generatedSensi.mira2x}</span>
                                </li>
                                <li className="sensis-item">
                                    <span className="text-muted-foreground">Mira 4x</span>
                                    <span className="font-bold text-primary text-lg">{generatedSensi.mira4x}</span>
                                </li>
                                <li className="sensis-item">
                                    <span className="text-muted-foreground">AWM / Sniper</span>
                                    <span className="font-bold text-primary text-lg">{generatedSensi.awm}</span>
                                </li>
                                <li className="sensis-item">
                                    <span className="text-muted-foreground">Olhadinha</span>
                                    <span className="font-bold text-primary text-lg">{generatedSensi.olhadinha}</span>
                                </li>
                            </ul>
                        </div>

                        <div className="results-buttons grid grid-cols-2">
                            <Button variant="outline" className="gerador-results-button generate-again" onClick={handleGenerate}>
                                <RefreshCw /> Gerar
                            </Button>
                            <Button variant="secondary" className="gerador-results-button copy-all" onClick={handleCopy}>
                                <Copy /> Copiar
                            </Button>
                        </div>

                        <div className="gerador-tip-card">
                            <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <p>
                                Dica: Esta é uma sugestão gerada. Ajuste os valores conforme seu gosto e estilo de jogo.
                            </p>
                        </div>
                    </div>
                )}
                
                <footer className="text-center mt-8">
                    <p className="text-xs text-muted-foreground/50">
                        VERSÃO 1.0 • POWERED BY AIMLOCK.SENSI
                    </p>
                </footer>
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
