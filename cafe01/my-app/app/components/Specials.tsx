import Image from "next/image";
import SectionHeading from "./SectionHeading";
import { FaFire } from "react-icons/fa";

export default function Specials() {
  const specials = [
    {
      id: 1,
      title: "Hazelnut Mocha",
      description: "Rich espresso combined with bittersweet mocha sauce, hazelnut syrup, and steamed milk.",
      price: "$6.00",
      image: "https://images.unsplash.com/photo-1572442388796-1166b24d9c72?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Berry Chocolate Tart",
      description: "A decadent dark chocolate tart topped with fresh seasonal berries and a dusting of powder.",
      price: "$8.50",
      image: "https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Avocado Toast",
      description: "Smashed avocado on artisan sourdough, topped with cherry tomatoes and microgreens.",
      price: "$9.00",
      image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=600&auto=format&fit=crop",
    },
  ];

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
                  <button className="text-cafe-primary font-semibold hover:text-cafe-secondary uppercase tracking-wider text-sm transition-colors">
                    Order Now
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
