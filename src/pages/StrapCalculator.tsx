import { useState } from 'react';
import { Wind, Wrench, ArrowLeft, Link2, Home, Save, LayoutDashboard, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useStrapStore } from '@/stores/strap-store';
import { useAuth } from '@/contexts/AuthContext';
import StrapForm from '@/components/strap/StrapForm';
import StrapResults from '@/components/strap/StrapResults';
import StrapPdfExportButton from '@/components/pdf/StrapPdfExportButton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const StrapSavePopover = () => {
  const { user } = useAuth();
  const { saveCalculation, currentCalcId } = useStrapStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    if (!user) { toast.error('Create a free account to save calculations.'); navigate('/signup'); return; }
    if (!name.trim()) { toast.error('Project name is required'); return; }
    setSaving(true);
    const id = await saveCalculation(user.id, name, address);
    setSaving(false);
    if (id) { toast.success('Saved to Dashboard'); setOpen(false); }
    else toast.error('Failed to save');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm"><Save className="mr-1 h-4 w-4" /> Save</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Project Name *</Label>
          <Input placeholder="e.g. Smith Residence" value={name} onChange={e => setName(e.target.value)} className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Site Address</Label>
          <Input placeholder="123 Main St, Miami" value={address} onChange={e => setAddress(e.target.value)} className="text-sm" />
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full" size="sm">
          {saving ? 'Saving…' : currentCalcId ? 'Update' : 'Save to Dashboard'}
        </Button>
      </PopoverContent>
    </Popover>
  );
};

const StrapCalculatorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reset = useStrapStore(s => s.reset);
  const currentCalcId = useStrapStore(s => s.currentCalcId);

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
              <Link2 className="h-5 w-5 text-primary" />
              <span className="font-display text-sm font-semibold text-foreground">Strap Calc HVHZ</span>
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/tile')} className="text-muted-foreground">
              <Home className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Tile</span>
            </Button>
            <Button variant="secondary" size="sm" className="pointer-events-none">
              <Link2 className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Strap</span>
            </Button>
            {currentCalcId && (
              <Button variant="ghost" size="sm" onClick={() => { reset(); toast.success('Started a new calculation'); }} title="Start a new calculation">
                <FilePlus className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">New</span>
              </Button>
            )}
            <StrapSavePopover />
            <StrapPdfExportButton />
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[420px_1fr]">
        <div className="border-r border-border bg-card/30 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <StrapForm />
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <StrapResults />
        </div>
      </div>
    </div>
  );
};

export default StrapCalculatorPage;
