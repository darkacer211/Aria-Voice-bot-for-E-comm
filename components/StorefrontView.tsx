"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Search,
  Store,
  Heart,
  ShoppingBag,
  Sparkles,
  Star,
  Check,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  discount: string;
  badge: string;
  rating: number;
  reviews: number;
  image: string;
}

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Glide Peptide Serum Lipstick",
    subtitle: "12 Dewy Pigment Shades",
    price: 412,
    originalPrice: 549,
    discount: "25% off",
    badge: "SAVE 25%",
    rating: 4.8,
    reviews: 792,
    image: "/images/product-glide-lipstick.jpg",
  },
  {
    id: "p2",
    name: "Glide Peptide Plumping Gloss",
    subtitle: "Infused with Squalane",
    price: 594,
    originalPrice: 699,
    discount: "15% off",
    badge: "NEW LAUNCH",
    rating: 4.9,
    reviews: 701,
    image: "/images/product-gloss-stick.jpg",
  },
  {
    id: "p3",
    name: "Bling Leader Illuminating Strobe",
    subtitle: "3 Iridescent Pearlescent Shades",
    price: 499,
    originalPrice: 499,
    discount: "Radiance Elixir",
    badge: "VIRAL",
    rating: 4.7,
    reviews: 310,
    image: "/images/product-strobe.jpg",
  },
  {
    id: "p4",
    name: "Partner In Shine Lip Gloss",
    subtitle: "Non-Sticky Transferproof Glass",
    price: 454,
    originalPrice: 699,
    discount: "35% off",
    badge: "ON SALE",
    rating: 4.8,
    reviews: 641,
    image: "/images/product-shine-gloss.jpg",
  },
];

interface Props {
  onNavigateToAria: (prompt?: string) => void;
  isCallActive?: boolean;
}

export const StorefrontView: React.FC<Props> = ({
  onNavigateToAria,
  isCallActive = false,
}) => {
  const [cartCount, setCartCount] = useState(2);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddToCart = (productName: string, price: number) => {
    setCartCount((prev) => prev + 1);
    showToast(`Added ${productName} (₹${price}) to your bag`);
  };

  return (
    <div className="w-full relative min-h-screen bg-[#fcf9f4] text-[#4a2d30] selection:bg-[#d89a9e]/20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#4a2d30] text-[#ffffff] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#d89a9e]/40 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-6 h-6 rounded-full bg-[#d89a9e]/30 flex items-center justify-center text-[#d89a9e]">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#fcf9f4]/95 backdrop-blur-md border-b border-[#ebdcd3]/70">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="cursor-pointer text-left focus:outline-none"
            >
              <span className="font-serif-luxury text-2xl md:text-3xl tracking-widest text-[#4a2d30] font-normal uppercase">
                Aria
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-10 relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Try 'Glide Peptide Lipstick' or 'Dewy Foundation'..."
                className="w-full bg-[#f6f3ee] text-sm text-[#4a2d30] placeholder-[#9a8c80] pl-10 pr-24 py-2.5 rounded-full border border-[#e4ded6] focus:outline-none focus:border-[#d89a9e] transition shadow-inner"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9a8c80]">
                <Search className="w-4 h-4" />
              </div>
              <button
                onClick={() => {
                  if (searchQuery.trim()) {
                    showToast(`Searching Aria catalog for "${searchQuery}"...`);
                  }
                }}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#4a2d30] text-[#ffffff] text-xs font-medium rounded-full hover:bg-[#3d2427] transition cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>

          {/* Utility Nav Items */}
          <div className="flex items-center gap-6 text-sm text-[#4a2d30]">
            <button
              onClick={() => showToast("Viewing 24 Luxury Aria Boutiques across India")}
              className="hidden md:flex items-center gap-1.5 hover:text-[#d89a9e] transition cursor-pointer text-xs"
            >
              <Store className="w-4 h-4 text-[#796e65]" />
              <span>Boutiques</span>
            </button>
            <button
              onClick={() => showToast("Wishlist has 4 saved botanical formulations")}
              className="hidden sm:flex items-center gap-1.5 hover:text-[#d89a9e] transition cursor-pointer text-xs"
            >
              <Heart className="w-4 h-4 text-[#796e65]" />
              <span>Wishlist</span>
            </button>

            {/* Voice Concierge Header Link */}
            <button
              onClick={() => onNavigateToAria()}
              className="hidden sm:flex items-center gap-2 bg-[#f4ebe6] hover:bg-[#ebdcd3] text-[#4a2d30] px-3.5 py-1.5 rounded-full border border-[#d89a9e]/40 transition text-xs font-medium shadow-sm group cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Aria AI Voice</span>
              <span className="text-[10px] bg-[#d89a9e]/30 px-1.5 py-0.5 rounded text-[#4a2d30] font-semibold">
                Gemini
              </span>
            </button>

            {/* Shopping Cart */}
            <div
              onClick={() => showToast(`Shopping Bag: ${cartCount} items selected`)}
              className="flex items-center gap-1.5 hover:text-[#d89a9e] transition cursor-pointer relative"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 text-[#4a2d30]" />
              <span className="w-4 h-4 bg-[#4a2d30] text-[#ffffff] rounded-full text-[10px] flex items-center justify-center font-bold absolute -top-1.5 -right-2">
                {cartCount}
              </span>
            </div>
          </div>
        </div>

        {/* Categories Sub-nav */}
        <div className="border-t border-[#f0e4dc] bg-[#fcf9f4]/70">
          <div className="max-w-7xl mx-auto px-6 overflow-x-auto scrollbar-none py-2.5 flex items-center justify-between text-xs tracking-wider uppercase text-[#695d54] gap-6 whitespace-nowrap">
            <button onClick={() => showToast("Viewing Lips Collection")} className="hover:text-[#4a2d30] hover:font-medium transition cursor-pointer">
              Lips
            </button>
            <button onClick={() => showToast("Viewing Eyes & Kajal Collection")} className="hover:text-[#4a2d30] hover:font-medium transition cursor-pointer">
              Eyes
            </button>
            <button onClick={() => showToast("Viewing Face & Base Collection")} className="hover:text-[#4a2d30] hover:font-medium transition cursor-pointer">
              Face &amp; Base
            </button>
            <button onClick={() => showToast("Viewing Luxe Lacquers")} className="hover:text-[#4a2d30] hover:font-medium transition cursor-pointer">
              Nails
            </button>
            <button onClick={() => showToast("Viewing Botanical Skincare Edits")} className="hover:text-[#4a2d30] hover:font-medium transition cursor-pointer">
              Botanical Skin
            </button>
            <button onClick={() => showToast("Viewing Elite Festive Gifting Boxes")} className="hover:text-[#4a2d30] hover:font-medium transition cursor-pointer">
              Elite Gifting
            </button>
            <button onClick={() => showToast("Viewing Curated Treats Under ₹249")} className="text-[#b26a6e] font-semibold hover:text-[#4a2d30] transition cursor-pointer">
              Under 249 Luxe
            </button>
            <button onClick={() => showToast("Special Festive Code Applied: BOTANICAL")} className="text-[#b85b4b] font-semibold hover:text-[#4a2d30] transition cursor-pointer">
              Festive Offers
            </button>
          </div>
        </div>
      </header>

      {/* Hero Promotional Banner */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative rounded-3xl overflow-hidden border border-[#ebdcd3] shadow-sm bg-gradient-to-r from-[#f7efe9] via-[#f9f3ed] to-[#f4ebe6] min-h-[360px] md:min-h-[440px] flex items-center">
          {/* Background Banner Image */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/images/festive-banner.jpg"
              alt="Aria Festive Collection"
              fill
              className="object-cover object-right md:object-center"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#fcf9f4] via-[#fcf9f4]/75 to-transparent" />

          {/* Content Overlay */}
          <div className="relative z-10 p-8 md:p-14 max-w-xl">
            <div className="inline-block px-3 py-1 bg-[#ffffff]/80 backdrop-blur-sm border border-[#d89a9e]/40 rounded-full text-xs font-semibold uppercase tracking-wider text-[#9a4b52] mb-4">
              Limited Festive Edition
            </div>
            <h1 className="font-serif-luxury text-3xl md:text-5xl font-light text-[#3c2225] leading-tight mb-4">
              Shop For ₹2,999 &amp; get{" "}
              <span className="font-normal italic text-[#9a4b52]">₹700 OFF</span>
            </h1>
            <p className="text-sm md:text-base text-[#6f635a] mb-8 leading-relaxed font-light">
              Festive Glam Collection: Instant Radiance, high-payoff smudge-resistant botanical
              pigments, and all-night velvety wear.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  const elem = document.getElementById("new-launches-section");
                  elem?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-7 py-3 rounded-full bg-[#4a2d30] text-[#ffffff] text-xs font-medium tracking-wide uppercase hover:bg-[#382124] transition shadow-md cursor-pointer"
              >
                Shop Offers
              </button>
              <button
                onClick={() => onNavigateToAria()}
                className="px-6 py-3 rounded-full bg-[#ffffff]/90 hover:bg-[#ffffff] text-[#4a2d30] border border-[#d89a9e]/60 text-xs font-medium tracking-wide flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#d89a9e] animate-ping" />
                Consult Voice Concierge
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Highlights Pills */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif-luxury text-2xl font-light text-[#4a2d30]">
            Shop by Category
          </h2>
          <span className="text-xs text-[#8c7f76] italic">
            Swipe to explore botanical beauty edits
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4 text-center">
          {/* Lips */}
          <div
            onClick={() => onNavigateToAria("Which lip shades suit warm undertones?")}
            className="p-4 rounded-2xl bg-[#ffffff] border border-[#ebdcd3] hover:border-[#d89a9e] hover:shadow-sm transition cursor-pointer group"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#faecea] flex items-center justify-center text-[#9a4b52] group-hover:scale-110 transition">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <span className="block mt-2 text-xs font-medium text-[#4a2d30]">Lips</span>
            <span className="text-[10px] text-[#93857b]">Matte &amp; Velvet</span>
          </div>

          {/* Eyes */}
          <div
            onClick={() => showToast("Category: Kohl, Eyeliners & Brow Definers")}
            className="p-4 rounded-2xl bg-[#ffffff] border border-[#ebdcd3] hover:border-[#d89a9e] hover:shadow-sm transition cursor-pointer group"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#f4ebe6] flex items-center justify-center text-[#7e5c54] group-hover:scale-110 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="block mt-2 text-xs font-medium text-[#4a2d30]">Eyes</span>
            <span className="text-[10px] text-[#93857b]">Kajal &amp; Liners</span>
          </div>

          {/* Face */}
          <div
            onClick={() => onNavigateToAria("Help me find my shade in Ace of Face Foundation")}
            className="p-4 rounded-2xl bg-[#ffffff] border border-[#ebdcd3] hover:border-[#d89a9e] hover:shadow-sm transition cursor-pointer group"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#faecea] flex items-center justify-center text-[#9a4b52] group-hover:scale-110 transition">
              <Star className="w-5 h-5" />
            </div>
            <span className="block mt-2 text-xs font-medium text-[#4a2d30]">Face</span>
            <span className="text-[10px] text-[#93857b]">Sticks &amp; Dewy</span>
          </div>

          {/* Nails */}
          <div
            onClick={() => showToast("Category: Breathable Botanical Lacquers")}
            className="p-4 rounded-2xl bg-[#ffffff] border border-[#ebdcd3] hover:border-[#d89a9e] hover:shadow-sm transition cursor-pointer group"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#f4ebe6] flex items-center justify-center text-[#7e5c54] group-hover:scale-110 transition">
              <Store className="w-5 h-5" />
            </div>
            <span className="block mt-2 text-xs font-medium text-[#4a2d30]">Nails</span>
            <span className="text-[10px] text-[#93857b]">Luxe Lacquers</span>
          </div>

          {/* Kits */}
          <div
            onClick={() => showToast("Category: Curated Luxury Gift Sets")}
            className="p-4 rounded-2xl bg-[#ffffff] border border-[#ebdcd3] hover:border-[#d89a9e] hover:shadow-sm transition cursor-pointer group"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#faecea] flex items-center justify-center text-[#9a4b52] group-hover:scale-110 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="block mt-2 text-xs font-medium text-[#4a2d30]">Kits</span>
            <span className="text-[10px] text-[#93857b]">Curated Bundles</span>
          </div>

          {/* Skin */}
          <div
            onClick={() => onNavigateToAria("Recommend a morning barrier repair routine")}
            className="p-4 rounded-2xl bg-[#ffffff] border border-[#ebdcd3] hover:border-[#d89a9e] hover:shadow-sm transition cursor-pointer group"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#e8f2ec] flex items-center justify-center text-[#4b7a63] group-hover:scale-110 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="block mt-2 text-xs font-medium text-[#4a2d30]">Skin</span>
            <span className="text-[10px] text-[#93857b]">Mists &amp; Elixirs</span>
          </div>

          {/* 249 Store */}
          <div
            onClick={() => showToast("Opening The ₹249 Luxe Edit")}
            className="p-4 rounded-2xl bg-[#ffffff] border border-[#ebdcd3] hover:border-[#d89a9e] hover:shadow-sm transition cursor-pointer group"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#fbf0df] flex items-center justify-center text-[#aa7932] group-hover:scale-110 transition font-bold text-xs">
              ₹249
            </div>
            <span className="block mt-2 text-xs font-medium text-[#4a2d30]">249 Store</span>
            <span className="text-[10px] text-[#93857b]">Treats Under ₹249</span>
          </div>

          {/* Clean Botanical */}
          <div
            onClick={() => onNavigateToAria("Tell me about your clean botanical ingredients policy")}
            className="p-4 rounded-2xl bg-[#ffffff] border border-[#ebdcd3] hover:border-[#d89a9e] hover:shadow-sm transition cursor-pointer group"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#f1f7ed] flex items-center justify-center text-[#55865d] group-hover:scale-110 transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="block mt-2 text-xs font-medium text-[#4a2d30]">Clean</span>
            <span className="text-[10px] text-[#93857b]">Botanical Care</span>
          </div>
        </div>
      </section>

      {/* New Launches Section */}
      <section id="new-launches-section" className="max-w-7xl mx-auto px-6 py-8 border-t border-[#ebdcd3]/60">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#9a4b52] font-semibold">
              Fresh from the Botanical Lab
            </span>
            <h2 className="font-serif-luxury text-2xl md:text-3xl font-light text-[#4a2d30]">
              New Launches
            </h2>
          </div>
          <button
            onClick={() => showToast("Showing all 38 Botanical New Launches")}
            className="text-xs tracking-wider uppercase font-semibold text-[#4a2d30] hover:text-[#9a4b52] flex items-center gap-1 transition cursor-pointer"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="bg-[#ffffff] rounded-2xl border border-[#ebdcd3] p-4 flex flex-col justify-between hover:shadow-md transition group"
            >
              <div className="relative overflow-hidden rounded-xl bg-[#f7f2ed] mb-4 aspect-square flex items-center justify-center">
                <Image
                  src={prod.image}
                  alt={prod.name}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-[#ffffff]/90 text-[#9a4b52] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#d89a9e]/40 shadow-xs">
                  {prod.badge}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1 text-[11px] text-[#8c7f76] mb-1">
                  <span className="text-amber-500 font-medium">★ {prod.rating}</span>
                  <span>({prod.reviews} reviews)</span>
                </div>
                <h3 className="font-medium text-sm text-[#4a2d30] line-clamp-1">{prod.name}</h3>
                <p className="text-xs text-[#8c7f76] mb-3">{prod.subtitle}</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-base font-semibold text-[#4a2d30]">₹{prod.price}.00</span>
                  {prod.originalPrice > prod.price && (
                    <span className="text-xs text-[#9d9187] line-through">
                      ₹{prod.originalPrice}.00
                    </span>
                  )}
                  <span className="text-xs text-[#2e7d32] font-medium">{prod.discount}</span>
                </div>
              </div>
              <button
                onClick={() => handleAddToCart(prod.name, prod.price)}
                className="w-full py-2.5 rounded-full bg-[#4a2d30] text-[#ffffff] text-xs font-medium tracking-wide hover:bg-[#382124] transition cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Formula Spotlight Feature */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-[#ffffff] rounded-3xl border border-[#ebdcd3] p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative rounded-2xl overflow-hidden bg-[#f7efe9] aspect-square flex items-center justify-center p-6">
            <Image
              src="/images/product-glide-lipstick.jpg"
              alt="Aria Peptide Formula"
              fill
              className="object-contain p-6"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-[#ffffff]/90 backdrop-blur-sm rounded-xl py-2 px-3 text-center border border-[#d89a9e]/40 text-xs font-medium text-[#4a2d30]">
              Infused with High-Performance Botanical Actives
            </div>
          </div>
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#9a4b52] font-semibold">
              The Iconic Botanical Formula
            </span>
            <h2 className="font-serif-luxury text-3xl md:text-4xl font-light text-[#4a2d30] leading-tight">
              Glide Peptide Serum Lipstick
            </h2>
            <p className="text-sm text-[#6c5f56] leading-relaxed">
              Own the moment effortlessly. Meet the serum-infused matte that gives you rich,
              saturated colour with feather-light comfort. A skin-loving blend of{" "}
              <strong className="text-[#4a2d30]">
                Peptides, Hyaluronic Acid, Squalane, Bakuchiol and Jojoba Oil
              </strong>{" "}
              cocoons your lips in 8+ hours of continuous hydration and care.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#ebdcd3]">
              <div>
                <span className="font-serif-luxury text-2xl font-light text-[#4a2d30]">8+ Hrs</span>
                <span className="block text-[11px] text-[#8c7f76] uppercase tracking-wider">
                  Wear Time
                </span>
              </div>
              <div>
                <span className="font-serif-luxury text-2xl font-light text-[#4a2d30]">5 Bio</span>
                <span className="block text-[11px] text-[#8c7f76] uppercase tracking-wider">
                  Actives Blend
                </span>
              </div>
              <div>
                <span className="font-serif-luxury text-2xl font-light text-[#4a2d30]">100%</span>
                <span className="block text-[11px] text-[#8c7f76] uppercase tracking-wider">
                  Cloud Matte
                </span>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => handleAddToCart("Glide Peptide Serum Lipstick", 412)}
                className="px-6 py-3 rounded-full bg-[#4a2d30] text-[#ffffff] text-xs font-medium tracking-wide uppercase hover:bg-[#382124] transition cursor-pointer"
              >
                Discover the Shades
              </button>
              <button
                onClick={() =>
                  onNavigateToAria(
                    "Can you help me choose the right shade in the Glide Peptide Serum Lipstick?"
                  )
                }
                className="px-5 py-3 rounded-full border border-[#d89a9e] text-[#4a2d30] hover:bg-[#f6eee9] text-xs font-medium tracking-wide transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#9a4b52]" />
                Ask Aria for Shade Match
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 bg-[#f7f2ed] border-t border-[#ebdcd3] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#796e65]">
          <div className="flex items-center gap-3">
            <span className="font-serif-luxury text-lg text-[#4a2d30] uppercase tracking-widest">
              Aria
            </span>
            <span>© 2026 Aria. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => showToast("Privacy Policy: Your skin data is 100% encrypted.")}
              className="hover:text-[#4a2d30] cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => showToast("Terms of Service: Aria Botanical Luxury Standards")}
              className="hover:text-[#4a2d30] cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => showToast("Find our Flagship Experience Boutiques in Mumbai & Bengaluru")}
              className="hover:text-[#4a2d30] cursor-pointer"
            >
              Store Locator
            </button>
            <button
              onClick={() => onNavigateToAria()}
              className="text-[#9a4b52] hover:underline font-medium cursor-pointer"
            >
              Launch Aria Voice CX
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Viewport-Pinned Aria Bot Widget */}
      <aside
        id="aria-floating-widget"
        className="fixed bottom-7 right-7 z-50 pointer-events-auto"
      >
        <div
          onClick={() => onNavigateToAria()}
          className="relative group cursor-pointer flex items-center gap-2.5"
        >
          {/* Ask Aria Pill */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffffff]/95 backdrop-blur-md border border-[#d89a9e]/60 shadow-md text-xs font-medium text-[#4a2d30] tracking-wide transition-all group-hover:scale-105 group-hover:border-[#d89a9e]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isCallActive ? "bg-emerald-500 animate-pulse" : "bg-[#d89a9e] animate-ping"
              }`}
            />
            <Sparkles className="w-3.5 h-3.5 text-[#9a4b52]" />
            <span className="font-medium">
              {isCallActive ? "Aria Active (Return)" : "Ask Aria"}
            </span>
          </div>

          {/* 3D Orb Avatar Button */}
          <button
            type="button"
            aria-label="Open Aria Voice CX Concierge"
            className="aria-orb-pulse relative w-16 h-16 rounded-full bg-[#fcf9f4] border-2 border-[#d89a9e] p-1 flex items-center justify-center hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(216,154,158,0.7)] transition-all duration-300 focus:outline-none cursor-pointer"
          >
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="/images/aria-avatar.jpg"
                alt="Aria AI Voice Assistant"
                fill
                className="object-cover rounded-full"
              />
            </div>
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#fcf9f4] rounded-full shadow-sm" />
          </button>
        </div>
      </aside>
    </div>
  );
};
