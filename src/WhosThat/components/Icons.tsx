export function SoundIcon({ muted }: { muted: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d={muted ? 'm17 9 5 5m0-5-5 5' : 'M17 8c1.5 1.3 1.5 6.7 0 8m2-10c3 2.5 3 9.5 0 12'}/></svg>;
}

export function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m-5-5 5 5-5 5"/></svg>;
}

export function RetryIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 8V4l-3 3a7 7 0 1 0 2 8"/></svg>;
}
