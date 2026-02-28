import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wind, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Supabase sends a recovery event via the hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    // Also check if there's a hash with type=recovery
    if (window.location.hash.includes('type=recovery')) {
      setReady(true);
    }
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Use at least 6 characters.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      navigate('/login');
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Wind className="h-10 w-10 text-primary mx-auto animate-pulse" />
          <p className="text-sm text-muted-foreground">Verifying reset link…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Wind className="h-7 w-7 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground">Set new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your new password below</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 6 characters" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <KeyRound className="mr-2 h-4 w-4" />
            {loading ? 'Updating…' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
