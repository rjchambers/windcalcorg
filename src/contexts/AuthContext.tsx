import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isProSubscriber: boolean;
  hasReportCredit: boolean;
  subscriptionEnd: string | null;
  checkSubscription: () => Promise<void>;
  setHasReportCredit: (v: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isProSubscriber: false,
  hasReportCredit: false,
  subscriptionEnd: null,
  checkSubscription: async () => {},
  setHasReportCredit: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProSubscriber, setIsProSubscriber] = useState(false);
  const [hasReportCredit, setHasReportCredit] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.error('Subscription check failed:', error);
        return;
      }
      setIsProSubscriber(data?.subscribed ?? false);
      setSubscriptionEnd(data?.subscription_end ?? null);
      if (data?.report_credit) {
        setHasReportCredit(true);
      }
    } catch (err) {
      console.error('Subscription check error:', err);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        setTimeout(() => checkSubscription(), 0);
      } else {
        setIsProSubscriber(false);
        setSubscriptionEnd(null);
        setHasReportCredit(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        checkSubscription();
      }
    });

    return () => subscription.unsubscribe();
  }, [checkSubscription]);

  useEffect(() => {
    if (!session?.user) return;
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [session?.user, checkSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsProSubscriber(false);
    setSubscriptionEnd(null);
    setHasReportCredit(false);
  };

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      loading,
      isProSubscriber,
      hasReportCredit,
      subscriptionEnd,
      checkSubscription,
      setHasReportCredit,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
