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
  { id: 1,  name: "Kumbakonam Degree Coffee",   category: "Coffee",  price: "₹150", description: "Rich and pure degree coffee famous from Kumbakonam, made with pure cow's milk.",                                                       image: "/menu/1.jpg",  popular: true },
  { id: 2,  name: "Malabar Peaberry",           category: "Coffee",  price: "₹200", description: "Ovoid-shaped peaberry beans that roast evenly, producing a cup with intense hazelnut profiles.",                                       image: "/menu/2.jpg"               },
  { id: 7,  name: "Kodaikanal Arabica",         category: "Coffee",  price: "₹180", description: "Grown in the high hills of Kodaikanal, exhibiting floral tones and a sweet, syrupy body.",                                             image: "/menu/7.jpg",  popular: true },
  { id: 8,  name: "Nilgiri Blue Mountain",      category: "Coffee",  price: "₹160", description: "Mild, fragrant, and slightly nutty Arabica cultivated in the Blue Mountains of South India.",                                          image: "/menu/8.jpg"               },
  { id: 9,  name: "Bababudangiri Arabica",      category: "Coffee",  price: "₹150", description: "A legendary coffee variety tracing back to the first coffee seeds planted in India.",                                                   image: "/menu/9.jpg"               },
  { id: 10, name: "Robusta Kaapi",              category: "Coffee",  price: "₹120", description: "A strong, powerful blend crafted entirely from premium South Indian Robusta beans.",                                                    image: "/menu/10.jpg"              },
  { id: 11, name: "Karupatti Kaapi",            category: "Coffee",  price: "₹150", description: "Traditional jaggery (Karupatti) coffee known for its rich molasses sweetness and digestive properties.",                               image: "/menu/11.jpg", popular: true },
  { id: 12, name: "Sukku Malli Coffee",         category: "Coffee",  price: "₹140", description: "A therapeutic, caffeine-free herbal drink made from dry ginger (Sukku) and coriander seeds.",                                         image: "/menu/12.jpg"              },
  { id: 13, name: "Panankalkandu Kaapi",        category: "Coffee",  price: "₹150", description: "Authentic coffee sweetened distinctly by unrefined Palm Sugar Crystals.",                                                               image: "/menu/13.jpg", popular: true },
  { id: 14, name: "Madras Filter Coffee",       category: "Coffee",  price: "₹130", description: "The iconic daily cup of Chennai, frothy, milky, and perfectly balanced.",                                                               image: "/menu/14.jpg"              },
  { id: 15, name: "South Indian Filter Coffee", category: "Coffee",  price: "₹140", description: "Traditional strong decoction coffee brewed in a brass filter, mixed with completely frothed milk.",                                    image: "/menu/15.jpg", popular: true },
  { id: 16, name: "Mysore Nuggets Extra Bold",  category: "Coffee",  price: "₹200", description: "Premium washed Arabica from Karnataka, offering subtle notes of spice and dark chocolate.",                                             image: "/menu/16.jpg"              },
  { id: 17, name: "Monsooned Malabar",          category: "Coffee",  price: "₹180", description: "Beans exposed to monsoon winds, resulting in low acidity and a heavy, earthy body.",                                                    image: "/menu/17.jpg", popular: true },
  { id: 18, name: "Araku Valley Coffee",        category: "Coffee",  price: "₹220", description: "Organic tribal-farmed Arabica from Andhra Pradesh with fruity and caramel undertones.",                                                image: "/menu/18.jpg"              },
  { id: 19, name: "Coorg Arabica",              category: "Coffee",  price: "₹160", description: "Sourced from the hills of Coorg. Known for its mild body, slight acidity and citrus hints.",                                           image: "/menu/19.jpg"              },
  { id: 20, name: "Chikmagalur Coffee",         category: "Coffee",  price: "₹150", description: "From the birthplace of coffee in India. Well-rounded cup showcasing sweet vanilla aromas.",                                             image: "/menu/20.jpg"              },
  { id: 21, name: "Wayanad Robusta",            category: "Coffee",  price: "₹140", description: "Strong, punchy Robusta from Kerala with practically no acidity and a heavy, bold bite.",                                                image: "/menu/21.jpg"              },
  { id: 22, name: "Indian Espresso",            category: "Coffee",  price: "₹120", description: "A robust, thick espresso shot pulled specifically from an intense local dark roast.",                                                    image: "/menu/22.jpg"              },
  { id: 23, name: "Filter Kaapi Frappe",        category: "Coffee",  price: "₹200", description: "A modern twist. Cold blended South Indian filter decoction topped with cream.",                                                         image: "/menu/23.jpg"              },
  { id: 24, name: "Cardamom Spiced Coffee",     category: "Coffee",  price: "₹160", description: "Rich Indian coffee boiled slowly with freshly ground green cardamom pods.",                                                             image: "/menu/24.jpg", popular: true },
  // TEA
  { id: 3,  name: "Matcha Green Tea",           category: "Tea",     price: "₹160", description: "Finely ground powder of specially grown and processed green tea leaves.",                                                               image: "/menu/3.jpg",  popular: true },
  { id: 4,  name: "Earl Grey",                  category: "Tea",     price: "₹130", description: "Black tea blend flavored with oil of bergamot.",                                                                                        image: "/menu/4.jpg"               },
  { id: 25, name: "Masala Chai",                category: "Tea",     price: "₹150", description: "Traditional Indian spiced tea boiled with milk, ginger, cardamom and aromatic spices.",                                                image: "/menu/25.jpg", popular: true },
  { id: 26, name: "Darjeeling First Flush",     category: "Tea",     price: "₹250", description: "The 'Champagne of Teas', lightly floral with a delicate golden hue from the Himalayas.",                                               image: "/menu/26.jpg"              },
  { id: 27, name: "Assam Strong CTC",           category: "Tea",     price: "₹120", description: "Bold, malty black tea known for its strength, traditionally served with a dash of milk.",                                               image: "/menu/27.jpg"              },
  { id: 28, name: "Lemon Iced Tea",             category: "Tea",     price: "₹180", description: "Chilled black tea infused with freshly squeezed lemon juice and mint.",                                                                image: "/menu/28.jpg", popular: true },
  { id: 29, name: "Chamomile Flower Tea",       category: "Tea",     price: "₹190", description: "Caffeine-free herbal infusion known for its calming and soothing properties.",                                                          image: "/menu/29.jpg"              },
  { id: 30, name: "Kashmiri Kahwa",             category: "Tea",     price: "₹220", description: "Exotic green tea steeped with saffron strands, whole spices, and sliced almonds.",                                                      image: "/menu/30.jpg", popular: true },
  { id: 31, name: "Mint Green Tea",             category: "Tea",     price: "₹150", description: "Refreshing whole leaf green tea mixed with crisp spearmint leaves.",                                                                    image: "/menu/31.jpg"              },
  { id: 32, name: "Hibiscus Berry Tea",         category: "Tea",     price: "₹200", description: "Vibrant ruby-red tart tea filled with antioxidants and natural berry flavors.",                                                         image: "/menu/32.jpg"              },
  // DESSERT
  { id: 5,  name: "Chocolate Lava Cake",        category: "Dessert", price: "₹280", description: "Warm chocolate cake with a gooey, molten chocolate center.",                                                                           image: "/menu/lava-cake.jpg",      popular: true },
  { id: 6,  name: "Butter Croissant",           category: "Dessert", price: "₹140", description: "Flaky, buttery, and baked fresh every morning.",                                                                                        image: "/menu/croissant.jpg"       },
  { id: 42, name: "Tiramisu",                   category: "Dessert", price: "₹320", description: "Classic Italian dessert with espresso-soaked ladyfingers layered in rich mascarpone cream, dusted with dark cocoa.",                   image: "/menu/tiramisu.jpg",       popular: true },
  { id: 43, name: "Creme Brulee",               category: "Dessert", price: "₹290", description: "Silky vanilla custard topped with a perfectly caramelized amber sugar crust, cracked tableside.",                                      image: "/menu/creme-brulee.jpg",   popular: true },
  { id: 44, name: "New York Cheesecake",        category: "Dessert", price: "₹350", description: "Dense, ultra-creamy New York style cheesecake on a buttery graham cracker base, topped with fresh strawberry compote.",               image: "/menu/new-york-cheesecake.jpg" },
  { id: 45, name: "Belgian Waffle",             category: "Dessert", price: "₹260", description: "Crispy golden Belgian waffle topped with whipped cream, fresh berries, and a drizzle of maple syrup.",                                image: "/menu/belgian-waffle.jpg"  },
  { id: 46, name: "Mango Panna Cotta",          category: "Dessert", price: "₹240", description: "Delicate Italian set cream dessert topped with vibrant mango coulis, fresh mango cubes, and edible flower petals.",                   image: "/menu/mango-panna-cotta.jpg",  popular: true },
  { id: 47, name: "Gulab Jamun",                category: "Dessert", price: "₹180", description: "Soft, melt-in-your-mouth Indian milk dumplings soaked in warm saffron-rose sugar syrup, garnished with pistachios.",                  image: "/menu/gulab-jamun.jpg"     },
  // SNACKS
  { id: 33, name: "Veg Sandwich",               category: "Snacks",  price: "₹120", description: "Freshly prepared mixed vegetable sandwich.",                                                                                            image: "/menu/33.jpg", popular: true },
  { id: 34, name: "Grilled Cheese Sandwich",    category: "Snacks",  price: "₹150", description: "Crispy grilled sandwich loaded with melted cheese.",                                                                                   image: "/menu/34.jpg"              },
  { id: 35, name: "Paneer Tikka Sandwich",      category: "Snacks",  price: "₹180", description: "Spicy paneer tikka filling grilled to perfection.",                                                                                    image: "/menu/35.jpg", popular: true },
  { id: 36, name: "Veg Burger",                 category: "Snacks",  price: "₹130", description: "Classic veg patty burger with fresh lettuce and mayo.",                                                                                image: "/menu/36.jpg"              },
  { id: 37, name: "Paneer Burger",              category: "Snacks",  price: "₹160", description: "Crispy paneer patty burger with spicy sauce.",                                                                                         image: "/menu/37.jpg", popular: true },
  { id: 38, name: "French Fries",               category: "Snacks",  price: "₹100", description: "Classic salted crispy french fries.",                                                                                                   image: "/menu/38.jpg"              },
  { id: 39, name: "Peri Peri Fries",            category: "Snacks",  price: "₹120", description: "Crispy fries tossed in spicy peri peri mix.",                                                                                          image: "/menu/39.jpg", popular: true },
  { id: 40, name: "Garlic Bread",               category: "Snacks",  price: "₹110", description: "Freshly baked bread infused with herb garlic butter.",                                                                                 image: "/menu/40.jpg"              },
  { id: 41, name: "Cheese Garlic Bread",        category: "Snacks",  price: "₹140", description: "Garlic bread topped with a generous layer of melted mozzarella cheese.",                                                               image: "/menu/41.jpg", popular: true },
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
