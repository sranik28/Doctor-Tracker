import { redirect } from 'next/navigation';

// proxy.ts redirects "/" first; this is the fallback if the proxy is ever bypassed.
export default function HomePage() {
  redirect('/dashboard');
}
