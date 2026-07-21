import { redirect } from 'next/navigation'

/** Listings live on the dashboard overview - keep this route as a redirect. */
export default function DashboardListingsRedirectPage() {
  redirect('/dashboard')
}
