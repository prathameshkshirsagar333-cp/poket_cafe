import SectionHeading from "./SectionHeading";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Jenkins",
      role: "Local Artist",
      content: "The best place in town to relax and let creativity flow. Their Caramel Macchiato is simply divine, and the staff always remembers my name.",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Freelance Designer",
      content: "I basically live here during the weekdays. Excellent Wi-Fi, perfect background music, and pastries that taste like they were flown in from Paris.",
      rating: 5
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Food Blogger",
      content: "An absolute hidden gem! The attention to detail in their pour-over coffee is unmatched. Highly recommend the Avocado Toast as well.",
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-cafe-primary relative overflow-hidden">
      {/* Background Pattern Map / Texture */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading 
          subtitle="What Our Guests Say"
          title="Customer Reviews"
          light={true}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-white rounded-2xl p-8 shadow-xl relative mt-8 md:mt-0"
            >
              <div className="absolute -top-6 left-8 bg-cafe-secondary text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                <FaQuoteLeft size={18} />
              </div>
              
              <div className="flex gap-1 mb-6 mt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" size={16} />
                ))}
              </div>
              
              <p className="text-gray-600 mb-8 italic leading-relaxed font-medium text-lg">
                "{testimonial.content}"
              </p>
              
              <div className="border-t border-gray-100 pt-6">
                <h4 className="font-serif font-bold text-cafe-dark text-lg">{testimonial.name}</h4>
                <p className="text-cafe-secondary text-sm font-semibold">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
