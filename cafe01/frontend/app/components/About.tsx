import Image from "next/image";
import SectionHeading from "./SectionHeading";
import { FaCoffee, FaLeaf, FaBreadSlice } from "react-icons/fa";

export default function About() {
  const features = [
    {
      icon: <FaCoffee size={24} />,
      title: "Premium Beans",
      description: "Sourced from the best coffee farms around the world.",
    },
    {
      icon: <FaBreadSlice size={24} />,
      title: "Freshly Baked",
      description: "Artisanal pastries baked fresh every morning.",
    },
    {
      icon: <FaLeaf size={24} />,
      title: "Organically Grown",
      description: "Committed to sustainable and organic farming practices.",
    },
  ];

  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-cafe-surface/50 rounded-l-[100px] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Image Side */}
          <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl group">
            <Image
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop"
              alt="Barista pouring latte art"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Experience Badge */}
            <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-cafe-primary/10">
              <div className="text-cafe-primary font-bold text-3xl font-serif">10+</div>
              <div className="text-cafe-dark text-sm uppercase tracking-wider font-semibold">Years of<br/>Excellence</div>
            </div>
          </div>

          {/* Content Side */}
          <div className="flex flex-col">
            <SectionHeading 
              subtitle="About Us"
              title="Discover Our Story"
              centered={false}
            />
            
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Founded in 2014, Brew&apos;s Cafe has been dedicated to the art of coffee. We believe that a great cup of coffee can inspire creativity, spark conversations, and bring people together. Our master roasters carefully select only the finest arabica beans.
            </p>

            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-cafe-primary/5 text-cafe-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-cafe-dark mb-1 font-serif">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <div 
                className="text-2xl text-cafe-primary opacity-80"
                style={{ 
                  fontFamily: "'Dancing Script', 'Brush Script MT', 'Bradley Hand', cursive",
                  transform: 'rotate(-2deg)',
                  display: 'inline-block'
                }}
              >
                Prathamesh Kshirsagar
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
