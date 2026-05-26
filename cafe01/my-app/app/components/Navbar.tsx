"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "./Logo";
import CartButton from "./CartButton";

import { useSession, signOut, signIn } from "next-auth/react";
import { 
  FaUserCircle, 
  FaTachometerAlt, 
  FaSignOutAlt, 
  FaChevronDown,
  FaListAlt,
  FaInstagram
} from "react-icons/fa";

export default function Navbar() {
  const { data: session, status } = useSession();
  
  // State for interactive features
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");

  const navLinks = ["Home", "About", "Menu", "Contact"];

  // 1. Sticky Scroll Effect & Active Section Highlighting
  useEffect(() => {
    const handleScroll = () => {
      // Toggle sticky visual state after 20px scroll
      setIsScrolled(window.scrollY > 20);
      
      // Determine active section using scroll position logic
      const sections = navLinks.map(link => link.toLowerCase());
      
      // Read bottom-to-top to find the lowest visible section within viewport
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        
        // Edge case: if we are near the very top, highly default to Home
        if (sectionId === 'home' && window.scrollY < 200) {
          setActiveSection("Home");
          break;
        }
        
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Detect when a section title hits the upper third of the viewport
          if (rect.top <= 150) {
            setActiveSection(navLinks[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        isScrolled 
          ? "bg-[#1A110C]/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-2 border-b border-white/5" 
          : "bg-gradient-to-b from-[#1A110C]/90 to-transparent backdrop-blur-sm py-3 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center transition-all duration-300 h-[50px] md:h-[60px]">
          
          {/* BRAND LOGO - Responsive & Compact */}
          <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-cafe-primary rounded-xl transition-transform duration-300 hover:scale-105">
            <div className={`transition-all duration-500 ease-out origin-left flex items-center justify-center ${
              isScrolled ? "h-9 md:h-10" : "h-14 md:h-[65px]"
            }`}>
              <Logo className="h-full w-auto drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(192,157,108,0.4)]" />
            </div>
          </Link>

          {/* DESKTOP NAVIGATION - Highlight & Hover Animations */}
          <div className="hidden md:flex space-x-2 lg:space-x-6 items-center">
            {navLinks.map((item) => {
              const isActive = activeSection === item;
              return (
                <Link
                  key={item}
                  href={item === "Home" ? "/" : `/#${item.toLowerCase()}`}
                  onClick={() => setActiveSection(item)}
                  className={`px-4 py-2 rounded-full font-bold text-[14px] uppercase tracking-wider transition-all duration-300 relative group overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-cafe-secondary ${
                    isActive ? "text-[#1A110C]" : "text-white/80 hover:text-white"
                  }`}
                >
                  <span className="relative z-10">{item}</span>
                  
                  {/* Glassmorphism active pill background */}
                  <span className={`absolute inset-0 bg-cafe-secondary shadow-sm rounded-full transition-all duration-300 ease-out ${
                    isActive ? "opacity-100 scale-100" : "opacity-0 scale-50 group-hover:opacity-20 group-hover:scale-100"
                  }`}></span>
                  
                  {/* Subtle growing dot indicator */}
                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-white transition-all duration-300 ease-out ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-50"
                  }`}></span>
                </Link>
              );
            })}
          </div>

          {/* DESKTOP AUTH & DROPDOWNS */}
          <div className="hidden md:flex items-center gap-4">
            <CartButton />
            {status === "authenticated" ? (
              <div className="relative group perspective-1000">
                <button className={`flex items-center gap-2.5 px-4 py-2 rounded-full transition-all duration-300 font-bold tracking-wide uppercase text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-cafe-secondary border ${
                  isScrolled 
                    ? "border-white/10 bg-white/5 text-white hover:border-cafe-secondary hover:text-cafe-secondary hover:bg-white/10"
                    : "border-white/20 bg-black/20 text-white hover:bg-cafe-secondary hover:text-[#1A110C] hover:border-cafe-secondary"
                }`}>
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-[22px] h-[22px] rounded-full object-cover shadow-sm" />
                  ) : (
                    <FaUserCircle size={22} className="opacity-90" /> 
                  )}
                  <span className="max-w-[100px] truncate leading-none mt-0.5">{session?.user?.name?.split(' ')[0] || "Account"}</span>
                  <FaChevronDown size={10} className="opacity-70 group-hover:rotate-180 transition-transform duration-300 ease-out mt-0.5" />
                </button>
                
                {/* 3D Dropdown Menu (Glassmorphic) */}
                <div className="absolute right-0 mt-4 w-60 bg-white/95 backdrop-blur-3xl border border-gray-100 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 shadow-cafe-primary/5 transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex flex-col overflow-hidden z-[60] origin-top">
                  <div className="px-5 py-5 border-b border-gray-50 bg-gradient-to-br from-amber-50/50 to-white/50 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {session?.user?.image ? (
                        <img src={session.user.image} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                      ) : (
                        <FaUserCircle className="w-12 h-12 text-gray-300" /> 
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-0.5">Signed in securely</p>
                      <p className="text-[15px] font-bold text-cafe-dark truncate">
                         {session?.user?.name || "Premium Guest"}
                      </p>
                      <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{session?.user?.email}</p>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link 
                      href="/admin/orders" 
                      className="group/item px-4 py-3 text-[14px] font-bold text-gray-600 rounded-xl hover:bg-amber-50 hover:text-cafe-primary flex items-center gap-3 transition-colors"
                    >
                      <FaTachometerAlt className="text-gray-400 group-hover/item:text-cafe-secondary/80 transition-colors" /> Admin Dashboard
                    </Link>
                    <Link 
                      href="/dashboard" 
                      className="group/item px-4 py-3 text-[14px] font-bold text-gray-600 rounded-xl hover:bg-amber-50 hover:text-cafe-primary flex items-center gap-3 transition-colors"
                    >
                      <FaTachometerAlt className="text-gray-400 group-hover/item:text-cafe-secondary/80 transition-colors" /> User View
                    </Link>
                    <Link 
                      href="/orders" 
                      className="group/item px-4 py-3 text-[14px] font-bold text-gray-600 rounded-xl hover:bg-amber-50 hover:text-cafe-primary flex items-center gap-3 transition-colors"
                    >
                      <FaListAlt className="text-gray-400 group-hover/item:text-cafe-secondary/80 transition-colors" /> My Orders
                    </Link>
                    <button 
                      onClick={() => signOut({ callbackUrl: "/login" })} 
                      className="group/item w-full px-4 py-3 text-[14px] font-bold text-gray-500 rounded-xl hover:bg-rose-50 text-left flex items-center gap-3 transition-colors"
                    >
                      <FaSignOutAlt className="text-gray-400 group-hover/item:text-rose-500 transition-colors" /> Secure Log Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={`px-8 py-2.5 rounded-full font-bold uppercase tracking-widest text-[13px] transition-all duration-300 ease-out outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A110C] focus-visible:ring-cafe-secondary ${
                    isScrolled
                      ? "bg-cafe-secondary text-[#1A110C] hover:bg-white shadow-lg hover:-translate-y-0.5"
                      : "bg-white text-[#1A110C] hover:bg-cafe-secondary shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  Log In
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (process.env.NEXT_PUBLIC_INSTAGRAM_READY !== "true") {
                      alert("Instagram Login is currently in Developer Mode. Please configure your App ID and Secret in .env.local to enable this feature.");
                      return;
                    }
                    signIn("instagram", { callbackUrl: "/" });
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 font-bold tracking-wide uppercase text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-cafe-secondary border ${
                    isScrolled 
                      ? "border-white/10 bg-white/5 text-white hover:border-cafe-secondary hover:text-cafe-secondary hover:bg-white/10"
                      : "border-white/20 bg-black/20 text-white hover:bg-cafe-secondary hover:text-[#1A110C] hover:border-cafe-secondary"
                  }`}
                  title="Sign In with Instagram"
                >
                  <FaInstagram size={18} />
                  <span className="hidden lg:inline">Instagram</span>
                </button>
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER TOGGLE */}
          <div className="md:hidden flex items-center gap-3">
            <CartButton />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative z-[70] p-2 rounded-xl text-cafe-dark hover:bg-gray-100 outline-none transition-colors"
              aria-label="Toggle mobile menu"
            >
              <div className="relative w-6 h-5 flex flex-col justify-between items-center overflow-hidden">
                <span className={`w-full h-0.5 bg-current rounded-full transform transition-all duration-300 ease-out origin-left ${mobileMenuOpen ? "rotate-[42deg] translate-x-1" : ""}`} />
                <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-200 ease-out ${mobileMenuOpen ? "opacity-0 translate-x-4" : "opacity-100"}`} />
                <span className={`w-full h-0.5 bg-current rounded-full transform transition-all duration-300 ease-out origin-left ${mobileMenuOpen ? "-rotate-[42deg] translate-x-1" : ""}`} />
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE POP-OUT OVERLAY MENU */}
      <div 
        className={`fixed inset-x-0 top-[100%] bg-white/95 backdrop-blur-3xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] md:hidden overflow-hidden ${
          mobileMenuOpen ? "max-h-[600px] border-b border-gray-100 opacity-100 visible" : "max-h-0 border-transparent opacity-0 invisible"
        }`}
      >
        <div className="px-6 py-8 flex flex-col gap-3">
          {navLinks.map((item, index) => {
            const isActive = activeSection === item;
            return (
              <Link
                key={item}
                href={item === "Home" ? "/" : `/#${item.toLowerCase()}`}
                onClick={() => {
                  setActiveSection(item);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl text-[18px] font-black uppercase tracking-wider transition-all duration-300 ${
                  isActive 
                    ? "bg-cafe-primary text-white shadow-lg shadow-cafe-primary/20" 
                    : "bg-gray-50 text-gray-500 hover:bg-amber-50 hover:text-cafe-dark"
                }`}
                style={{ 
                  transform: mobileMenuOpen ? "translateY(0)" : "translateY(-15px)",
                  opacity: mobileMenuOpen ? 1 : 0,
                  transitionDelay: `${index * 40}ms`
                }}
              >
                {item}
                {isActive && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              </Link>
            )
          })}
          
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4 opacity-50 w-full" />
          
          {/* Mobile Auth Button */}
          {status === "authenticated" ? (
            <div 
              className="flex flex-col gap-2 transition-all duration-500"
              style={{ 
                transform: mobileMenuOpen ? "translateY(0)" : "translateY(-15px)",
                opacity: mobileMenuOpen ? 1 : 0,
                transitionDelay: `300ms`
              }}
            >
               <div className="px-4 py-3 bg-amber-50/50 rounded-2xl flex items-center gap-4 mb-2">
                  <div className="flex-shrink-0">
                    {session?.user?.image ? (
                      <img src={session.user.image} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-cafe-primary text-white flex items-center justify-center shadow-inner">
                        <FaUserCircle size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-[11px] text-cafe-primary font-bold uppercase tracking-widest mb-0.5">Premium Account</p>
                    <p className="text-[15px] font-extrabold text-cafe-dark truncate">{session?.user?.name || "Guest"}</p>
                  </div>
               </div>
               <Link 
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-center text-gray-600 font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform"
               >
                 <FaTachometerAlt /> Open Dashboard
               </Link>
               <button 
                  onClick={() => {
                    signOut({ callbackUrl: "/login" });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-5 py-4 bg-rose-50 rounded-2xl text-center text-rose-600 font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform"
               >
                 <FaSignOutAlt /> Secure Log Out
               </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2"
              style={{ 
                transform: mobileMenuOpen ? "translateY(0)" : "translateY(-15px)",
                opacity: mobileMenuOpen ? 1 : 0,
                transitionDelay: `300ms`
              }}
            >
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-4 rounded-2xl bg-cafe-dark text-white text-center font-black uppercase tracking-widest text-[15px] shadow-xl hover:bg-cafe-primary active:scale-95 transition-all duration-300"
              >
                Secure Log In
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (process.env.NEXT_PUBLIC_INSTAGRAM_READY !== "true") {
                    alert("Instagram Login is currently in Developer Mode. Please configure your App ID and Secret in .env.local to enable this feature.");
                    return;
                  }
                  signIn("instagram", { callbackUrl: "/" });
                }}
                className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border-2 border-gray-100 text-gray-700 font-black uppercase tracking-widest text-[15px] shadow-sm hover:bg-gray-50 active:scale-95 transition-all duration-300"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" 
                  alt="Instagram" 
                  className="w-[20px] h-[20px]" 
                />
                <span className="sm:hidden">Instagram</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </nav>
  );
}
