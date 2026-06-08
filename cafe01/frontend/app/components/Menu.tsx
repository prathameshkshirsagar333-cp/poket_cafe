"use client";

import { useState, useCallback } from "react";
import SectionHeading from "./SectionHeading";
import { useCart } from "@/app/context/CartContext";
import CartToast, { type ToastItem } from "./CartToast";
import { motion } from "framer-motion";

type Category = "All" | "Coffee" | "Tea" | "Snacks" | "Dessert";

interface MenuItem {
  id: number;
  name: string;
  category: Category;
  description: string;
  price: string;
  image: string;
  popular?: boolean;
}

const menuItems: MenuItem[] = [
  // COFFEE
  { id: 1,  name: "Madras Filter Coffee",       category: "Coffee",  price: "₹90",  description: "Classic South Indian coffee brewed in a brass filter, served in a traditional dabarah and tumbler with frothy milk.",                       image: "/menu/madras_filter_coffee.png", popular: true },
  { id: 2,  name: "Kumbakonam Degree Coffee",   category: "Coffee",  price: "₹110", description: "Rich, aromatic coffee brewed with chicory-infused decoction and pure cow's milk.",                                                           image: "/menu/kumbakonam_degree_coffee.png", popular: true },
  { id: 3,  name: "Monsooned Malabar Coffee",   category: "Coffee",  price: "₹180", description: "Exotic Indian Arabica beans exposed to monsoon winds, resulting in a rich, low-acid, heavy-bodied cup.",                                   image: "/menu/monsooned_malabar.png" },
  { id: 4,  name: "Karupatti Kaapi",            category: "Coffee",  price: "₹100", description: "Traditional black coffee sweetened with unrefined palm jaggery, boasting deep molasses flavors.",                                            image: "/menu/karupatti_kaapi.png" },
  { id: 5,  name: "Mysore Nuggets Coffee",      category: "Coffee",  price: "₹160", description: "Premium washed Arabica beans from Mysore, delivering smooth, chocolatey undertones.",                                                         image: "/menu/mysore_nuggets.png", popular: true },
  { id: 6,  name: "Cardamom Spiced Coffee",     category: "Coffee",  price: "₹120", description: "Strong, slow-boiled coffee infused with freshly ground green cardamom pods.",                                                              image: "/menu/cardamom_coffee.png" },

  // TEA
  { id: 7,  name: "Masala Chai",                category: "Tea",     price: "₹80",  description: "Strong black tea brewed with fresh milk, crushed ginger, cardamom, cloves, and cinnamon.",                                                  image: "/menu/masala_chai.png", popular: true },
  { id: 8,  name: "Irani Chai",                 category: "Tea",     price: "₹90",  description: "Rich, creamy, slow-brewed tea prepared with condensed milk in Hyderabad style.",                                                              image: "/menu/irani_chai.png", popular: true },
  { id: 9,  name: "Kashmiri Kahwa",             category: "Tea",     price: "₹140", description: "Exotic green tea steeped with Kashmiri saffron, cinnamon, cloves, and garnished with almond slivers.",                                       image: "/menu/kashmiri_kahwa.png" },
  { id: 10, name: "Tandoori Chai",              category: "Tea",     price: "₹110", description: "A hot clay kulhad is roasted in a tandoor, then piping hot tea is poured over it to create a unique smoky flavor.",                         image: "/menu/tandoori_chai.png", popular: true },
  { id: 11, name: "Sulaimani Tea",              category: "Tea",     price: "₹70",  description: "Malabar-style golden black tea, brewed with secret spices and finished with fresh lemon and mint.",                                         image: "/menu/sulaimani_tea.png" },
  { id: 12, name: "Adrak Ginger Chai",          category: "Tea",     price: "₹75",  description: "A popular daily Indian tea brewed with fresh crushed ginger root, warming and refreshing.",                                                  image: "/menu/adrak_chai.png" },

  // SNACKS
  { id: 13, name: "Samosa",                     category: "Snacks",  price: "₹80",  description: "Crispy triangular pastry shells stuffed with spicy potatoes and peas, served with sweet tamarind and mint chutneys.",                        image: "/menu/samosa.png", popular: true },
  { id: 14, name: "Vada Pav",                   category: "Snacks",  price: "₹90",  description: "Mumbai's legendary street food—deep-fried spicy potato dumplings placed inside soft bread buns with garlic chutney.",                         image: "/menu/vada_pav.png", popular: true },
  { id: 15, name: "Paneer Tikka",               category: "Snacks",  price: "₹180", description: "Cottage cheese cubes marinated in yogurt and spices, skewed with bell peppers and roasted to perfection.",                                     image: "/menu/paneer_tikka.png", popular: true },
  { id: 16, name: "Kanda Bhaji (Onion Pakoda)", category: "Snacks",  price: "₹90",  description: "Crispy, golden-fried onion fritters spiced with carom seeds and green chilies.",                                                             image: "/menu/kanda_bhaji.png" },
  { id: 17, name: "Dhokla",                     category: "Snacks",  price: "₹95",  description: "Light, spongy, steamed savory cakes made from fermented gram flour, tempered with mustard seeds and curry leaves.",                          image: "/menu/dhokla.png" },
  { id: 18, name: "Pav Bhaji",                  category: "Snacks",  price: "₹160", description: "A rich, spicy mashed vegetable curry loaded with butter, served with soft toasted pav (bread rolls).",                                         image: "/menu/pav_bhaji.png" },

  // DESSERT
  { id: 19, name: "Gulab Jamun",                category: "Dessert", price: "₹100", description: "Warm milk-solid dumplings, golden-fried and soaked in a sweet cardamom and rosewater syrup.",                                                 image: "/menu/gulab-jamun.jpg", popular: true },
  { id: 20, name: "Rasmalai",                   category: "Dessert", price: "₹130", description: "Soft, spongy cheese patties soaked in sweet, cardamom and saffron flavored condensed milk.",                                              image: "/menu/rasmalai.png", popular: true },
  { id: 21, name: "Kulfi Falooda",              category: "Dessert", price: "₹150", description: "Rich, dense traditional Indian ice cream served on a bed of cornstarch vermicelli, rose syrup, and sweet basil seeds.",                             image: "/menu/kulfi_falooda.png" },
  { id: 22, name: "Gajar Ka Halwa",             category: "Dessert", price: "₹120", description: "Warm carrot pudding slow-cooked with milk, ghee, sugar, and studded with cashews and raisins.",                                                image: "/menu/gajar_ka_halwa.png", popular: true },
  { id: 23, name: "Jalebi with Rabri",          category: "Dessert", price: "₹140", description: "Crisp, spiral-shaped deep-fried batter soaked in warm sugar syrup, served with creamy, thick reduced milk (rabri).",                       image: "/menu/jalebi_with_rabri.png" },
  { id: 24, name: "Mysore Pak",                 category: "Dessert", price: "₹110", description: "A classic South Indian sweet made of chickpea flour, generous amounts of pure ghee, and sugar.",                                            image: "/menu/mysore_pak.png" },
];

function parsePrice(p: string) {
  return parseInt(p.replace(/[₹,]/g, ""), 10);
}

// ─── Design tokens (Tailwind-independent) ────────────────────────────────────
const GREEN        = "#22c55e";
const GREEN_DARK   = "#16a34a";
const CAFE_PRIMARY = "#5c4033";
const CAFE_SECONDARY = "#C5A059";

// ─── Button style factories ───────────────────────────────────────────────────
function getBtnStyle(inCart: boolean, justAdded: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontWeight: 700,
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    padding: "10px 20px",
    borderRadius: "99px",
    cursor: "pointer",
    transition: "all 0.25s ease",
    userSelect: "none",
    whiteSpace: "nowrap",
    width: "100%",
  };

  if (inCart) {
    return {
      ...base,
      background: justAdded
        ? `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`
        : `linear-gradient(135deg, #16a34a 0%, #15803d 100%)`,
      color: "white",
      border: `2px solid ${GREEN}`,
      boxShadow: justAdded
        ? `0 0 0 4px ${GREEN}44, 0 6px 20px ${GREEN}66`
        : `0 4px 14px ${GREEN}55`,
      transform: justAdded ? "scale(1.06)" : "scale(1)",
    };
  }
  return {
    ...base,
    background: `${CAFE_PRIMARY}14`,
    color: CAFE_PRIMARY,
    border: `1.5px solid ${CAFE_PRIMARY}33`,
    boxShadow: "none",
    transform: "scale(1)",
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const { addToCart, cartItems } = useCart();

  // Tracks items that were JUST clicked (for the 2-second "burst" animation on top of the persistent state)
  const [justAddedIds, setJustAddedIds] = useState<Set<number>>(new Set());
  const [currentToast, setCurrentToast] = useState<ToastItem | null>(null);

  const categories: Category[] = ["All", "Coffee", "Tea", "Snacks", "Dessert"];
  const filteredItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((i) => i.category === activeCategory);

  // Helper: is this item already in the cart?
  const getCartItem = useCallback(
    (id: number) => cartItems.find((ci) => ci.productId === id),
    [cartItems]
  );

  const handleAddToCart = useCallback(
    async (item: MenuItem) => {
      await addToCart({
        productId: item.id,
        name: item.name,
        price: parsePrice(item.price),
        priceDisplay: item.price,
        image: item.image,
        category: item.category,
      });

      // Mark as "just added" for the burst animation
      setJustAddedIds((prev) => new Set(prev).add(item.id));
      setTimeout(() => {
        setJustAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }, 2000);

      // Show toast
      setCurrentToast({
        id: `${item.id}-${Date.now()}`,
        name: item.name,
        price: item.price,
        image: item.image,
      });
    },
    [addToCart]
  );

  const handleDismissToast = useCallback(() => setCurrentToast(null), []);

  return (
    <>
      <section id="menu" className="py-24 bg-cafe-surface relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading subtitle="Our Menu" title="Discover Our Offerings" />

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`menu-filter-${cat.toLowerCase()}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-full font-medium transition-all duration-300 text-sm tracking-wide ${
                  activeCategory === cat
                    ? "bg-cafe-primary text-white shadow-md scale-105"
                    : "bg-background text-cafe-dark border border-cafe-primary/20 hover:border-cafe-primary hover:bg-cafe-primary/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => {
              const cartItem  = getCartItem(item.id);
              const inCart    = !!cartItem;
              const justAdded = justAddedIds.has(item.id);
              const qty       = cartItem?.quantity ?? 0;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  key={item.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "border 0.35s ease, box-shadow 0.35s ease",
                    border: inCart
                      ? `2.5px solid ${GREEN}`
                      : "1px solid rgba(92,64,51,0.10)",
                    boxShadow: inCart
                      ? `0 0 0 4px ${GREEN}22, 0 12px 36px rgba(34,197,94,0.15)`
                      : "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* ── Image ── */}
                  <div className="relative h-64 overflow-hidden" style={{ background: "#f3f4f6" }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      style={{ transform: inCart ? "scale(1.04)" : "scale(1)", transition: "transform 0.4s ease" }}
                    />

                    {/* Dark hover overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />

                    {/* Green tint overlay for in-cart items */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(22,163,74,0.18)",
                        opacity: inCart ? 1 : 0,
                        transition: "opacity 0.35s ease",
                        pointerEvents: "none",
                      }}
                    />

                    {/* ── Top-left badge ── */}
                    {inCart ? (
                      <div
                        className="absolute top-4 left-4 flex items-center gap-1.5 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-full shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
                          boxShadow: `0 4px 12px ${GREEN}66`,
                          animation: justAdded ? "fadeInUp 0.35s ease-out" : "none",
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {qty > 1 ? `In Cart ×${qty}` : "In Cart"}
                      </div>
                    ) : item.popular ? (
                      <div
                        className="absolute top-4 left-4 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md"
                        style={{ background: CAFE_SECONDARY }}
                      >
                        Popular
                      </div>
                    ) : null}

                    {/* ── Quantity chip (top-right) when qty > 1 ── */}
                    {qty > 1 && (
                      <div
                        className="absolute top-4 right-4 flex items-center justify-center text-white text-xs font-black rounded-full w-7 h-7 shadow-lg"
                        style={{
                          background: GREEN,
                          boxShadow: `0 2px 10px ${GREEN}88`,
                          animation: "cartBadgePop 0.4s cubic-bezier(0.36,0.07,0.19,0.97) forwards",
                        }}
                      >
                        {qty}
                      </div>
                    )}
                  </div>

                  {/* ── Card Body ── */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-2xl font-bold text-cafe-dark leading-snug">
                        {item.name}
                      </h3>
                      <span
                        className="font-bold text-xl ml-2 flex-shrink-0"
                        style={{ color: CAFE_SECONDARY }}
                      >
                        {item.price}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed">
                      {item.description}
                    </p>

                    {/* ── Bottom Row ── */}
                    <div
                      className="mt-auto pt-4 space-y-3"
                      style={{
                        borderTop: inCart ? `2px solid ${GREEN}55` : "1px solid #f3f4f6",
                        transition: "border 0.35s ease",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                          {item.category}
                        </span>
                        {inCart && (
                          <span
                            className="text-xs font-bold uppercase tracking-wide"
                            style={{ color: GREEN }}
                          >
                            ✓ {qty} in cart
                          </span>
                        )}
                      </div>

                      {/* THE ADD TO CART BUTTON */}
                      <button
                        id={`add-to-cart-${item.id}`}
                        onClick={() => handleAddToCart(item)}
                        aria-label={
                          inCart
                            ? `Add another ${item.name} to cart (${qty} already in cart)`
                            : `Add ${item.name} to cart`
                        }
                        style={getBtnStyle(inCart, justAdded)}
                        onMouseEnter={(e) => {
                          if (!inCart) {
                            Object.assign((e.currentTarget as HTMLButtonElement).style, {
                              background: CAFE_PRIMARY,
                              color: "white",
                              transform: "scale(1.04)",
                              border: `1.5px solid ${CAFE_PRIMARY}`,
                            });
                          } else {
                            Object.assign((e.currentTarget as HTMLButtonElement).style, {
                              filter: "brightness(1.1)",
                              transform: "scale(1.03)",
                            });
                          }
                        }}
                        onMouseLeave={(e) => {
                          Object.assign(
                            (e.currentTarget as HTMLButtonElement).style,
                            getBtnStyle(inCart, justAdded)
                          );
                        }}
                      >
                        {inCart ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {justAdded ? "Added!" : "Add More"}
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Toast Notification */}
      <CartToast toast={currentToast} onDismiss={handleDismissToast} />
    </>
  );
}
