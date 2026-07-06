import {
  UtensilsCrossed,
  Coffee,
  Croissant,
  Scissors,
  BookOpen,
  Dumbbell,
  Flower2,
  Sparkles,
  PawPrint,
  Wrench,
  Store,
  type LucideProps,
} from 'lucide-react'

const icons = {
  UtensilsCrossed,
  Coffee,
  Croissant,
  Scissors,
  BookOpen,
  Dumbbell,
  Flower2,
  Sparkles,
  PawPrint,
  Wrench,
} as const

export function CategoryIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name as keyof typeof icons] ?? Store
  return <Icon {...props} />
}
