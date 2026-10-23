'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/api-error';
import { getSafeRedirectPath } from '@/lib/safe-redirect';
import { type LoginFormValues, loginSchema } from '@/schemas/auth.schema';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  // Next keeps visited routes mounted inside a hidden <Activity>, which runs effect cleanups on
  // hide. Wipe credentials and mutation state there so they aren't still filled in after logout.
  const { reset: resetForm } = form;
  const { reset: resetLogin } = login;
  useEffect(
    () => () => {
      resetForm();
      resetLogin();
      setShowPassword(false);
    },
    [resetForm, resetLogin],
  );

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: () => {
        router.replace(getSafeRedirectPath(searchParams.get('next')));
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, 'Unable to sign in. Please try again.'));
      },
    });
  };

  // Stay disabled through the redirect so the button can't be pressed twice.
  const isSubmitting = login.isPending || login.isSuccess;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="admin@example.com"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pr-10"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Form>
  );
}
