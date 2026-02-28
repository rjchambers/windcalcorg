import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportType = searchParams.get('type') || 'wind';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Your report has been unlocked. Go back to the calculator to download your clean, unwatermarked PDF.
        </p>
        <Button
          size="lg"
          onClick={() => navigate(reportType === 'wind' ? '/calculator' : '/fastener')}
        >
          Go to {reportType === 'wind' ? 'Wind Uplift' : 'FastenerCalc'} Calculator
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
