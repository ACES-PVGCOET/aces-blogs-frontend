import ThemeToggle from "./ThemeToggle";

export default function AdminHeader() {
  return (
    <header className="border-b-2 border-stone-900 bg-white px-6 py-5 transition-colors duration-200 dark:border-stone-800 dark:bg-stone-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <p className="font-editorial text-[10px] font-bold uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400">
            Official Publication • Writer&apos;s Edition
          </p>
          <h1 className="font-headline text-2xl font-black uppercase tracking-[0.18em] text-stone-950 sm:text-3xl dark:text-stone-100">
            ACES Chronicle
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 border-stone-300 pr-4 text-right sm:flex sm:border-r dark:border-stone-800">
            <span className="font-editorial text-xs font-bold uppercase tracking-[0.16em] text-stone-700 dark:text-stone-300">
              Editorial Desk
            </span>
            <span className="font-editorial text-[11px] text-stone-400 dark:text-stone-600">
              |
            </span>
            <span className="font-editorial text-xs italic text-stone-500 dark:text-stone-400">
              Draft &amp; Dispatch
            </span>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
