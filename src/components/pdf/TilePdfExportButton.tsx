import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { FileDown, Loader2, Lock, Crown, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTileStore } from '@/stores/tile-store';
import { useAuth } from '@/contexts/AuthContext';
import { useEngineerProfile } from '@/hooks/use-engineer-profile';
import { usePECredentials } from '@/hooks/use-pe-credentials';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import TileCalcPdfReport from './TileCalcPdfReport';
import SignAndSealModal from '@/components/pe/SignAndSealModal';

const TilePdfExportButton = () => {
  const { inputs, outputs } = useTileStore();
  const { user, isProSubscriber, hasReportCredit, setHasReportCredit } = useAuth();
  const { profile } = useEngineerProfile();
  const { credentials } = usePECredentials();
  const hasSeal = !!credentials?.seal_image_path;
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [jobAddress, setJobAddress] = useState('');
  const [generating, setGenerating] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [open, setOpen] = useState(false);
  const [signModalOpen, setSignModalOpen] = useState(false);

  const canDownloadClean = isProSubscriber || hasReportCredit;
  const preparedBy = profile.display_name || '';

  const handleDownload = async (watermark: boolean) => {
    if (!outputs) return;
    setGenerating(true);
    try {
      const blob = await pdf(
        <TileCalcPdfReport inputs={inputs} outputs={outputs} projectName={projectName || 'Untitled Project'} preparedBy={preparedBy} jobAddress={jobAddress} watermark={watermark} engineer={profile} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HVHZCalcPro_Tile${watermark ? '_SAMPLE' : ''}_${(projectName || 'Report').replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      if (!watermark) {
        setOpen(false);
        if (hasReportCredit && !isProSubscriber) setHasReportCredit(false);
      }
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF');
    } finally { setGenerating(false); }
  };

  const generateUnsignedPdf = async (): Promise<Blob> => {
    if (!outputs) throw new Error('No calculation outputs');
    return pdf(
      <TileCalcPdfReport inputs={inputs} outputs={outputs} projectName={projectName || 'Untitled Project'} preparedBy={preparedBy} jobAddress={jobAddress} watermark={false} engineer={profile} />
    ).toBlob();
  };

  const handlePurchase = async () => {
    if (!user) { toast.error('Please log in to purchase a report'); navigate('/login'); return; }
    setPurchasing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-report-payment', { body: { reportType: 'tile' } });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err: any) {
      console.error('Payment failed:', err);
      toast.error('Failed to start checkout');
    } finally { setPurchasing(false); }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={!outputs}><FileDown className="mr-1 h-4 w-4" />Export PDF</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display">Export Tile Report</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Project Name</Label>
              <Input placeholder="e.g. Smith Residence" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="font-mono text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Site Address</Label>
              <Input placeholder="e.g. 123 Main St, Miami, FL 33101" value={jobAddress} onChange={(e) => setJobAddress(e.target.value)} className="font-mono text-sm" />
            </div>

            {preparedBy && (
              <p className="text-xs text-muted-foreground">
                Report branded as: <span className="font-medium text-foreground">{profile.business_name || profile.company || preparedBy}</span>
                {profile.pe_license && <> · {profile.license_state} {profile.license_type} #{profile.pe_license}</>}
              </p>
            )}

            {canDownloadClean ? (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{isProSubscriber ? 'Pro Plan — Unlimited Reports' : 'Report Unlocked'}</span>
                </div>
                <Button onClick={() => handleDownload(false)} disabled={generating} className="w-full">
                  {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</> : <><FileDown className="mr-2 h-4 w-4" />Download Clean PDF</>}
                </Button>
                {isProSubscriber && (
                  hasSeal ? (
                    <Button variant="outline" onClick={() => { setOpen(false); setSignModalOpen(true); }} className="w-full">
                      <Shield className="mr-2 h-4 w-4" /> Sign & Seal (PE Digital Signature)
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => navigate('/settings?tab=seal')} className="w-full text-muted-foreground">
                      <Shield className="mr-2 h-4 w-4" /> Sign & Seal requires your PE seal — Upload Seal →
                    </Button>
                  )
                )}
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Clean PDF Report</span>
                    <span className="text-sm font-bold text-primary">$10.00</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Branded with your firm info. Full RAS 127 derivation, zone pressures, attachment check, and signature block.</p>
                  <Button onClick={handlePurchase} disabled={purchasing} className="w-full">
                    {purchasing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening Checkout…</> : <><Lock className="mr-2 h-4 w-4" />Purchase Report — $10.00</>}
                  </Button>
                </div>
                <Button variant="outline" onClick={() => handleDownload(true)} disabled={generating} className="w-full">
                  {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</> : <><FileDown className="mr-2 h-4 w-4" />Download Sample (Watermarked)</>}
                </Button>
              </>
            )}

            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" /> Tip: Your firm info auto-populates from your Settings profile.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <SignAndSealModal open={signModalOpen} onClose={() => setSignModalOpen(false)} calculationType="tile" projectName={projectName || 'Untitled Project'} projectAddress={jobAddress} generatePdf={generateUnsignedPdf} />
    </>
  );
};

export default TilePdfExportButton;
