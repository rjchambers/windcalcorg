import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wind, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [company, setCompany] = useState('');
  const [peLicense, setPeLicense] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      supabase
        .from('profiles')
        .select('display_name, company, pe_license')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setDisplayName(data.display_name ?? '');
            setCompany(data.company ?? '');
            setPeLicense(data.pe_license ?? '');
          }
          setLoading(false);
        });
    }
  }, [user, authLoading, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName || null,
        company: company || null,
        pe_license: peLicense || null,
      })
      .eq('user_id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile saved', description: 'Your information has been updated.' });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Wind className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Wind className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-bold text-foreground">Profile Settings</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-lg px-6 py-12">
        <div className="rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-xl font-bold text-foreground mb-1">Engineer Profile</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This information will appear on generated PDF reports.
          </p>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ''} disabled className="opacity-60" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="John Smith, P.E." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company / Firm</Label>
              <Input id="company" value={company} onChange={e => setCompany(e.target.value)} placeholder="Smith Structural Engineers, LLC" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="peLicense">P.E. License Number</Label>
              <Input id="peLicense" value={peLicense} onChange={e => setPeLicense(e.target.value)} placeholder="FL PE #12345" />
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving…' : 'Save Profile'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
