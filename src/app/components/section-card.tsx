import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  subtitle,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <article
      className={`rounded-xl border border-zinc-200 p-4 dark:border-zinc-700 ${className}`}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>
      {subtitle ? (
        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</div>
      ) : null}
      {children}
    </article>
  );
}
