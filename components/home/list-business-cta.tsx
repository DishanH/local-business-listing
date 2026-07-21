import Link from 'next/link'
import { ArrowRight, Store } from 'lucide-react'

export function ListBusinessCta() {
  return (
    <section className="mx-auto max-w-[88rem] px-4 py-6 sm:px-6 sm:py-10">
      {/* Mobile only */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 px-5 py-6 text-center lg:hidden">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Store size={22} />
        </span>
        <h2 className="mt-4 font-serif text-xl tracking-tight">Own a local business?</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          List for free - get discovered by customers nearby.
        </p>
        <Link
          href="/become-owner"
          className="mt-5 inline-flex h-12 w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-opacity active:opacity-90"
        >
          List your business
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Desktop - original banner */}
      <div className="relative hidden overflow-hidden rounded-3xl bg-primary px-6 py-8 text-primary-foreground sm:px-12 sm:py-10 lg:block">
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary-foreground/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-primary-foreground/10"
          aria-hidden="true"
        />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary-foreground/15">
              <Store size={20} />
            </span>
            <h2 className="mt-4 font-serif text-2xl tracking-tight sm:text-3xl">Own a local business?</h2>
            <p className="mt-2 text-primary-foreground/85 text-pretty">
              List it on Localry for free - manage hours, photos, and messages, and get discovered by customers
              nearby.
            </p>
          </div>
          <Link
            href="/become-owner"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            List your business <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
