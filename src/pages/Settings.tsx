import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wind, ArrowLeft, Save, Shield, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SealUploader from '@/components/pe/SealUploader';
import SignatureCanvas from '@/components/pe/SignatureCanvas';
import { generateSigningKeypair, encryptPrivateKey } from '@/lib/pe-crypto';

interface ProfileData {
  display_name: string;
  company: string;
  pe_license: string;
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  license_state: string;
  license_type: string;
}

interface PEData {
  full_legal_name: string;
  pe_license_number: string;
  pe_state: string;
  engineering_discipline: string;
  firm_name: string;
  firm_address: string;
  firm_phone: string;
  firm_email: string;
  seal_image_path: string | null;
  signature_image_path: string | null;
  certificate_fingerprint: string | null;
  certificate_generated_at: string | null;
  certificate_expires_at: string | null;
  license_verified: boolean;
  license_status: string | null;
  license_verified_at: string | null;
}

const EMPTY_PROFILE: ProfileData = {
  display_name: '', company: '', pe_license: '',
  business_name: '', business_address: '', business_phone: '', business_email: '',
  license_state: 'FL', license_type: 'PE',
};

const EMPTY_PE: PEData = {
  full_legal_name: '', pe_license_number: '', pe_state: 'FL', engineering_discipline: 'Civil',
  firm_name: '', firm_address: '', firm_phone: '', firm_email: '',
  seal_image_path: null, signature_image_path: null,
  certificate_fingerprint: null, certificate_generated_at: null, certificate_expires_at: null,
  license_verified: false, license_status: null, license_verified_at: null,
};

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'account';

  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [pe, setPe] = useState<PEData>(EMPTY_PE);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPE, setSavingPE] = useState(false);
  const [hasPERow, setHasPERow] = useState(false);
  const [sigCanvasOpen, setSigCanvasOpen] = useState(false);
  const [sealUrl, setSealUrl] = useState<string | null>(null);
  const [sigUrl, setSigUrl] = useState<string | null>(null);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [certPassword, setCertPassword] = useState('');
  const [certPasswordConfirm, setCertPasswordConfirm] = useState('');

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [profRes, peRes] = await Promise.all([
      supabase.from('profiles').select('display_name, company, pe_license, business_name, business_address, business_phone, business_email, license_state, license_type').eq('user_id', user.id).maybeSingle(),
      supabase.from('pe_credentials').select('*').eq('user_id', user.id).maybeSingle(),
    ]);
    if (profRes.data) {
      const d = profRes.data as any;
      setProfile({
        display_name: d.display_name ?? '', company: d.company ?? '', pe_license: d.pe_license ?? '',
        business_name: d.business_name ?? '', business_address: d.business_address ?? '',
        business_phone: d.business_phone ?? '', business_email: d.business_email ?? '',
        license_state: d.license_state ?? 'FL', license_type: d.license_type ?? 'PE',
      });
    }
    if (peRes.data) {
      const d = peRes.data as any;
      setPe({
        full_legal_name: d.full_legal_name ?? '', pe_license_number: d.pe_license_number ?? '',
        pe_state: d.pe_state ?? 'FL', engineering_discipline: d.engineering_discipline ?? 'Civil',
        firm_name: d.firm_name ?? '', firm_address: d.firm_address ?? '',
        firm_phone: d.firm_phone ?? '', firm_email: d.firm_email ?? '',
        seal_image_path: d.seal_image_path, signature_image_path: d.signature_image_path,
        certificate_fingerprint: d.certificate_fingerprint, certificate_generated_at: d.certificate_generated_at,
        certificate_expires_at: d.certificate_expires_at, license_verified: d.license_verified ?? false,
        license_status: d.license_status, license_verified_at: d.license_verified_at,
      });
      setHasPERow(true);
      if (d.seal_image_path) {
        const { data: urlData } = await supabase.storage.from('pe-seals').createSignedUrl(d.seal_image_path, 3600);
        if (urlData?.signedUrl) setSealUrl(urlData.signedUrl);
      }
      if (d.signature_image_path) {
        const { data: urlData } = await supabase.storage.from('pe-signatures').createSignedUrl(d.signature_image_path, 3600);
        if (urlData?.signedUrl) setSigUrl(urlData.signedUrl);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) fetchAll();
  }, [user, authLoading, navigate, fetchAll]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({
      display_name: profile.display_name || null, company: profile.company || null,
      pe_license: profile.pe_license || null, business_name: profile.business_name || null,
      business_address: profile.business_address || null, business_phone: profile.business_phone || null,
      business_email: profile.business_email || null, license_state: profile.license_state || null,
      license_type: profile.license_type || null,
    } as any).eq('user_id', user.id);
    setSavingProfile(false);
    toast(error ? { title: 'Error', description: error.message, variant: 'destructive' } : { title: 'Saved', description: 'Profile updated.' });
  };

  const handleSavePE = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingPE(true);
    const payload = {
      full_legal_name: pe.full_legal_name || null, pe_license_number: pe.pe_license_number || null,
      pe_state: pe.pe_state, engineering_discipline: pe.engineering_discipline || null,
      firm_name: pe.firm_name || null, firm_address: pe.firm_address || null,
      firm_phone: pe.firm_phone || null, firm_email: pe.firm_email || null,
    } as any;
    let error;
    if (hasPERow) {
      ({ error } = await supabase.from('pe_credentials').update(payload).eq('user_id', user.id));
    } else {
      ({ error } = await supabase.from('pe_credentials').insert({ ...payload, user_id: user.id }));
      if (!error) setHasPERow(true);
    }
    setSavingPE(false);
    toast(error ? { title: 'Error', description: error.message, variant: 'destructive' } : { title: 'Saved', description: 'PE credentials updated.' });
  };

  const uploadSeal = async (file: File) => {
    if (!user) return;
    if (!hasPERow) { await supabase.from('pe_credentials').insert({ user_id: user.id } as any); setHasPERow(true); }
    const path = `${user.id}/seal.png`;
    const { error } = await supabase.storage.from('pe-seals').upload(path, file, { upsert: true });
    if (error) throw error;
    await supabase.from('pe_credentials').update({ seal_image_path: path, seal_uploaded_at: new Date().toISOString() } as any).eq('user_id', user.id);
    const { data: urlData } = await supabase.storage.from('pe-seals').createSignedUrl(path, 3600);
    if (urlData?.signedUrl) setSealUrl(urlData.signedUrl);
    setPe(prev => ({ ...prev, seal_image_path: path }));
  };

  const uploadSignatureFile = async (file: File) => {
    if (!user) return;
    if (!hasPERow) { await supabase.from('pe_credentials').insert({ user_id: user.id } as any); setHasPERow(true); }
    const path = `${user.id}/signature.png`;
    const { error } = await supabase.storage.from('pe-signatures').upload(path, file, { upsert: true });
    if (error) throw error;
    await supabase.from('pe_credentials').update({ signature_image_path: path, signature_uploaded_at: new Date().toISOString() } as any).eq('user_id', user.id);
    const { data: urlData } = await supabase.storage.from('pe-signatures').createSignedUrl(path, 3600);
    if (urlData?.signedUrl) setSigUrl(urlData.signedUrl);
    setPe(prev => ({ ...prev, signature_image_path: path }));
  };

  const handleDrawnSignature = async (dataUrl: string) => {
    setSigCanvasOpen(false);
    if (!user) return;
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await uploadSignatureFile(new File([blob], 'signature.png', { type: 'image/png' }));
  };

  const handleGenerateCertificate = async () => {
    if (!user || !certPassword || certPassword !== certPasswordConfirm) {
      toast({ title: 'Error', description: 'Passwords must match.', variant: 'destructive' });
      return;
    }
    setGeneratingCert(true);
    try {
      const { publicKeyPem, privateKeyJwk, fingerprint } = await generateSigningKeypair();
      const { encryptedBlob, salt, iv } = await encryptPrivateKey(privateKeyJwk, certPassword);
      const expiresAt = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString();
      if (!hasPERow) { await supabase.from('pe_credentials').insert({ user_id: user.id } as any); setHasPERow(true); }
      await supabase.from('pe_credentials').update({
        certificate_public_key: publicKeyPem, certificate_fingerprint: fingerprint,
        certificate_generated_at: new Date().toISOString(), certificate_expires_at: expiresAt,
        encrypted_private_key_blob: encryptedBlob, encrypted_private_key_salt: salt, encrypted_private_key_iv: iv,
      } as any).eq('user_id', user.id);
      setPe(prev => ({ ...prev, certificate_fingerprint: fingerprint, certificate_generated_at: new Date().toISOString(), certificate_expires_at: expiresAt }));
      setCertPassword(''); setCertPasswordConfirm('');
      toast({ title: 'Certificate Generated', description: `Fingerprint: ${fingerprint.slice(0, 16)}…` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setGeneratingCert(false); }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Wind className="h-8 w-8 text-primary animate-pulse" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center px-6 gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <Wind className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold text-foreground">Settings</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl px-6 py-8">
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="w-full">
            <TabsTrigger value="account" className="flex-1">Account</TabsTrigger>
            <TabsTrigger value="business" className="flex-1">Business / License</TabsTrigger>
            <TabsTrigger value="seal" className="flex-1">PE Seal & Signature</TabsTrigger>
          </TabsList>

          {/* TAB 1: Account */}
          <TabsContent value="account">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6 shadow-card space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground">Account</h2>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email ?? ''} disabled className="opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input value={profile.display_name} onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))} placeholder="John Smith, P.E." />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={profile.company} onChange={e => setProfile(p => ({ ...p, company: e.target.value }))} placeholder="Smith Engineering" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={savingProfile}>
                <Save className="mr-2 h-4 w-4" />{savingProfile ? 'Saving…' : 'Save Account'}
              </Button>
            </form>
          </TabsContent>

          {/* TAB 2: Business / License */}
          <TabsContent value="business">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6 shadow-card space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground">Business & License</h2>
                <div className="space-y-2">
                  <Label>Firm / Business Name</Label>
                  <Input value={profile.business_name} onChange={e => setProfile(p => ({ ...p, business_name: e.target.value }))} placeholder="Smith Structural Engineers, LLC" />
                </div>
                <div className="space-y-2">
                  <Label>Business Address</Label>
                  <Input value={profile.business_address} onChange={e => setProfile(p => ({ ...p, business_address: e.target.value }))} placeholder="1234 Brickell Ave, Miami, FL 33131" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={profile.business_phone} onChange={e => setProfile(p => ({ ...p, business_phone: e.target.value }))} placeholder="(305) 555-1234" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile.business_email} onChange={e => setProfile(p => ({ ...p, business_email: e.target.value }))} placeholder="info@smithse.com" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>License Type</Label>
                    <Select value={profile.license_type} onValueChange={v => setProfile(p => ({ ...p, license_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PE">P.E.</SelectItem>
                        <SelectItem value="RA">R.A.</SelectItem>
                        <SelectItem value="SE">S.E.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select value={profile.license_state} onValueChange={v => setProfile(p => ({ ...p, license_state: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['FL', 'TX', 'LA', 'GA', 'SC', 'NC', 'AL', 'MS'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>License #</Label>
                    <Input value={profile.pe_license} onChange={e => setProfile(p => ({ ...p, pe_license: e.target.value }))} placeholder="12345" />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={savingProfile}>
                <Save className="mr-2 h-4 w-4" />{savingProfile ? 'Saving…' : 'Save Business & License'}
              </Button>
            </form>
          </TabsContent>

          {/* TAB 3: PE Seal & Signature */}
          <TabsContent value="seal" className="space-y-6">
            <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Your credentials are stored securely and only used to sign documents you explicitly authorize.
              </p>
            </div>

            <form onSubmit={handleSavePE} className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6 shadow-card space-y-4">
                <h2 className="font-display text-base font-bold">PE Identity</h2>
                <div className="space-y-2">
                  <Label>Full Legal Name *</Label>
                  <Input value={pe.full_legal_name} onChange={e => setPe(p => ({ ...p, full_legal_name: e.target.value }))} placeholder="As on your PE license" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>FL P.E. License No. *</Label>
                    <Input value={pe.pe_license_number} onChange={e => setPe(p => ({ ...p, pe_license_number: e.target.value }))} placeholder="12345" />
                  </div>
                  <div className="space-y-2">
                    <Label>Discipline</Label>
                    <Select value={pe.engineering_discipline} onValueChange={v => setPe(p => ({ ...p, engineering_discipline: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Civil', 'Structural', 'Mechanical', 'Electrical'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {pe.license_verified && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" /> License verified
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-card space-y-6">
                <h2 className="font-display text-base font-bold">PE Seal Image *</h2>
                <SealUploader currentUrl={sealUrl} onUpload={uploadSeal} label="PE Seal (300×300px min, transparent PNG preferred)" />
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-card space-y-4">
                <h2 className="font-display text-base font-bold">Signature Image *</h2>
                <SealUploader currentUrl={sigUrl} onUpload={uploadSignatureFile} label="Upload signature PNG" maxSizeMb={2} previewSize={240} />
                <div className="text-center"><span className="text-xs text-muted-foreground">— OR —</span></div>
                <Button type="button" variant="outline" className="w-full" onClick={() => setSigCanvasOpen(true)}>
                  ✏️ Draw signature in browser
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={savingPE}>
                <Save className="mr-2 h-4 w-4" />{savingPE ? 'Saving…' : 'Save PE Credentials'}
              </Button>
            </form>

            {/* Certificate Section */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-card space-y-4">
              <h2 className="font-display text-base font-bold">Digital Signing Certificate</h2>
              {pe.certificate_fingerprint ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-600" /><span className="font-medium">Certificate Active</span></div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Fingerprint: <code className="bg-muted px-1 rounded">{pe.certificate_fingerprint.slice(0, 32)}…</code></p>
                    <p>Generated: {pe.certificate_generated_at ? new Date(pe.certificate_generated_at).toLocaleDateString() : '—'}</p>
                    <p>Expires: {pe.certificate_expires_at ? new Date(pe.certificate_expires_at).toLocaleDateString() : '—'}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" /> No signing certificate generated yet.
                </div>
              )}
              <div className="space-y-3">
                <div className="space-y-2"><Label>Signing Password</Label><Input type="password" value={certPassword} onChange={e => setCertPassword(e.target.value)} placeholder="Choose a strong password" /></div>
                <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" value={certPasswordConfirm} onChange={e => setCertPasswordConfirm(e.target.value)} placeholder="Confirm password" /></div>
                <Button onClick={handleGenerateCertificate} disabled={generatingCert || !certPassword || certPassword !== certPasswordConfirm} className="w-full">
                  {generatingCert ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</> : <><Shield className="mr-2 h-4 w-4" />{pe.certificate_fingerprint ? 'Regenerate Certificate' : 'Generate Signing Certificate'}</>}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <SignatureCanvas open={sigCanvasOpen} onClose={() => setSigCanvasOpen(false)} onAccept={handleDrawnSignature} />
    </div>
  );
};

export default Settings;
