import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Fragment } from 'react';

export interface BreadcrumbItem {
  label: string;
  /** Omit on the last item: it's the current page. */
  href?: string;
}

interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <Fragment key={`${index}-${item.label}`}>
            {index > 0 && (
              <li aria-hidden="true" className="flex">
                <ChevronRight className="size-4" />
              </li>
            )}
            <li className="min-w-0">
              {item.href ? (
                <Link
                  href={item.href}
                  className="rounded-sm py-1 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none pointer-coarse:py-2.5"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="block truncate font-medium text-foreground">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
