import Link from 'next/link'
import { ArrowRight, Store } from 'lucide-react'

export function ListBusinessCta() {
  return (
    <section className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 sm:py-10">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-8 text-primary-foreground sm:px-12 sm:py-10">
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
              List it on Localry for free — manage hours, photos, and messages, and get discovered by customers
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
