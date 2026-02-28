import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFastenerStore } from '@/stores/fastener-store';
import FastenerCalcPdfReport from './FastenerCalcPdfReport';

const FastenerPdfExportButton = () => {
  const { inputs, outputs, tas105Outputs } = useFastenerStore();
  const [projectName, setProjectName] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [generating, setGenerating] = useState(false);
  const [open, setOpen] = useState(false);

  const handleExport = async () => {
    if (!outputs) return;
    setGenerating(true);
    try {
      const blob = await pdf(
        <FastenerCalcPdfReport
          inputs={inputs}
          outputs={outputs}
          tas105Outputs={tas105Outputs}
          projectName={projectName || 'Untitled Project'}
          preparedBy={preparedBy}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FastenerCalc_${(projectName || 'Report').replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!outputs}>
          <FileDown className="mr-1 h-4 w-4" />
          Export PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Export Fastener Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Project Name</Label>
            <Input
              placeholder="e.g. 123 Main St Residence"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Prepared By</Label>
            <Input
              placeholder="e.g. Jane Smith, PE"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Report includes cover page, full derivation chain per zone, fastener patterns, insulation, TAS 105, and signature block.
          </p>
          <Button onClick={handleExport} disabled={generating} className="w-full">
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FastenerPdfExportButton;
