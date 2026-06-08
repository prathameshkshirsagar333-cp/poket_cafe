"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import SectionHeading from "./SectionHeading";
import { FaFire } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";

export default function Specials() {
  const router = useRouter();
  const { addToCart } = useCart();

  const specials = [
    {
      id: 1,
      title: "Paneer Tikka Sandwich",
      description: "Grilled sourdough sandwich loaded with spicy paneer tikka, mint chutney, and molten cheese.",
      price: "₹240",
      image: "/menu/special_paneer_tikka_sandwich.png",
      category: "Specials",
    },
    {
      id: 2,
      title: "Special Samosa Chaat",
      description: "Crushed crispy samosas topped with sweet yogurt, tangy tamarind, mint chutney, and sev.",
      price: "₹150",
      image: "/menu/special_samosa_chaat.png",
      category: "Specials",
    },
    {
      id: 3,
      title: "Almond Mango Lassi",
      description: "Thick, creamy yogurt blended with Alphonso mangoes, garnished with sliced almonds and saffron.",
      price: "₹120",
      image: "/menu/special_mango_lassi.png",
      category: "Specials",
    },
  ];

  const handleAddToCart = async (special: any) => {
    // Parse price string to number (e.g. '₹240' -> 240)
    const numericPrice = parseInt(special.price.replace(/[₹,]/g, ""), 10);
    
    await addToCart({
      productId: special.id + 1000, // offset id to avoid collision with normal menu items
      name: special.title,
      price: numericPrice,
      priceDisplay: special.price,
      image: special.image,
      category: special.category,
    });
  };

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading 
          subtitle="Chef's Picks"
          title="Today's Specials"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {specials.map((special) => (
            <div 
              key={special.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300 border border-gray-100 group"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={special.image}
                  alt={special.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
                  <FaFire size={18} />
                </div>
              </div>
              <div className="p-8 text-center flex flex-col items-center">
                <h3 className="text-2xl font-serif font-bold text-cafe-dark mb-3">{special.title}</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">{special.description}</p>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-cafe-secondary">{special.price}</span>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <button 
                    onClick={() => handleAddToCart(special)}
                    className="text-cafe-primary font-semibold hover:text-cafe-secondary uppercase tracking-wider text-sm transition-colors cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
