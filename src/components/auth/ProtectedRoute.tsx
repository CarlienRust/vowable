import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { User } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await authService.getUser();
      setUser(currentUser);

      if (currentUser && requireAdmin) {
        const profile = await authService.getProfile(currentUser.id);
        setIsAdmin(profile?.is_admin || false);
      }

      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      if (user && requireAdmin) {
        authService.getProfile(user.id).then((profile) => {
          setIsAdmin(profile?.is_admin || false);
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [requireAdmin]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
