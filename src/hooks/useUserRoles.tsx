import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  role: 'admin' | 'user';
  created_at: string;
}

export const useUserRoles = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useIsAdmin = () => {
  const { data: profile } = useUserRoles();
  return profile?.role === 'admin' || false;
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, role, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { signUp } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      full_name, 
      username, 
      role = 'user' 
    }: { 
      email: string; 
      password: string; 
      full_name: string; 
      username: string; 
      role?: 'admin' | 'user';
    }) => {
      // Use the regular signUp method which works with the public key
      const { error } = await signUp(email, password, {
        full_name,
        username
      });

      if (error) throw error;

      // If we need to assign admin role, we'll do it after the user is created
      // The trigger will handle creating the profile and default user role
      if (role === 'admin') {
        // We'll need to update the role after the user confirms their email
        // For now, we'll just create the user and they can be promoted later
        console.log('Admin role requested - user will need to be promoted after email confirmation');
      }

      return { success: true, requiresEmailConfirmation: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'user' }) => {
      // Update the user_roles table - this will trigger the sync to profiles table
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};