export default function NotFound() {
  return (
    <div className="min-h-screen bg-nv-black flex flex-col items-center justify-center px-4 text-center">
      <div className="relative">
        <h1 className="font-anton text-[8rem] sm:text-[12rem] md:text-[16rem] leading-none text-nv-smoke/20 select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="font-anton text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider text-nv-white">
            PAGE NOT FOUND
          </h2>
        </div>
      </div>
      <div className="w-24 h-px bg-nv-gold mx-auto my-8" />
      <p className="font-mono-brand text-sm text-nv-fog max-w-md">
        This piece doesn&apos;t exist — or it never did. Not everything is made
        to be found.
      </p>
      <a
        href="/"
        className="mt-8 bg-nv-gold text-nv-black font-anton tracking-wider px-8 py-4 hover:scale-105 transition-transform duration-300"
      >
        RETURN HOME
      </a>
    </div>
  );
}
