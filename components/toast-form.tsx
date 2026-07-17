'use client'

import type { ComponentProps } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type FormAction = (formData: FormData) => Promise<void> | void

function isRedirectError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof (error as { digest?: unknown }).digest === 'string' &&
      (error as { digest: string }).digest.startsWith('NEXT_REDIRECT'),
  )
}

/**
 * Drop-in replacement for `<form action={...}>` that shows a toast on
 * success/failure. Works even when rendered from a Server Component, since
 * bound server actions (unlike arbitrary closures) are valid to pass down as
 * props — the toast side effect itself runs here, on the client.
 */
export function ToastForm({
  action,
  successMessage,
  errorMessage,
  ...props
}: Omit<ComponentProps<'form'>, 'action'> & {
  action: FormAction
  successMessage?: string
  errorMessage?: string
}) {
  async function handleAction(formData: FormData) {
    try {
      await action(formData)
      if (successMessage) toast.success(successMessage)
    } catch (error) {
      if (isRedirectError(error)) throw error
      toast.error(errorMessage ?? (error instanceof Error ? error.message : 'Something went wrong'))
    }
  }

  return <form action={handleAction} {...props} />
}

/** For imperative (non-form) actions like a bare delete icon button. */
export async function runWithToast(action: () => Promise<void> | void, successMessage?: string, errorMessage?: string) {
  try {
    await action()
    if (successMessage) toast.success(successMessage)
  } catch (error) {
    if (isRedirectError(error)) throw error
    toast.error(errorMessage ?? (error instanceof Error ? error.message : 'Something went wrong'))
  }
}

/**
 * Drop-in for a bare `<button formAction={...}>` (e.g. a "Delete" button that
 * shares a form with a "Save" submit) — those can't run through `ToastForm`
 * since `formAction` overrides the form's action just for that one button.
 */
export function ToastButton({
  action,
  successMessage,
  errorMessage,
  ...props
}: Omit<ComponentProps<typeof Button>, 'onClick'> & {
  action: () => Promise<void> | void
  successMessage?: string
  errorMessage?: string
}) {
  return (
    <Button
      type="button"
      onClick={() => {
        void runWithToast(action, successMessage, errorMessage)
      }}
      {...props}
    />
  )
}
