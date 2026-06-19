import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCalculationStore } from '@/stores/calculation-store';
import { useFastenerStore } from '@/stores/fastener-store';
import { useTileStore } from '@/stores/tile-store';
import { useStrapStore } from '@/stores/strap-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Wind, ArrowLeft, FolderOpen, Calculator, Wrench, Plus, FileText, Clock, Link2, Loader2, ExternalLink, Home, Trash2 } from 'lucide-react';

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

type CalcKind = 'wind' | 'fastener' | 'tile' | 'strap';

const CALC_TABLE: Record<CalcKind, 'wind_calculations' | 'fastener_calculations' | 'tile_calculations' | 'strap_calculations'> = {
  wind: 'wind_calculations',
  fastener: 'fastener_calculations',
  tile: 'tile_calculations',
  strap: 'strap_calculations',
};

interface DeleteTarget {
  type: 'project' | CalcKind;
  id: string;
  name: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const loadWindCalc = useCalculationStore(s => s.loadCalculation);
  const resetWind = useCalculationStore(s => s.reset);
  const loadFastenerCalc = useFastenerStore(s => s.loadCalculation);
  const resetFastener = useFastenerStore(s => s.reset);
  const loadTileCalc = useTileStore(s => s.loadCalculation);
  const resetTile = useTileStore(s => s.reset);
  const loadStrapCalc = useStrapStore(s => s.loadCalculation);
  const resetStrap = useStrapStore(s => s.reset);
  const [projects, setProjects] = useState<Project[]>([]);
  const [windCalcs, setWindCalcs] = useState<CalcSummary[]>([]);
  const [fastenerCalcs, setFastenerCalcs] = useState<CalcSummary[]>([]);
  const [strapCalcs, setStrapCalcs] = useState<CalcSummary[]>([]);
  const [tileCalcs, setTileCalcs] = useState<CalcSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCalcId, setLoadingCalcId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleLoad = async (kind: CalcKind, id: string) => {
    setLoadingCalcId(id);
    const loaders: Record<CalcKind, (id: string) => Promise<void>> = {
      wind: loadWindCalc, fastener: loadFastenerCalc, tile: loadTileCalc, strap: loadStrapCalc,
    };
    await loaders[kind](id);
    setLoadingCalcId(null);
    navigate(kind === 'wind' ? '/calculator' : `/${kind}`);
  };

  const startNew = (kind: CalcKind) => {
    const resets: Record<CalcKind, () => void> = {
      wind: resetWind, fastener: resetFastener, tile: resetTile, strap: resetStrap,
    };
    resets[kind]();
    navigate(kind === 'wind' ? '/calculator' : `/${kind}`);
  };

  const removeCalcFromState = (kind: CalcKind, id: string) => {
    if (kind === 'wind') setWindCalcs(prev => prev.filter(c => c.id !== id));
    if (kind === 'fastener') setFastenerCalcs(prev => prev.filter(c => c.id !== id));
    if (kind === 'tile') setTileCalcs(prev => prev.filter(c => c.id !== id));
    if (kind === 'strap') setStrapCalcs(prev => prev.filter(c => c.id !== id));
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    if (deleteTarget.type === 'project') {
      // Remove all child calculations first, then the project itself.
      const pid = deleteTarget.id;
      await Promise.all([
        supabase.from('wind_calculations').delete().eq('project_id', pid),
        supabase.from('fastener_calculations').delete().eq('project_id', pid),
        supabase.from('tile_calculations').delete().eq('project_id', pid),
        supabase.from('strap_calculations').delete().eq('project_id', pid),
      ]);
      const { error } = await supabase.from('projects').delete().eq('id', pid);
      setDeleting(false);
      setDeleteTarget(null);
      if (error) { toast.error('Failed to delete project'); return; }
      setProjects(prev => prev.filter(p => p.id !== pid));
      setWindCalcs(prev => prev.filter(c => c.project_id !== pid));
      setFastenerCalcs(prev => prev.filter(c => c.project_id !== pid));
      setTileCalcs(prev => prev.filter(c => c.project_id !== pid));
      setStrapCalcs(prev => prev.filter(c => c.project_id !== pid));
      toast.success('Project deleted');
      return;
    }

    const kind = deleteTarget.type;
    const calc = [...windCalcs, ...fastenerCalcs, ...tileCalcs, ...strapCalcs].find(c => c.id === deleteTarget.id);
    const { error } = await supabase.from(CALC_TABLE[kind]).delete().eq('id', deleteTarget.id);
    if (error) { setDeleting(false); setDeleteTarget(null); toast.error('Failed to delete calculation'); return; }
    removeCalcFromState(kind, deleteTarget.id);

    // If this was the last calculation in its project, remove the now-empty project too.
    if (calc) {
      const pid = calc.project_id;
      const remaining = [...windCalcs, ...fastenerCalcs, ...tileCalcs, ...strapCalcs]
        .filter(c => c.id !== deleteTarget.id && c.project_id === pid);
      if (remaining.length === 0) {
        await supabase.from('projects').delete().eq('id', pid);
        setProjects(prev => prev.filter(p => p.id !== pid));
      }
    }
    setDeleting(false);
    setDeleteTarget(null);
    toast.success('Calculation deleted');
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Wind className="h-8 w-8 text-primary animate-pulse" /></div>;
  }

  const renderCalcRow = (kind: CalcKind, c: CalcSummary, iconColor: string) => (
    <div key={c.id} className="flex items-center gap-2 text-xs py-1.5 px-2 w-full rounded hover:bg-muted/50 transition-colors group">
      <button
        onClick={() => handleLoad(kind, c.id)}
        disabled={loadingCalcId === c.id}
        className="flex items-center gap-2 flex-1 text-left min-w-0"
      >
        {loadingCalcId === c.id ? <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" /> : <FileText className={`h-3 w-3 shrink-0 ${iconColor}`} />}
        <span className="text-foreground group-hover:text-primary transition-colors truncate">{c.name}</span>
        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </button>
      <span className="text-muted-foreground shrink-0">{new Date(c.updated_at).toLocaleDateString()}</span>
      <button
        onClick={() => setDeleteTarget({ type: kind, id: c.id, name: c.name })}
        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
        title="Delete calculation"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );

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
            <Button variant="outline" size="sm" onClick={() => startNew('wind')} className="text-xs sm:text-sm"><Plus className="mr-1 h-3 w-3" /><span className="hidden sm:inline">Wind</span><span className="sm:hidden">W</span></Button>
            <Button variant="outline" size="sm" onClick={() => startNew('fastener')} className="text-xs sm:text-sm"><Plus className="mr-1 h-3 w-3" /><span className="hidden sm:inline">Fastener</span><span className="sm:hidden">F</span></Button>
            <Button variant="outline" size="sm" onClick={() => startNew('tile')} className="text-xs sm:text-sm"><Plus className="mr-1 h-3 w-3" /><span className="hidden sm:inline">Tile</span><span className="sm:hidden">T</span></Button>
            <Button variant="outline" size="sm" onClick={() => startNew('strap')} className="text-xs sm:text-sm"><Plus className="mr-1 h-3 w-3" /><span className="hidden sm:inline">Strap</span><span className="sm:hidden">S</span></Button>
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
                const projStrapCalcs = strapCalcs.filter(c => c.project_id === proj.id);
                const hasCalcs = projWindCalcs.length > 0 || projFastCalcs.length > 0 || projTileCalcs.length > 0 || projStrapCalcs.length > 0;
                return (
                  <Card key={proj.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{proj.name}</h3>
                          {proj.address && <p className="text-xs text-muted-foreground mt-0.5">{proj.address}</p>}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calculator className="h-3 w-3" /> {projWindCalcs.length} wind</span>
                            <span className="flex items-center gap-1"><Wrench className="h-3 w-3" /> {projFastCalcs.length} fastener</span>
                            <span className="flex items-center gap-1"><Home className="h-3 w-3" /> {projTileCalcs.length} tile</span>
                            <span className="flex items-center gap-1"><Link2 className="h-3 w-3" /> {projStrapCalcs.length} strap</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(proj.updated_at).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => setDeleteTarget({ type: 'project', id: proj.id, name: proj.name })}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            title="Delete project and all its calculations"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {hasCalcs && (
                        <div className="mt-3 pt-3 border-t border-border space-y-1">
                          {projWindCalcs.map(c => renderCalcRow('wind', c, 'text-blue-500'))}
                          {projFastCalcs.map(c => renderCalcRow('fastener', c, 'text-orange-500'))}
                          {projTileCalcs.map(c => renderCalcRow('tile', c, 'text-emerald-500'))}
                          {projStrapCalcs.map(c => renderCalcRow('strap', c, 'text-violet-500'))}
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === 'project' ? 'Delete project?' : 'Delete calculation?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'project'
                ? `This permanently deletes "${deleteTarget?.name}" and all calculations inside it. This cannot be undone.`
                : `This permanently deletes "${deleteTarget?.name}". This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleConfirmDelete(); }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
