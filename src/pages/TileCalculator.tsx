import { useState } from 'react';
import { Wind, ArrowLeft, Wrench, Link2, Home, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTileStore } from '@/stores/tile-store';
import { useAuth } from '@/contexts/AuthContext';
import TileForm from '@/components/tile/TileForm';
import TileResults from '@/components/tile/TileResults';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

const TileCalculator = () => {
  const navigate = useNavigate();
  const { outputs } = useTileStore();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState('inputs');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-primary" />
              <span className="font-display text-sm font-semibold text-foreground">HVHZ Calc Pro</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {user && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-muted-foreground hidden md:flex">
                <LayoutDashboard className="mr-1 h-4 w-4" /> Dashboard
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/calculator')} className="text-muted-foreground">
              <Wind className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Wind Uplift</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/fastener')} className="text-muted-foreground">
              <Wrench className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Fastener</span>
            </Button>
            <Button variant="secondary" size="sm" className="pointer-events-none" aria-selected="true">
              <Home className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Tile Calc</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/strap')} className="text-muted-foreground">
              <Link2 className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Strap</span>
            </Button>
          </div>
        </div>
      </header>

      {isMobile ? (
        <Tabs value={mobileTab} onValueChange={setMobileTab} className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
          <TabsList className="w-full rounded-none border-b border-border">
            <TabsTrigger value="inputs" className="flex-1">Inputs</TabsTrigger>
            <TabsTrigger value="results" className="flex-1">Results</TabsTrigger>
          </TabsList>
          <TabsContent value="inputs" className="flex-1 overflow-y-auto m-0"><TileForm /></TabsContent>
          <TabsContent value="results" className="flex-1 overflow-y-auto m-0"><TileResults /></TabsContent>
        </Tabs>
      ) : (
        <div className="grid lg:grid-cols-[420px_1fr]">
          <div className="border-r border-border bg-card/30 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
            <TileForm />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
            <TileResults />
          </div>
        </div>
      )}
    </div>
  );
};

export default TileCalculator;
