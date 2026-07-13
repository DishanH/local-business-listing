import { MessageSquare } from 'lucide-react'

export default function MessagesIndexPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
      <MessageSquare className="size-12" strokeWidth={1.5} />
      <p className="font-medium text-foreground">Select a conversation</p>
      <p className="text-sm">Choose a conversation from the list to view messages</p>
    </div>
  )
}
