import React, { useEffect } from 'react';
import { Router } from './routes/router';
import { authService } from './services/auth.service';
import { useWeddingPlanStore } from './state/useWeddingPlanStore';
import './styles/globals.css';

export const App: React.FC = () => {
  const setUserId = useWeddingPlanStore((state) => state.setUserId);
  const loadFromSupabase = useWeddingPlanStore((state) => state.loadFromSupabase);
  const clearAll = useWeddingPlanStore((state) => state.clearAll);

  useEffect(() => {
    // Check for existing session
    authService.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUserId(data.session.user.id);
        loadFromSupabase(data.session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (user) {
        setUserId(user.id);
        loadFromSupabase(user.id);
      } else {
        clearAll();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUserId, loadFromSupabase, clearAll]);

  return <Router />;
};
