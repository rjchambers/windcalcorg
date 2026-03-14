import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind, ArrowLeft, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const CreateFirm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!user || !name.trim()) { toast.error('Firm name is required'); return; }
    setCreating(true);

    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({ name: name.trim(), created_by: user.id })
      .select('id')
      .single();

    if (orgErr || !org) { toast.error('Failed to create firm'); setCreating(false); return; }

    const { error: memErr } = await supabase
      .from('org_members')
      .insert({ org_id: org.id, user_id: user.id, role: 'owner', accepted_at: new Date().toISOString(), invited_by: user.id });

    if (memErr) { toast.error('Firm created but failed to add you as owner'); setCreating(false); return; }

    toast.success('Firm account created!');
    navigate('/firm');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center px-6 gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-4 w-4" /></Button>
          <Wind className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold text-foreground">Create Firm Account</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-md px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> New Firm Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Firm Name</Label>
              <Input placeholder="e.g. Coastal Engineering LLC" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <Button onClick={handleCreate} disabled={creating} className="w-full">
              {creating ? 'Creating…' : 'Create Firm Account'}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              After creating, you can invite team members and manage PE review workflows.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateFirm;
