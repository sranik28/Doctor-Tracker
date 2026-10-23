import { NotFoundState } from '@/components/shared/not-found-state';

// Rendered inside the dashboard shell when a page in this group calls notFound().
export default function DashboardNotFound() {
  return <NotFoundState />;
}
