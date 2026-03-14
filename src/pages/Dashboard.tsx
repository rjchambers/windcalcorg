import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind, ArrowLeft, FolderOpen, Calculator, Wrench, Plus, FileText, Clock, Link2 } from 'lucide-react';

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [windCalcs, setWindCalcs] = useState<CalcSummary[]>([]);
  const [fastenerCalcs, setFastenerCalcs] = useState<CalcSummary[]>([]);
  const [strapCalcs, setStrapCalcs] = useState<CalcSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (!user) return;

    Promise.all([
      supabase.from('projects').select('id, name, address, created_at, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }),
      supabase.from('wind_calculations').select('id, name, project_id, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(50),
      supabase.from('fastener_calculations').select('id, name, project_id, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(50),
      supabase.from('strap_calculations').select('id, name, project_id, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(50),
    ]).then(([projRes, windRes, fastRes, strapRes]) => {
      setProjects(projRes.data ?? []);
      setWindCalcs(windRes.data ?? []);
      setFastenerCalcs(fastRes.data ?? []);
      setStrapCalcs((strapRes.data as CalcSummary[]) ?? []);
      setLoading(false);
    });
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Wind className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  }

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name ?? 'Unknown Project';
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Wind className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold text-foreground">Dashboard</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/calculator"><Plus className="mr-1 h-3 w-3" /> Wind Calc</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/fastener"><Plus className="mr-1 h-3 w-3" /> Fastener Calc</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/strap"><Plus className="mr-1 h-3 w-3" /> Strap Calc</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <FolderOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-sm text-muted-foreground">Projects</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Calculator className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{windCalcs.length}</p>
                <p className="text-sm text-muted-foreground">Wind Calculations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Wrench className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{fastenerCalcs.length}</p>
                <p className="text-sm text-muted-foreground">Fastener Calculations</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects */}
        <div>
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Projects</h2>
          {projects.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No projects yet. Create one from the calculator.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {projects.map(proj => {
                const projWindCalcs = windCalcs.filter(c => c.project_id === proj.id);
                const projFastCalcs = fastenerCalcs.filter(c => c.project_id === proj.id);
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
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(proj.updated_at).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Calculations list */}
                      {(projWindCalcs.length > 0 || projFastCalcs.length > 0) && (
                        <div className="mt-3 pt-3 border-t border-border space-y-1">
                          {projWindCalcs.map(c => (
                            <div key={c.id} className="flex items-center gap-2 text-xs py-1">
                              <FileText className="h-3 w-3 text-blue-500" />
                              <span className="text-foreground">{c.name}</span>
                              <span className="text-muted-foreground ml-auto">{new Date(c.updated_at).toLocaleDateString()}</span>
                            </div>
                          ))}
                          {projFastCalcs.map(c => (
                            <div key={c.id} className="flex items-center gap-2 text-xs py-1">
                              <FileText className="h-3 w-3 text-orange-500" />
                              <span className="text-foreground">{c.name}</span>
                              <span className="text-muted-foreground ml-auto">{new Date(c.updated_at).toLocaleDateString()}</span>
                            </div>
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
