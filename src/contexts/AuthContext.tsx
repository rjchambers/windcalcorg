import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isProSubscriber: boolean;
  subscriptionEnd: string | null;
  checkSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isProSubscriber: false,
  subscriptionEnd: null,
  checkSubscription: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProSubscriber, setIsProSubscriber] = useState(false);
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
    } catch (err) {
      console.error('Subscription check error:', err);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        // Defer to avoid potential Supabase client deadlocks
        setTimeout(() => checkSubscription(), 0);
      } else {
        setIsProSubscriber(false);
        setSubscriptionEnd(null);
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

  // Periodic refresh every 60s while logged in
  useEffect(() => {
    if (!session?.user) return;
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [session?.user, checkSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsProSubscriber(false);
    setSubscriptionEnd(null);
  };

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      loading,
      isProSubscriber,
      subscriptionEnd,
      checkSubscription,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
