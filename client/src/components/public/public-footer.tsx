import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Doctor Tracker</p>
        <nav aria-label="Footer" className="flex gap-4">
          <Link href="/find-doctors" className="hover:text-foreground hover:underline">
            Find a doctor
          </Link>
          <Link href="/login" className="hover:text-foreground hover:underline">
            Staff login
          </Link>
        </nav>
      </div>
    </footer>
  );
}
