import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wind, ArrowLeft, Save, Shield, Upload, History, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SealUploader from '@/components/pe/SealUploader';
import SignatureCanvas from '@/components/pe/SignatureCanvas';
import { generateSigningKeypair, encryptPrivateKey } from '@/lib/pe-crypto';

interface PECred {
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

const EMPTY: PECred = {
  full_legal_name: '',
  pe_license_number: '',
  pe_state: 'FL',
  engineering_discipline: 'Civil',
  firm_name: '',
  firm_address: '',
  firm_phone: '',
  firm_email: '',
  seal_image_path: null,
  signature_image_path: null,
  certificate_fingerprint: null,
  certificate_generated_at: null,
  certificate_expires_at: null,
  license_verified: false,
  license_status: null,
  license_verified_at: null,
};

const PECredentials = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cred, setCred] = useState<PECred>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasRow, setHasRow] = useState(false);
  const [sigCanvasOpen, setSigCanvasOpen] = useState(false);
  const [sealUrl, setSealUrl] = useState<string | null>(null);
  const [sigUrl, setSigUrl] = useState<string | null>(null);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [certPassword, setCertPassword] = useState('');
  const [certPasswordConfirm, setCertPasswordConfirm] = useState('');

  const fetchCreds = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('pe_credentials')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) {
      setCred({
        full_legal_name: (data as any).full_legal_name ?? '',
        pe_license_number: (data as any).pe_license_number ?? '',
        pe_state: (data as any).pe_state ?? 'FL',
        engineering_discipline: (data as any).engineering_discipline ?? 'Civil',
        firm_name: (data as any).firm_name ?? '',
        firm_address: (data as any).firm_address ?? '',
        firm_phone: (data as any).firm_phone ?? '',
        firm_email: (data as any).firm_email ?? '',
        seal_image_path: (data as any).seal_image_path ?? null,
        signature_image_path: (data as any).signature_image_path ?? null,
        certificate_fingerprint: (data as any).certificate_fingerprint ?? null,
        certificate_generated_at: (data as any).certificate_generated_at ?? null,
        certificate_expires_at: (data as any).certificate_expires_at ?? null,
        license_verified: (data as any).license_verified ?? false,
        license_status: (data as any).license_status ?? null,
        license_verified_at: (data as any).license_verified_at ?? null,
      });
      setHasRow(true);
      // Load seal/sig images
      if ((data as any).seal_image_path) {
        const { data: urlData } = await supabase.storage.from('pe-seals').createSignedUrl((data as any).seal_image_path, 3600);
        if (urlData?.signedUrl) setSealUrl(urlData.signedUrl);
      }
      if ((data as any).signature_image_path) {
        const { data: urlData } = await supabase.storage.from('pe-signatures').createSignedUrl((data as any).signature_image_path, 3600);
        if (urlData?.signedUrl) setSigUrl(urlData.signedUrl);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (user) fetchCreds();
  }, [user, authLoading, navigate, fetchCreds]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = {
      full_legal_name: cred.full_legal_name || null,
      pe_license_number: cred.pe_license_number || null,
      pe_state: cred.pe_state,
      engineering_discipline: cred.engineering_discipline || null,
      firm_name: cred.firm_name || null,
      firm_address: cred.firm_address || null,
      firm_phone: cred.firm_phone || null,
      firm_email: cred.firm_email || null,
    } as any;

    let error;
    if (hasRow) {
      ({ error } = await supabase.from('pe_credentials').update(payload).eq('user_id', user.id));
    } else {
      ({ error } = await supabase.from('pe_credentials').insert({ ...payload, user_id: user.id }));
      if (!error) setHasRow(true);
    }
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'PE credentials updated.' });
    }
  };

  const uploadSeal = async (file: File) => {
    if (!user) return;
    // Ensure row exists
    if (!hasRow) {
      await supabase.from('pe_credentials').insert({ user_id: user.id } as any);
      setHasRow(true);
    }
    const path = `${user.id}/seal.png`;
    const { error } = await supabase.storage.from('pe-seals').upload(path, file, { upsert: true });
    if (error) throw error;
    await supabase.from('pe_credentials').update({
      seal_image_path: path,
      seal_uploaded_at: new Date().toISOString(),
    } as any).eq('user_id', user.id);
    const { data: urlData } = await supabase.storage.from('pe-seals').createSignedUrl(path, 3600);
    if (urlData?.signedUrl) setSealUrl(urlData.signedUrl);
    setCred(prev => ({ ...prev, seal_image_path: path }));
  };

  const uploadSignatureFile = async (file: File) => {
    if (!user) return;
    if (!hasRow) {
      await supabase.from('pe_credentials').insert({ user_id: user.id } as any);
      setHasRow(true);
    }
    const path = `${user.id}/signature.png`;
    const { error } = await supabase.storage.from('pe-signatures').upload(path, file, { upsert: true });
    if (error) throw error;
    await supabase.from('pe_credentials').update({
      signature_image_path: path,
      signature_uploaded_at: new Date().toISOString(),
    } as any).eq('user_id', user.id);
    const { data: urlData } = await supabase.storage.from('pe-signatures').createSignedUrl(path, 3600);
    if (urlData?.signedUrl) setSigUrl(urlData.signedUrl);
    setCred(prev => ({ ...prev, signature_image_path: path }));
  };

  const handleDrawnSignature = async (dataUrl: string) => {
    setSigCanvasOpen(false);
    if (!user) return;
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'signature.png', { type: 'image/png' });
    await uploadSignatureFile(file);
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

      if (!hasRow) {
        await supabase.from('pe_credentials').insert({ user_id: user.id } as any);
        setHasRow(true);
      }

      await supabase.from('pe_credentials').update({
        certificate_public_key: publicKeyPem,
        certificate_fingerprint: fingerprint,
        certificate_generated_at: new Date().toISOString(),
        certificate_expires_at: expiresAt,
        encrypted_private_key_blob: encryptedBlob,
        encrypted_private_key_salt: salt,
        encrypted_private_key_iv: iv,
      } as any).eq('user_id', user.id);

      setCred(prev => ({
        ...prev,
        certificate_fingerprint: fingerprint,
        certificate_generated_at: new Date().toISOString(),
        certificate_expires_at: expiresAt,
      }));
      setCertPassword('');
      setCertPasswordConfirm('');
      toast({ title: 'Certificate Generated', description: `Fingerprint: ${fingerprint.slice(0, 16)}…` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setGeneratingCert(false);
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
        <div className="container mx-auto flex h-16 items-center px-6 gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Wind className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold text-foreground">Professional Engineer Credentials</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl px-6 py-8">
        {/* Security banner */}
        <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4 mb-6 flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Your credentials are stored securely and are only used to sign documents you explicitly authorize.
            WindCalc Pro never transmits your private key.
          </p>
        </div>

        <Tabs defaultValue="identity" className="space-y-6">
          <TabsList className="w-full">
            <TabsTrigger value="identity" className="flex-1">PE Seal & Identity</TabsTrigger>
            <TabsTrigger value="certificate" className="flex-1">Signing Certificate</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">Signing History</TabsTrigger>
          </TabsList>

          {/* TAB 1: Identity + Seal + Signature */}
          <TabsContent value="identity" className="space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6 shadow-card space-y-4">
                <h2 className="font-display text-base font-bold">Identity</h2>
                <div className="space-y-2">
                  <Label>Full Legal Name *</Label>
                  <Input value={cred.full_legal_name} onChange={e => setCred(p => ({ ...p, full_legal_name: e.target.value }))} placeholder="As it appears on your PE license" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>FL P.E. License No. *</Label>
                    <Input value={cred.pe_license_number} onChange={e => setCred(p => ({ ...p, pe_license_number: e.target.value }))} placeholder="12345" />
                  </div>
                  <div className="space-y-2">
                    <Label>Discipline</Label>
                    <Select value={cred.engineering_discipline} onValueChange={v => setCred(p => ({ ...p, engineering_discipline: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Civil">Civil</SelectItem>
                        <SelectItem value="Structural">Structural</SelectItem>
                        <SelectItem value="Mechanical">Mechanical</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Firm Name</Label>
                  <Input value={cred.firm_name} onChange={e => setCred(p => ({ ...p, firm_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Firm Address</Label>
                  <Input value={cred.firm_address} onChange={e => setCred(p => ({ ...p, firm_address: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Firm Phone</Label>
                    <Input value={cred.firm_phone} onChange={e => setCred(p => ({ ...p, firm_phone: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Firm Email</Label>
                    <Input value={cred.firm_email} onChange={e => setCred(p => ({ ...p, firm_email: e.target.value }))} />
                  </div>
                </div>

                {/* License verification badge */}
                {cred.license_verified && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    License verified — Active as of {cred.license_verified_at ? new Date(cred.license_verified_at).toLocaleDateString() : 'N/A'}
                  </div>
                )}
              </div>

              {/* Seal & Signature uploads */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-card space-y-6">
                <h2 className="font-display text-base font-bold">PE Seal Image *</h2>
                <SealUploader currentUrl={sealUrl} onUpload={uploadSeal} label="PE Seal (300×300px min, transparent PNG preferred)" />
                <p className="text-xs text-muted-foreground">
                  Your seal must be the official Florida PE seal for your license number, issued by the FBPE.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-card space-y-4">
                <h2 className="font-display text-base font-bold">Signature Image *</h2>
                <SealUploader currentUrl={sigUrl} onUpload={uploadSignatureFile} label="Upload signature PNG" maxSizeMb={2} previewSize={240} />
                <div className="text-center">
                  <span className="text-xs text-muted-foreground">— OR —</span>
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={() => setSigCanvasOpen(true)}>
                  ✏️ Draw signature in browser
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving…' : 'Save Credentials'}
              </Button>
            </form>
          </TabsContent>

          {/* TAB 2: Signing Certificate */}
          <TabsContent value="certificate" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 shadow-card space-y-4">
              <h2 className="font-display text-base font-bold">Digital Signing Certificate</h2>
              {cred.certificate_fingerprint ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Certificate Active</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Fingerprint: <code className="bg-muted px-1 rounded">{cred.certificate_fingerprint.slice(0, 32)}…</code></p>
                    <p>Generated: {cred.certificate_generated_at ? new Date(cred.certificate_generated_at).toLocaleDateString() : '—'}</p>
                    <p>Expires: {cred.certificate_expires_at ? new Date(cred.certificate_expires_at).toLocaleDateString() : '—'}</p>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <p className="text-xs text-muted-foreground mb-2">To regenerate, set a new signing password:</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    <span>No signing certificate generated yet.</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your private signing key is generated in your browser, encrypted with your password, and stored securely.
                    WindCalc Pro cannot access your private key.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Signing Password</Label>
                  <Input type="password" value={certPassword} onChange={e => setCertPassword(e.target.value)} placeholder="Choose a strong password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="password" value={certPasswordConfirm} onChange={e => setCertPasswordConfirm(e.target.value)} placeholder="Confirm password" />
                </div>
                <Button
                  onClick={handleGenerateCertificate}
                  disabled={generatingCert || !certPassword || certPassword !== certPasswordConfirm}
                  className="w-full"
                >
                  {generatingCert ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</>
                  ) : (
                    <><Shield className="mr-2 h-4 w-4" /> {cred.certificate_fingerprint ? 'Regenerate Certificate' : 'Generate My Signing Certificate'}</>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Signing History */}
          <TabsContent value="history" className="space-y-6">
            <SigningHistoryTab userId={user?.id} />
          </TabsContent>
        </Tabs>
      </div>

      <SignatureCanvas open={sigCanvasOpen} onClose={() => setSigCanvasOpen(false)} onAccept={handleDrawnSignature} />
    </div>
  );
};

// Signing History sub-component
function SigningHistoryTab({ userId }: { userId?: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('pe_signing_events')
      .select('*')
      .eq('user_id', userId)
      .order('signed_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setEvents(data ?? []);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p className="text-sm text-muted-foreground animate-pulse">Loading history…</p>;
  if (events.length === 0) return (
    <div className="rounded-lg border border-border bg-card p-8 text-center">
      <History className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">No signed documents yet.</p>
      <p className="text-xs text-muted-foreground mt-1">Signed reports will appear here after you sign & seal your first calculation.</p>
    </div>
  );

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-xs">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Document</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev.id} className="border-t border-border">
                <td className="p-3">{new Date(ev.signed_at).toLocaleDateString()}</td>
                <td className="p-3 font-medium">{ev.filename || '—'}</td>
                <td className="p-3">{ev.calculation_type}</td>
                <td className="p-3">
                  {ev.revoked ? (
                    <span className="text-destructive">⚠️ Revoked</span>
                  ) : (
                    <span className="text-green-600">✅ Valid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PECredentials;
