import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="border-4 border-[var(--border-black)] bg-[var(--bg-card)] p-8 sm:p-12 max-w-lg w-full space-y-4 shadow-[10px_10px_0px_var(--border-black)]">
        <span className="font-mono text-xs tracking-widest font-bold uppercase text-[var(--text-muted)] block">
          ACES TECHNICAL GAZETTE · DISPATCH NOT FOUND
        </span>

        <h1 className="font-heading text-5xl sm:text-6xl font-black uppercase text-[var(--text-main)] leading-none">
          404 · MISSING
        </h1>

        <p className="font-serif text-sm text-[var(--text-body)]">
          The requested dispatch, author pass, or chronicle folio could not be retrieved from the
          archives. It may have been archived or reassigned by the editorial board.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn-broadsheet btn-broadsheet-primary w-full sm:w-auto">
            ➔ RETURN TO FRONT PAGE
          </Link>
          <Link href="/feed" className="btn-broadsheet w-full sm:w-auto">
            BROWSE GLOBAL FEED
          </Link>
        </div>
      </div>
    </main>
  );
}
