import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, ShieldX, Wind, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReportData {
  calculation_type: string;
  signed_at: string;
  certificate_fingerprint: string;
  revoked: boolean;
  revoked_reason: string | null;
  pe_credentials: {
    full_legal_name: string | null;
    pe_license_number: string | null;
    pe_state: string;
    firm_name: string | null;
  } | null;
}

const VerifyReport = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!reportId) { setNotFound(true); setLoading(false); return; }

    supabase
      .from('pe_signing_events')
      .select('calculation_type, signed_at, certificate_fingerprint, revoked, revoked_reason, pe_credentials_id')
      .eq('id', reportId)
      .maybeSingle()
      .then(async ({ data: event, error }) => {
        if (error || !event) { setNotFound(true); setLoading(false); return; }

        const { data: cred } = await supabase
          .from('pe_credentials')
          .select('full_legal_name, pe_license_number, pe_state, firm_name')
          .eq('id', event.pe_credentials_id)
          .maybeSingle();

        setData({
          calculation_type: event.calculation_type,
          signed_at: event.signed_at,
          certificate_fingerprint: event.certificate_fingerprint,
          revoked: event.revoked ?? false,
          revoked_reason: event.revoked_reason,
          pe_credentials: cred,
        });
        setLoading(false);
      });
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const isValid = data && !data.revoked;
  const calcTypeLabel = data?.calculation_type === 'wind' ? 'Wind Uplift Calculation'
    : data?.calculation_type === 'fastener' ? 'FastenerCalc HVHZ'
    : data?.calculation_type === 'tile' ? 'Tile Calc (RAS 127)'
    : data?.calculation_type ?? 'Engineering Calculation';

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center px-6 gap-2">
          <Wind className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold text-foreground">HVHZ Calc Pro</span>
          <span className="text-muted-foreground text-sm ml-2">— Report Verification</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-lg px-6 py-16">
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-6">
          {notFound ? (
            <>
              <ShieldX className="h-16 w-16 text-destructive mx-auto" />
              <h1 className="font-display text-2xl font-bold text-destructive">Report Not Found</h1>
              <p className="text-sm text-muted-foreground">This report ID does not exist in our records.</p>
            </>
          ) : isValid ? (
            <>
              <Shield className="h-16 w-16 text-compression mx-auto" />
              <h1 className="font-display text-2xl font-bold text-compression">Valid Signed Report</h1>
              <div className="space-y-3 text-left">
                <Row label="Report Type" value={calcTypeLabel} />
                <Row label="Prepared By" value={data.pe_credentials?.full_legal_name ?? 'Unknown'} />
                <Row label="PE License" value={`${data.pe_credentials?.pe_license_number ?? '—'} (${data.pe_credentials?.pe_state ?? 'FL'})`} />
                {data.pe_credentials?.firm_name && <Row label="Firm" value={data.pe_credentials.firm_name} />}
                <Row label="Signed" value={new Date(data.signed_at).toLocaleString()} />
                <Row label="Status" value="✓ Valid" />
              </div>
            </>
          ) : (
            <>
              <ShieldX className="h-16 w-16 text-destructive mx-auto" />
              <h1 className="font-display text-2xl font-bold text-destructive">Revoked Report</h1>
              <div className="space-y-3 text-left">
                <Row label="Report Type" value={calcTypeLabel} />
                <Row label="Status" value="REVOKED" />
                {data?.revoked_reason && <Row label="Reason" value={data.revoked_reason} />}
              </div>
            </>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-6">
          This report was digitally signed using HVHZ Calc Pro. Verification is provided as a public service.
        </p>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between border-b border-border/50 pb-2">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

export default VerifyReport;
