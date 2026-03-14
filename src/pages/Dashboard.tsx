import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCalculationStore } from '@/stores/calculation-store';
import { useFastenerStore } from '@/stores/fastener-store';
import { useTileStore } from '@/stores/tile-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wind, ArrowLeft, FolderOpen, Calculator, Wrench, Plus, FileText, Clock, Link2, Loader2, ExternalLink, Home } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
  updated_at: string;
}

interface CalcSummary {
  id: string;
  name: string;
  project_id: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const loadWindCalc = useCalculationStore(s => s.loadCalculation);
  const loadFastenerCalc = useFastenerStore(s => s.loadCalculation);
  const loadTileCalc = useTileStore(s => s.loadCalculation);
  const [projects, setProjects] = useState<Project[]>([]);
  const [windCalcs, setWindCalcs] = useState<CalcSummary[]>([]);
  const [fastenerCalcs, setFastenerCalcs] = useState<CalcSummary[]>([]);
  const [strapCalcs, setStrapCalcs] = useState<CalcSummary[]>([]);
  const [tileCalcs, setTileCalcs] = useState<CalcSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCalcId, setLoadingCalcId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (!user) return;

    Promise.all([
      supabase.from('projects').select('id, name, address, created_at, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }),
      supabase.from('wind_calculations').select('id, name, project_id, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(50),
      supabase.from('fastener_calculations').select('id, name, project_id, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(50),
      supabase.from('strap_calculations').select('id, name, project_id, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(50),
      supabase.from('tile_calculations').select('id, name, project_id, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(50),
    ]).then(([projRes, windRes, fastRes, strapRes, tileRes]) => {
      setProjects(projRes.data ?? []);
      setWindCalcs(windRes.data ?? []);
      setFastenerCalcs(fastRes.data ?? []);
      setStrapCalcs((strapRes.data as CalcSummary[]) ?? []);
      setTileCalcs((tileRes.data as CalcSummary[]) ?? []);
      setLoading(false);
    });
  }, [user, authLoading, navigate]);

  const handleLoadWind = async (id: string) => {
    setLoadingCalcId(id);
    await loadWindCalc(id);
    setLoadingCalcId(null);
    navigate('/calculator');
  };

  const handleLoadFastener = async (id: string) => {
    setLoadingCalcId(id);
    await loadFastenerCalc(id);
    setLoadingCalcId(null);
    navigate('/fastener');
  };

  const handleLoadTile = async (id: string) => {
    setLoadingCalcId(id);
    await loadTileCalc(id);
    setLoadingCalcId(null);
    navigate('/tile');
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Wind className="h-8 w-8 text-primary animate-pulse" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-auto min-h-[4rem] items-center justify-between px-4 sm:px-6 py-2 gap-2">
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="h-4 w-4" /></Button>
            <Wind className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold text-foreground hidden sm:inline">Dashboard</span>
          </div>
          <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-end">
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm"><Link to="/calculator"><Plus className="mr-1 h-3 w-3" /><span className="hidden sm:inline">Wind</span><span className="sm:hidden">W</span></Link></Button>
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm"><Link to="/fastener"><Plus className="mr-1 h-3 w-3" /><span className="hidden sm:inline">Fastener</span><span className="sm:hidden">F</span></Link></Button>
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm"><Link to="/tile"><Plus className="mr-1 h-3 w-3" /><span className="hidden sm:inline">Tile</span><span className="sm:hidden">T</span></Link></Button>
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm"><Link to="/strap"><Plus className="mr-1 h-3 w-3" /><span className="hidden sm:inline">Strap</span><span className="sm:hidden">S</span></Link></Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card><CardContent className="flex items-center gap-4 p-6"><FolderOpen className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{projects.length}</p><p className="text-sm text-muted-foreground">Projects</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><Calculator className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{windCalcs.length}</p><p className="text-sm text-muted-foreground">Wind</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><Wrench className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{fastenerCalcs.length}</p><p className="text-sm text-muted-foreground">Fastener</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><Home className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{tileCalcs.length}</p><p className="text-sm text-muted-foreground">Tile</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-6"><Link2 className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{strapCalcs.length}</p><p className="text-sm text-muted-foreground">Strap</p></div></CardContent></Card>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Projects</h2>
          {projects.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><FolderOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">No projects yet. Create one from the calculator.</p></CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {projects.map(proj => {
                const projWindCalcs = windCalcs.filter(c => c.project_id === proj.id);
                const projFastCalcs = fastenerCalcs.filter(c => c.project_id === proj.id);
                const projTileCalcs = tileCalcs.filter(c => c.project_id === proj.id);
                return (
                  <Card key={proj.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{proj.name}</h3>
                          {proj.address && <p className="text-xs text-muted-foreground mt-0.5">{proj.address}</p>}
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calculator className="h-3 w-3" /> {projWindCalcs.length} wind</span>
                            <span className="flex items-center gap-1"><Wrench className="h-3 w-3" /> {projFastCalcs.length} fastener</span>
                            <span className="flex items-center gap-1"><Home className="h-3 w-3" /> {projTileCalcs.length} tile</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(proj.updated_at).toLocaleDateString()}
                        </div>
                      </div>

                      {(projWindCalcs.length > 0 || projFastCalcs.length > 0 || projTileCalcs.length > 0) && (
                        <div className="mt-3 pt-3 border-t border-border space-y-1">
                          {projWindCalcs.map(c => (
                            <button
                              key={c.id}
                              onClick={() => handleLoadWind(c.id)}
                              disabled={loadingCalcId === c.id}
                              className="flex items-center gap-2 text-xs py-1.5 px-2 w-full rounded hover:bg-muted/50 transition-colors text-left group"
                            >
                              {loadingCalcId === c.id ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : <FileText className="h-3 w-3 text-blue-500" />}
                              <span className="text-foreground group-hover:text-primary transition-colors">{c.name}</span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
                              <span className="text-muted-foreground ml-auto">{new Date(c.updated_at).toLocaleDateString()}</span>
                            </button>
                          ))}
                          {projFastCalcs.map(c => (
                            <button
                              key={c.id}
                              onClick={() => handleLoadFastener(c.id)}
                              disabled={loadingCalcId === c.id}
                              className="flex items-center gap-2 text-xs py-1.5 px-2 w-full rounded hover:bg-muted/50 transition-colors text-left group"
                            >
                              {loadingCalcId === c.id ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : <FileText className="h-3 w-3 text-orange-500" />}
                              <span className="text-foreground group-hover:text-primary transition-colors">{c.name}</span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
                              <span className="text-muted-foreground ml-auto">{new Date(c.updated_at).toLocaleDateString()}</span>
                            </button>
                          ))}
                          {projTileCalcs.map(c => (
                            <button
                              key={c.id}
                              onClick={() => handleLoadTile(c.id)}
                              disabled={loadingCalcId === c.id}
                              className="flex items-center gap-2 text-xs py-1.5 px-2 w-full rounded hover:bg-muted/50 transition-colors text-left group"
                            >
                              {loadingCalcId === c.id ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : <FileText className="h-3 w-3 text-emerald-500" />}
                              <span className="text-foreground group-hover:text-primary transition-colors">{c.name}</span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
                              <span className="text-muted-foreground ml-auto">{new Date(c.updated_at).toLocaleDateString()}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
