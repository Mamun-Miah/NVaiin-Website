"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-nv-black flex flex-col items-center justify-center px-4 text-center">
      <div className="relative">
        <h1 className="font-anton text-[8rem] sm:text-[12rem] md:text-[16rem] leading-none text-nv-red/20 select-none">
          ERR
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="font-anton text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider text-nv-white">
            SOMETHING BROKE
          </h2>
        </div>
      </div>
      <div className="w-24 h-px bg-nv-red mx-auto my-8" />
      <p className="font-mono-brand text-sm text-nv-fog max-w-md">
        A critical error occurred. This wasn&apos;t made in vain — but it
        wasn&apos;t supposed to happen either.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="bg-nv-gold text-nv-black font-anton tracking-wider px-8 py-4 hover:scale-105 transition-transform duration-300"
        >
          TRY AGAIN
        </button>
        <a
          href="/"
          className="border border-nv-gold text-nv-gold font-anton tracking-wider px-8 py-4 hover:bg-nv-gold hover:text-nv-black transition-all duration-300"
        >
          GO HOME
        </a>
      </div>
    </div>
  );
}
