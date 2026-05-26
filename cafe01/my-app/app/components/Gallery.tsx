import Image from "next/image";
import SectionHeading from "./SectionHeading";
import { FaInstagram } from "react-icons/fa";

export default function Gallery() {
  const images = [
    { src: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop", alt: "Coffee bean roasting", className: "col-span-1 row-span-2 h-full" },
    { src: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop", alt: "Latte art", className: "col-span-1 row-span-1 h-64" },
    { src: "https://images.unsplash.com/photo-1481833761820-0509d3217039?q=80&w=600&auto=format&fit=crop", alt: "Cafe interior", className: "col-span-1 row-span-1 h-64" },
    { src: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop", alt: "Pour over coffee", className: "col-span-2 row-span-1 h-64 sm:h-80" },
    { src: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop", alt: "Coffee cups", className: "col-span-1 row-span-1 h-64 sm:h-80" },
  ];

  return (
    <section className="py-24 bg-cafe-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading 
          subtitle="A Glimpse of the Brew"
          title="Cafe Gallery"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mt-12 auto-rows-auto">
          {images.map((img, index) => (
            <div 
              key={index} 
              className={`relative overflow-hidden rounded-xl group cursor-pointer ${img.className}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-cafe-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <FaInstagram className="text-white text-3xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="px-8 py-3 rounded-full border border-cafe-primary text-cafe-primary hover:bg-cafe-primary hover:text-white transition-all duration-300 font-medium tracking-wide inline-flex items-center gap-2">
            <FaInstagram /> Follow @brews_cafe
          </button>
        </div>
      </div>
    </section>
  );
}
