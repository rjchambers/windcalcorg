import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportType = searchParams.get('type') || 'wind';
  const sessionId = searchParams.get('session_id');
  const { user, checkSubscription, setHasReportCredit } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (sessionId && user) {
        try {
          const { data, error } = await supabase.functions.invoke('verify-report-payment', {
            body: { sessionId },
          });
          if (!error && data?.paid) {
            setVerified(true);
            setHasReportCredit(true);
          }
        } catch (err) {
          console.error('Verification failed:', err);
        }
      }
      // Also refresh subscription status
      await checkSubscription();
      setVerifying(false);
    };
    verify();
  }, [sessionId, user, checkSubscription, setHasReportCredit]);

  const calcPath = reportType === 'wind' ? '/calculator' : '/fastener';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {verifying ? (
          <>
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Verifying Payment…</h1>
            <p className="text-muted-foreground">Please wait while we confirm your purchase.</p>
          </>
        ) : (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Payment Confirmed!</h1>
            {verified ? (
              <div className="space-y-6">
                <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    ✓ Your {reportType === 'wind' ? 'Wind Uplift' : 'Fastener'} report is unlocked — click below to download.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(`${calcPath}?unlocked=true`)}
                >
                  Download Your Report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Your payment was received. Go back to the calculator to download your report.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate(`${calcPath}?unlocked=true`)}
                >
                  Go to Calculator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="mt-8 rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Need unlimited reports? Pro plan is $100/month.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate('/#pricing')}>
                <Crown className="mr-2 h-4 w-4" /> Learn About Pro
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
