interface ProductionBlockerProps {
  text: string
}

export function ProductionBlocker({ text }: ProductionBlockerProps) {
  return (
    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
      {text}
    </p>
  )
}
