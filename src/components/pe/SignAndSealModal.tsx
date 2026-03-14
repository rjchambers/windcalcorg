import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { usePECredentials } from '@/hooks/use-pe-credentials';
import { decryptPrivateKey, signDocument, computeDocumentHash, bufferToHex } from '@/lib/pe-crypto';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield, Lock, Loader2, CheckCircle2, FileDown, AlertTriangle, ExternalLink,
} from 'lucide-react';

type SigningStep = 'idle' | 'unlocking' | 'generating' | 'signing' | 'saving' | 'done' | 'error';

interface SignAndSealModalProps {
  open: boolean;
  onClose: () => void;
  calculationType: 'wind_uplift' | 'fastener_hvhz' | 'tile';
  calculationId?: string;
  projectName: string;
  projectAddress?: string;
  reportVersion?: number;
  /** Called to generate the unsigned PDF blob */
  generatePdf: () => Promise<Blob>;
  /** Called after successful signing with the signed blob for download */
  onSignedPdf?: (blob: Blob, filename: string) => void;
}

const CERTIFICATIONS = [
  'I have reviewed and verified all calculations herein.',
  'These calculations conform to FBC 8th Edition (2023) and ASCE 7-22 to the best of my professional judgment.',
  'I am the licensed professional of record for this project and take full responsibility for the sealed work.',
  'I understand that my FL P.E. license and digital seal will appear on this document, which may be submitted to a building department for permit review.',
  'I understand that WindCalc Pro is a calculation aid, and that I am solely responsible for verifying all inputs, outputs, assumptions, and code compliance.',
];

const SignAndSealModal = ({
  open,
  onClose,
  calculationType,
  calculationId,
  projectName,
  projectAddress,
  reportVersion = 1,
  generatePdf,
  onSignedPdf,
}: SignAndSealModalProps) => {
  const { user } = useAuth();
  const { credentials, isReady, sealUrl, signatureUrl } = usePECredentials();
  const navigate = useNavigate();

  const [certChecks, setCertChecks] = useState<boolean[]>(CERTIFICATIONS.map(() => false));
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<SigningStep>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [signedFilename, setSignedFilename] = useState('');
  const [signedBlob, setSignedBlob] = useState<Blob | null>(null);
  const [signingEventId, setSigningEventId] = useState<string | null>(null);

  const allCertified = certChecks.every(Boolean);
  const canSign = allCertified && password.length > 0 && isReady;

  const resetState = useCallback(() => {
    setCertChecks(CERTIFICATIONS.map(() => false));
    setPassword('');
    setStep('idle');
    setErrorMsg('');
    setSignedFilename('');
    setSignedBlob(null);
    setSigningEventId(null);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSign = async () => {
    if (!user || !credentials) return;
    setErrorMsg('');

    try {
      // Step 1: Unlock certificate
      setStep('unlocking');
      let privateKeyJwk: JsonWebKey;
      try {
        privateKeyJwk = await decryptPrivateKey(
          credentials.encrypted_private_key_blob!,
          credentials.encrypted_private_key_salt!,
          credentials.encrypted_private_key_iv!,
          password
        );
      } catch {
        setStep('error');
        setErrorMsg('Incorrect password. Your signing certificate could not be unlocked.');
        return;
      }

      // Step 2: Generate PDF
      setStep('generating');
      const pdfBlob = await generatePdf();
      const pdfBytes = new Uint8Array(await pdfBlob.arrayBuffer());

      // Step 3: Sign document
      setStep('signing');
      const docHash = await computeDocumentHash(pdfBytes);
      const signature = await signDocument(pdfBytes, privateKeyJwk);
      const sigHash = bufferToHex(await crypto.subtle.digest('SHA-256', signature as unknown as BufferSource));

      // Step 4: Save signing event
      setStep('saving');
      const filename = `${calculationType === 'wind_uplift' ? 'WindUplift' : 'FastenerCalc'}_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      setSignedFilename(filename);

      const { data: eventData, error: eventError } = await supabase
        .from('pe_signing_events')
        .insert({
          user_id: user.id,
          pe_credentials_id: credentials.id,
          calculation_type: calculationType,
          calculation_id: calculationId || crypto.randomUUID(),
          report_version: reportVersion,
          document_hash: docHash,
          signature_hash: sigHash,
          certificate_fingerprint: credentials.certificate_fingerprint!,
          signing_user_agent: navigator.userAgent,
          filename,
        } as any)
        .select('id')
        .single();

      if (eventError) throw eventError;
      setSigningEventId(eventData?.id ?? null);

      // Mark first certification if not already done
      if (!credentials.credentials_certified_at) {
        await supabase
          .from('pe_credentials')
          .update({ credentials_certified_at: new Date().toISOString() } as any)
          .eq('user_id', user.id);
      }

      // Store the blob for download
      setSignedBlob(pdfBlob);
      setStep('done');

      if (onSignedPdf) {
        onSignedPdf(pdfBlob, filename);
      }
    } catch (err: any) {
      console.error('Signing failed:', err);
      setStep('error');
      setErrorMsg(err.message || 'Signing failed. Please try again.');
    }
  };

  const downloadSignedPdf = () => {
    if (!signedBlob) return;
    const url = URL.createObjectURL(signedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = signedFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // No credentials set up
  if (open && !isReady && step === 'idle') {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> PE Credentials Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              To export a digitally signed report, you need to set up your Professional Engineer credentials first.
            </p>
            <p className="text-sm text-muted-foreground">This takes about 5 minutes and includes:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>✓ Uploading your FL PE seal image</li>
              <li>✓ Uploading or drawing your signature</li>
              <li>✓ Generating your signing certificate</li>
            </ul>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/pe-credentials')} className="flex-1">
                <Shield className="mr-2 h-4 w-4" /> Set Up PE Credentials
              </Button>
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📄 Sign & Seal Report
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {calculationType === 'wind_uplift' ? 'Wind Uplift Analysis' : 'Fastener Calculation'} — {projectName}
          </p>
        </DialogHeader>

        {step === 'idle' && (
          <div className="space-y-4 py-2">
            {/* Signing identity preview */}
            <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center gap-4">
              {sealUrl && (
                <img src={sealUrl} alt="PE Seal" className="w-14 h-14 object-contain rounded" />
              )}
              <div className="text-sm">
                <p className="font-semibold text-foreground">{credentials?.full_legal_name}</p>
                <p className="text-muted-foreground">FL P.E. No. {credentials?.pe_license_number}</p>
                {credentials?.firm_name && (
                  <p className="text-muted-foreground">{credentials.firm_name}</p>
                )}
              </div>
            </div>

            {/* Calculation details */}
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p><span className="font-medium text-foreground">Project:</span> {projectName}</p>
              {projectAddress && <p><span className="font-medium text-foreground">Address:</span> {projectAddress}</p>}
              <p><span className="font-medium text-foreground">Version:</span> #{reportVersion}</p>
            </div>

            {/* Certification checkboxes */}
            <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-3">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                BY SIGNING, YOU CERTIFY THAT:
              </p>
              {CERTIFICATIONS.map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Checkbox
                    id={`cert-${i}`}
                    checked={certChecks[i]}
                    onCheckedChange={(checked) => {
                      const next = [...certChecks];
                      next[i] = !!checked;
                      setCertChecks(next);
                    }}
                    className="mt-0.5"
                  />
                  <label htmlFor={`cert-${i}`} className="text-xs text-foreground leading-relaxed cursor-pointer">
                    {text}
                  </label>
                </div>
              ))}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-xs">Enter your signing password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Unlocks your private signing key"
                onKeyDown={(e) => e.key === 'Enter' && canSign && handleSign()}
              />
            </div>

            <Button onClick={handleSign} disabled={!canSign} className="w-full">
              <Shield className="mr-2 h-4 w-4" /> Sign & Export PDF
            </Button>
          </div>
        )}

        {/* Progress states */}
        {(step === 'unlocking' || step === 'generating' || step === 'signing' || step === 'saving') && (
          <div className="py-8 space-y-4">
            <ProgressStep active={step === 'unlocking'} done={['generating', 'signing', 'saving', 'done'].includes(step)} label="Unlocking signing certificate…" icon="🔐" step={1} />
            <ProgressStep active={step === 'generating'} done={['signing', 'saving', 'done'].includes(step)} label="Generating report PDF…" icon="📄" step={2} />
            <ProgressStep active={step === 'signing'} done={['saving', 'done'].includes(step)} label="Applying digital seal and signature…" icon="✍️" step={3} />
            <ProgressStep active={step === 'saving'} done={['done'].includes(step as string)} label="Saving signed document…" icon="☁️" step={4} />
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <div className="py-6 space-y-4">
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold">Done! Your signed report is ready.</span>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{signedFilename}</p>
              <p>Signed at: {new Date().toLocaleString()}</p>
              <p>Certificate: FL P.E. No. {credentials?.pe_license_number} — {credentials?.certificate_fingerprint?.slice(0, 16)}…</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadSignedPdf} className="flex-1">
                <FileDown className="mr-2 h-4 w-4" /> Download Now
              </Button>
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Error */}
        {step === 'error' && (
          <div className="py-6 space-y-4">
            <div className="flex items-start gap-3 text-destructive">
              <AlertTriangle className="h-5 w-5 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Signing failed</p>
                <p className="text-sm">{errorMsg}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { setStep('idle'); setPassword(''); }} className="flex-1">
                Try Again
              </Button>
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

function ProgressStep({ active, done, label, icon, step }: { active: boolean; done: boolean; label: string; icon: string; step: number }) {
  return (
    <div className={`flex items-center gap-3 transition-opacity ${active ? 'opacity-100' : done ? 'opacity-60' : 'opacity-30'}`}>
      {done ? (
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
      ) : active ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : (
        <span className="text-lg">{icon}</span>
      )}
      <span className="text-sm">
        Step {step}/4 {icon} {label}
      </span>
    </div>
  );
}

export default SignAndSealModal;
