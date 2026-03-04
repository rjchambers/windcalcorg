import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Wind, Save, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [company, setCompany] = useState('');
  const [peLicense, setPeLicense] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [licenseState, setLicenseState] = useState('FL');
  const [licenseType, setLicenseType] = useState('PE');
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
        .select('display_name, company, pe_license, business_name, business_address, business_phone, business_email, license_state, license_type')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setDisplayName(data.display_name ?? '');
            setCompany(data.company ?? '');
            setPeLicense(data.pe_license ?? '');
            setBusinessName((data as any).business_name ?? '');
            setBusinessAddress((data as any).business_address ?? '');
            setBusinessPhone((data as any).business_phone ?? '');
            setBusinessEmail((data as any).business_email ?? '');
            setLicenseState((data as any).license_state ?? 'FL');
            setLicenseType((data as any).license_type ?? 'PE');
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
        business_name: businessName || null,
        business_address: businessAddress || null,
        business_phone: businessPhone || null,
        business_email: businessEmail || null,
        license_state: licenseState || null,
        license_type: licenseType || null,
      } as any)
      .eq('user_id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile saved', description: 'Your branding information has been updated.' });
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
              <span className="font-display text-lg font-bold text-foreground">Profile &amp; Report Branding</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-lg px-6 py-12">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Account */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground mb-1">Account</h2>
            <p className="text-xs text-muted-foreground mb-5">Your login credentials.</p>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ''} disabled className="opacity-60" />
            </div>
          </div>

          {/* Engineer Identity */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground mb-1">Engineer Identity</h2>
            <p className="text-xs text-muted-foreground mb-5">
              This appears in the signature block and "Prepared by" fields on your reports.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Full Name</Label>
                <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="John Smith, P.E." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseType">License Type</Label>
                  <Select value={licenseType} onValueChange={setLicenseType}>
                    <SelectTrigger id="licenseType"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PE">P.E.</SelectItem>
                      <SelectItem value="RA">R.A.</SelectItem>
                      <SelectItem value="SE">S.E.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseState">State</Label>
                  <Select value={licenseState} onValueChange={setLicenseState}>
                    <SelectTrigger id="licenseState"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="LA">Louisiana</SelectItem>
                      <SelectItem value="GA">Georgia</SelectItem>
                      <SelectItem value="SC">South Carolina</SelectItem>
                      <SelectItem value="NC">North Carolina</SelectItem>
                      <SelectItem value="AL">Alabama</SelectItem>
                      <SelectItem value="MS">Mississippi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="peLicense">License Number</Label>
                <Input id="peLicense" value={peLicense} onChange={e => setPeLicense(e.target.value)} placeholder="12345" />
              </div>
            </div>
          </div>

          {/* Report Branding */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground mb-1">Report Branding</h2>
            <p className="text-xs text-muted-foreground mb-5">
              Your firm's details for the cover page, headers, and footer of exported PDF reports.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Firm / Business Name</Label>
                <Input id="businessName" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Smith Structural Engineers, LLC" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Input id="businessAddress" value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} placeholder="1234 Brickell Ave, Suite 500, Miami, FL 33131" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Phone</Label>
                  <Input id="businessPhone" value={businessPhone} onChange={e => setBusinessPhone(e.target.value)} placeholder="(305) 555-1234" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Email</Label>
                  <Input id="businessEmail" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} placeholder="info@smithse.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Legacy Company Field</Label>
                <Input id="company" value={company} onChange={e => setCompany(e.target.value)} placeholder="(optional — overridden by Business Name if set)" className="opacity-70" />
                <p className="text-[10px] text-muted-foreground">Only used if Business Name is empty.</p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving…' : 'Save Profile & Branding'}
          </Button>

          <Separator />

          <div className="rounded-lg border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground mb-1">Digital Sign & Seal</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Manage your PE seal, signature, and signing certificate for digitally signing reports.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/pe-credentials">
                <Shield className="mr-2 h-4 w-4" /> PE Credentials & Signing
              </Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
