import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wind, ArrowLeft, Users, FileText, Clock, Shield, Mail, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface OrgMember {
  id: string;
  user_id: string;
  role: string;
  accepted_at: string | null;
  profiles?: { display_name: string | null; pe_license: string | null } | null;
}

interface ReviewItem {
  id: string;
  calculation_type: string;
  status: string;
  submitted_at: string;
  submitted_by: string;
}

const FirmDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [role, setRole] = useState<string>('drafter');
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (!user) return;

    const load = async () => {
      const { data: membership } = await supabase
        .from('org_members')
        .select('org_id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!membership) { navigate('/create-firm'); return; }

      setOrgId(membership.org_id);
      setRole(membership.role);

      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', membership.org_id)
        .maybeSingle();
      setOrgName(org?.name ?? 'My Firm');

      const { data: mems } = await supabase
        .from('org_members')
        .select('id, user_id, role, accepted_at')
        .eq('org_id', membership.org_id);
      setMembers(mems ?? []);
      setLoading(false);
    };
    load();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>;
  }

  const isPE = role === 'owner' || role === 'pe';

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-4 w-4" /></Button>
            <Wind className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold text-foreground">{orgName}</span>
            <Badge variant="secondary" className="text-[10px]">{role.toUpperCase()}</Badge>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue={isPE ? 'review' : 'calcs'}>
          <TabsList>
            {isPE && <TabsTrigger value="review">Review Queue</TabsTrigger>}
            <TabsTrigger value="team">Team</TabsTrigger>
            {isPE && <TabsTrigger value="billing">Billing</TabsTrigger>}
            {!isPE && <TabsTrigger value="calcs">My Calculations</TabsTrigger>}
          </TabsList>

          {isPE && (
            <TabsContent value="review" className="space-y-4 mt-6">
              <Card>
                <CardHeader><CardTitle className="text-sm">Pending Review</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No calculations pending review.</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="team" className="space-y-4 mt-6">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Team Members</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {members.map(m => (
                  <div key={m.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
                    <div className="text-sm text-foreground">{m.user_id === user?.id ? 'You' : m.user_id.slice(0, 8)}</div>
                    <Badge variant={m.role === 'owner' ? 'default' : 'secondary'} className="text-[10px]">{m.role}</Badge>
                  </div>
                ))}
                {isPE && (
                  <div className="flex gap-2 pt-2">
                    <Input placeholder="Email to invite" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="text-sm" />
                    <Button size="sm" onClick={() => toast.info('Firm invitations coming soon')}><Mail className="mr-1 h-3 w-3" /> Invite</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isPE && (
            <TabsContent value="billing" className="space-y-4 mt-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Billing management coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {!isPE && (
            <TabsContent value="calcs" className="space-y-4 mt-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Your calculations will appear here. Use the calculator to create new ones.</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default FirmDashboard;
