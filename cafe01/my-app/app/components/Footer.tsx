import Link from "next/link";
import SectionHeading from "./SectionHeading";
import { FaCoffee, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer id="contact" className="bg-cafe-dark text-white/80 pt-24 pb-12 border-t-4 border-cafe-secondary relative overflow-hidden">
      {/* Visual map placeholder in the background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="col-span-1 lg:col-span-1 flex flex-col items-start text-left">
            <div className="flex items-center gap-2 mb-6 text-white">
              <div className="w-10 h-10 rounded-full bg-cafe-secondary text-cafe-dark flex items-center justify-center">
                <FaCoffee size={20} />
              </div>
              <span className="font-serif text-3xl font-bold">Brew&apos;s</span>
            </div>
            <p className="text-gray-400 leading-loose mb-6">
              Crafting perfect moments, one cup at a time. We source our beans ethically and roast them locally for the best flavor.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-cafe-secondary hover:text-white transition-colors">
                <FaFacebookF />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-cafe-secondary hover:text-white transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-cafe-secondary hover:text-white transition-colors">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-xl font-serif font-bold text-white mb-6 uppercase tracking-wider relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-cafe-secondary"></span>
            </h4>
            <ul className="space-y-4 font-medium text-gray-400">
              <li><Link href="#home" className="hover:text-cafe-secondary transition-colors inline-block w-full">Home</Link></li>
              <li><Link href="#about" className="hover:text-cafe-secondary transition-colors inline-block w-full">About Us</Link></li>
              <li><Link href="#menu" className="hover:text-cafe-secondary transition-colors inline-block w-full">Our Menu</Link></li>
              <li><Link href="#reservation" className="hover:text-cafe-secondary transition-colors inline-block w-full">Reservations</Link></li>
              <li><Link href="#contact" className="hover:text-cafe-secondary transition-colors inline-block w-full">Contact</Link></li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="col-span-1">
            <h4 className="text-xl font-serif font-bold text-white mb-6 uppercase tracking-wider relative inline-block">
              Working Hours
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-cafe-secondary"></span>
            </h4>
            <ul className="space-y-4 text-gray-400 font-medium">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Mon - Fri:</span>
                <span className="text-cafe-secondary font-bold">07:00 AM - 08:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Saturday:</span>
                <span className="text-cafe-secondary font-bold">08:00 AM - 09:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Sunday:</span>
                <span className="text-cafe-secondary font-bold">08:00 AM - 04:00 PM</span>
              </li>
              <li className="pt-2 text-sm italic text-cafe-secondary">
                * We are closed on major public holidays.
              </li>
            </ul>
          </div>

          {/* Find Us */}
          <div className="col-span-1">
            <h4 className="text-xl font-serif font-bold text-white mb-6 uppercase tracking-wider relative inline-block">
              Find Us Here
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-cafe-secondary"></span>
            </h4>
            <div className="space-y-4 text-gray-400 font-medium">
              <div className="flex items-start gap-4">
                <FaMapMarkerAlt className="text-cafe-secondary mt-1 flex-shrink-0" />
                <p>123 Coffee Avenue,<br/>Brewery District,<br/>New York, NY 10012</p>
              </div>
              <div className="flex items-center gap-4 group">
                <FaPhoneAlt className="text-cafe-secondary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">+1 (234) 567-890</a>
              </div>
              <div className="flex items-center gap-4 group">
                <FaEnvelope className="text-cafe-secondary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="mailto:hello@brewscafe.com" className="hover:text-white transition-colors">hello@brewscafe.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 font-medium font-sans">
          <p>&copy; 2026 Brew's Cafe. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
