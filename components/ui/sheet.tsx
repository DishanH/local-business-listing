'use client'

import * as React from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

function SheetPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetBackdrop({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="sheet-backdrop"
      className={cn(
        'fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[1px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  )
}

const sideClasses = {
  right: 'inset-y-0 right-0 h-full w-full max-w-[19rem] border-l data-open:slide-in-from-right data-closed:slide-out-to-right',
  left: 'inset-y-0 left-0 h-full w-full max-w-[19rem] border-r data-open:slide-in-from-left data-closed:slide-out-to-left',
}

function SheetContent({
  className,
  children,
  side = 'right',
  showClose = true,
  ...props
}: DialogPrimitive.Popup.Props & { side?: 'left' | 'right'; showClose?: boolean }) {
  return (
    <SheetPortal>
      <SheetBackdrop />
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          'fixed z-50 flex flex-col gap-5 overflow-y-auto border-border bg-popover p-5 text-popover-foreground shadow-2xl outline-none',
          'data-open:animate-in data-open:duration-300 data-open:ease-out',
          'data-closed:animate-out data-closed:duration-200 data-closed:ease-in',
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
        {showClose ? (
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label="Close menu"
          >
            <XIcon className="size-4" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sheet-header" className={cn('flex flex-col gap-1', className)} {...props} />
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn('font-serif text-lg font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

export { Sheet, SheetTrigger, SheetClose, SheetPortal, SheetBackdrop, SheetContent, SheetHeader, SheetTitle }
