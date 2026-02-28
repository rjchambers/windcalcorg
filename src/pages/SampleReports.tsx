import { useState, useEffect, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Wind, ArrowLeft, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import WindCalcPdfReport from '@/components/pdf/WindCalcPdfReport';
import FastenerCalcPdfReport from '@/components/pdf/FastenerCalcPdfReport';
import type { CalculationInputs, CalculationOutputs } from '@/lib/calculation-engine';
import type { FastenerInputs, FastenerOutputs } from '@/lib/fastener-engine';
import { calculate } from '@/lib/calculation-engine';
import { calculateFastener } from '@/lib/fastener-engine';

// ─── Sample Wind Calc Data ───

const sampleWindInputs: CalculationInputs = {
  V: 175,
  exposureCategory: 'C',
  h: 25,
  Kzt: 1.0,
  Kd: 0.85,
  Ke: 1.0,
  roofType: 'gable',
  pitchDegrees: 15,
  buildingWidth: 40,
  buildingLength: 60,
  trussSpacing: 2,
  spans: [12, 18, 24],
  deadLoad: 12,
  designBasis: 'ASD',
  enclosureType: 'enclosed',
  hasOverhang: true,
  overhangWidth: 2,
  riskCategory: 'II',
};

// ─── Sample Fastener Calc Data ───

const sampleFastenerInputs: FastenerInputs = {
  V: 175,
  exposureCategory: 'C',
  h: 20,
  Kzt: 1.0,
  Kd: 0.85,
  Ke: 1.0,
  enclosure: 'enclosed',
  riskCategory: 'II',
  buildingLength: 80,
  buildingWidth: 50,
  parapetHeight: 0,
  systemType: 'modified_bitumen',
  deckType: 'plywood',
  constructionType: 'new',
  existingLayers: 0,
  sheetWidth_in: 36,
  lapWidth_in: 3,
  Fy_lbf: 135,
  fySource: 'noa',
  initialRows: 3,
  noa: {
    approvalType: 'miami_dade_noa',
    approvalNumber: 'NOA 24-0312.05',
    manufacturer: 'GAF Materials',
    productName: 'Liberty SBS SA Cap Sheet',
    systemNumber: 'S-2417',
    mdp_psf: -60,
    asterisked: false,
  },
  boardLength_ft: 4,
  boardWidth_ft: 4,
  insulation_Fy_lbf: 100,
  county: 'miami_dade',
  isHVHZ: true,
};

const SampleReports = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'fastener' ? 'fastener' : 'wind';

  const [windBlobUrl, setWindBlobUrl] = useState<string | null>(null);
  const [fastenerBlobUrl, setFastenerBlobUrl] = useState<string | null>(null);
  const [loadingWind, setLoadingWind] = useState(false);
  const [loadingFastener, setLoadingFastener] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  const generateWindPdf = useCallback(async () => {
    if (windBlobUrl) return;
    setLoadingWind(true);
    try {
      const outputs: CalculationOutputs = calculate(sampleWindInputs);
      const blob = await pdf(
        <WindCalcPdfReport
          inputs={sampleWindInputs}
          outputs={outputs}
          projectName="Sample — 456 Ocean Dr, Miami Beach"
          preparedBy="John Smith, P.E."
        />
      ).toBlob();
      setWindBlobUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Wind PDF generation failed:', err);
    } finally {
      setLoadingWind(false);
    }
  }, [windBlobUrl]);

  const generateFastenerPdf = useCallback(async () => {
    if (fastenerBlobUrl) return;
    setLoadingFastener(true);
    try {
      const outputs: FastenerOutputs = calculateFastener(sampleFastenerInputs);
      const blob = await pdf(
        <FastenerCalcPdfReport
          inputs={sampleFastenerInputs}
          outputs={outputs}
          projectName="Sample — 789 Brickell Ave, Miami"
          preparedBy="Jane Doe, P.E."
          jobAddress="789 Brickell Ave, Miami, FL 33131"
          peNumber="FL PE #67890"
        />
      ).toBlob();
      setFastenerBlobUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Fastener PDF generation failed:', err);
    } finally {
      setLoadingFastener(false);
    }
  }, [fastenerBlobUrl]);

  // Generate PDF for active tab on mount / tab change
  useEffect(() => {
    if (activeTab === 'wind') generateWindPdf();
    else generateFastenerPdf();
  }, [activeTab, generateWindPdf, generateFastenerPdf]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (windBlobUrl) URL.revokeObjectURL(windBlobUrl);
      if (fastenerBlobUrl) URL.revokeObjectURL(fastenerBlobUrl);
    };
  }, [windBlobUrl, fastenerBlobUrl]);

  const currentUrl = activeTab === 'wind' ? windBlobUrl : fastenerBlobUrl;
  const currentLoading = activeTab === 'wind' ? loadingWind : loadingFastener;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-primary" />
              <span className="font-display text-base font-bold text-foreground">Sample Reports</span>
            </div>
          </div>
          {currentUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={currentUrl} download={`Sample_${activeTab === 'wind' ? 'WindCalc' : 'FastenerCalc'}_Report.pdf`}>
                <FileDown className="mr-1.5 h-4 w-4" />
                Download PDF
              </a>
            </Button>
          )}
        </div>
      </nav>

      {/* Tabs + PDF viewer */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b border-border bg-card/50 px-6 py-2">
            <TabsList className="bg-muted">
              <TabsTrigger value="wind" className="text-xs">💨 Wind Uplift Report</TabsTrigger>
              <TabsTrigger value="fastener" className="text-xs">🔩 FastenerCalc HVHZ Report</TabsTrigger>
            </TabsList>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {activeTab === 'wind'
                ? 'ASCE 7-22 Ch. 28 — Gable roof, V = 175 mph, Exposure C, 40×60 ft building, h = 25 ft'
                : 'FBC 8th Ed. — Modified Bitumen, V = 175 mph, Miami-Dade HVHZ, NOA 24-0312.05, 80×50 ft building'}
            </p>
          </div>

          <TabsContent value="wind" className="flex-1 m-0">
            {currentLoading && activeTab === 'wind' ? (
              <LoadingState label="Generating Wind Uplift report…" />
            ) : windBlobUrl ? (
              <iframe src={windBlobUrl} className="w-full h-full min-h-[calc(100vh-130px)]" title="Wind Calc Sample PDF" />
            ) : (
              <LoadingState label="Preparing…" />
            )}
          </TabsContent>

          <TabsContent value="fastener" className="flex-1 m-0">
            {currentLoading && activeTab === 'fastener' ? (
              <LoadingState label="Generating FastenerCalc HVHZ report…" />
            ) : fastenerBlobUrl ? (
              <iframe src={fastenerBlobUrl} className="w-full h-full min-h-[calc(100vh-130px)]" title="Fastener Calc Sample PDF" />
            ) : (
              <LoadingState label="Preparing…" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const LoadingState = ({ label }: { label: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24">
    <Loader2 className="h-8 w-8 text-primary animate-spin" />
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default SampleReports;
