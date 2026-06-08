import Image from "next/image";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border-2 border-cafe-secondary/40 shadow-[0_0_10px_rgba(197,160,89,0.3)]">
        <Image 
          src="/poket_cafe_logo.png" 
          alt="Poket Cafe Logo" 
          fill 
          className="object-cover"
        />
      </div>
      <div className="flex flex-col">
        <span className="font-serif font-bold text-white text-lg sm:text-xl leading-none tracking-wider uppercase">
          Poket
        </span>
        <span className="font-sans font-medium text-cafe-secondary text-[10px] sm:text-xs tracking-[0.2em] uppercase leading-tight">
          Cafe
        </span>
      </div>
    </div>
  );
}
