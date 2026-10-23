'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import type { LoginFormValues } from '@/schemas/auth.schema';
import type { ApiSuccessResponse } from '@/types/api';
import type { AuthUserPayload, User } from '@/types/auth';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

const fetchMe = async (): Promise<User> => {
  const { data } = await api.get<ApiSuccessResponse<AuthUserPayload>>('/auth/me');
  return data.data.user;
};

/**
 * The signed-in user. The query cache is the single source of truth for auth state:
 * `undefined` = not known yet, `User` = signed in, `null` = explicitly signed out.
 */
export const useMe = () =>
  useQuery<User | null>({
    queryKey: authKeys.me,
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: LoginFormValues): Promise<User> => {
      const { data } = await api.post<ApiSuccessResponse<AuthUserPayload>>('/auth/login', values);
      return data.data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await api.post('/auth/logout');
    },
    // Even if the request fails, the user asked to leave: drop all cached data and go.
    // Marking the user as `null` (instead of clearing it) stops mounted guards from refetching
    // /auth/me mid-navigation, and makes a Back into the shell redirect straight to /login.
    onSettled: () => {
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== authKeys.me[0] });
      queryClient.setQueryData<User | null>(authKeys.me, null);
      router.replace('/login');
    },
  });
};
