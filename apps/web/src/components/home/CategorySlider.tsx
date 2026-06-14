"use client";

import { useRef, useEffect } from "react";
import { animate, stagger } from "animejs";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";

import { AUCTION_CATEGORIES } from "../../constants/categories";

// Data dummy item per kategori (menggunakan 3 kategori pertama dari daftar utama)
const FEATURED_CATEGORIES = [
  {
    id: "cat-1",
    name: AUCTION_CATEGORIES[0], // Barang Antik
    items: Array.from({ length: 24 }).map((_, i) => {
      const endsIn = ((i * 7) % 48) + 1; // 1-48 jam
      return {
        id: `prop-${i}`,
        name: `Koleksi Antik #${i + 1}`,
        price: 100000 + i * 10000,
        currentBid: 125000 + i * 9000,
        endTime: `${endsIn}j 30m`,
        img: `https://loremflickr.com/300/200/antique,relic?lock=${i + 10}`
      };
    })
  },
  {
    id: "cat-2",
    name: AUCTION_CATEGORIES[3], // Supercar & Hypercar
    items: Array.from({ length: 24 }).map((_, i) => {
      const endsIn = ((i * 13) % 24) + 1;
      return {
        id: `car-${i}`,
        name: `Hypercar Edisi Terbatas #${i + 1}`,
        price: 1500000 + i * 50000,
        currentBid: 2100000 + i * 45000,
        endTime: `${endsIn}j 15m`,
        img: `https://loremflickr.com/300/200/supercar,car?lock=${i + 50}`
      };
    })
  },
  {
    id: "cat-3",
    name: AUCTION_CATEGORIES[7], // Gadget & Teknologi Terkini
    items: Array.from({ length: 24 }).map((_, i) => {
      const endsIn = ((i * 17) % 72) + 12;
      return {
        id: `gadget-${i}`,
        name: `Gadget Prototipe #${i + 1}`,
        price: 50000 + i * 1200,
        currentBid: 60000 + i * 1000,
        endTime: `${Math.floor(endsIn / 24)}h ${endsIn % 24}j`,
        img: `https://loremflickr.com/300/200/gadget,tech?lock=${i + 100}`
      };
    })
  },
  {
    id: "cat-4",
    name: AUCTION_CATEGORIES[8], // Sneaker Hype & Streetwear
    items: Array.from({ length: 24 }).map((_, i) => {
      const endsIn = ((i * 11) % 48) + 12;
      return {
        id: `sneak-${i}`,
        name: `Sneaker Grail #${i + 1}`,
        price: 25000 + i * 500,
        currentBid: 32000 + i * 400,
        endTime: `${Math.floor(endsIn / 24)}h ${endsIn % 24}j`,
        img: `https://loremflickr.com/300/200/sneakers,shoes?lock=${i + 150}`
      };
    })
  },
  {
    id: "cat-5",
    name: AUCTION_CATEGORIES[34], // Domain Internet Premium
    items: Array.from({ length: 15 }).map((_, i) => {
      const endsIn = ((i * 5) % 24) + 6;
      return {
        id: `domain-${i}`,
        name: `CryptoDomain${i + 1}.eth`,
        price: 500000 + i * 10000,
        currentBid: 550000 + i * 15000,
        endTime: `${endsIn}j 0m`,
        img: `https://loremflickr.com/300/200/technology,internet?lock=${i + 200}`
      };
    })
  },
  {
    id: "cat-6",
    name: AUCTION_CATEGORIES[4], // Properti Mewah
    items: Array.from({ length: 24 }).map((_, i) => {
      const endsIn = ((i * 19) % 120) + 24;
      return {
        id: `prop-${i}`,
        name: `Penthouse Manhattan #${i + 1}`,
        price: 5000000 + i * 100000,
        currentBid: 5200000 + i * 50000,
        endTime: `${Math.floor(endsIn / 24)}h ${endsIn % 24}j`,
        img: `https://loremflickr.com/300/200/mansion,house?lock=${i + 250}`
      };
    })
  }
];

export default function CategorySlider({ categories = [] }: { categories?: { id: string; name: string; items: any[] }[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const blocks = section.querySelectorAll(".category-block");
    blocks.forEach((el) => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateY(30px)";
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(blocks, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            delay: stagger(200),
            ease: "outCubic"
          });
          observer.unobserve(section);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(section);
    return () => observer.disconnect();
  }, [categories]); // re-run animation jika data berubah

  return (
    <section ref={sectionRef} style={{ padding: "4rem 2rem", maxWidth: "1600px", margin: "0 auto" }}>
      <h2 style={{
        textAlign: "center",
        fontFamily: "var(--font-heading)",
        fontSize: "2rem",
        color: "var(--color-gold)",
        marginBottom: "3rem",
        letterSpacing: "0.1em"
      }}>
        Jelajahi Berdasarkan Kategori
      </h2>

      {categories.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>
          Tidak ada lelang yang tersedia di kategori mana pun saat ini.
        </div>
      ) : (
        categories.map((category) => (
        <div key={category.id} className="category-block" style={{ marginBottom: "5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.5rem",
              color: "var(--color-ivory)",
              borderLeft: "4px solid var(--color-emerald)",
              paddingLeft: "1rem"
            }}>
              {category.name}
            </h3>
            <a href={`/search?category=${encodeURIComponent(category.name)}`} style={{ color: "var(--color-emerald)", fontSize: "0.9rem", fontWeight: "bold", textDecoration: "none" }}>
              Lihat Semua &rarr;
            </a>
          </div>
          
          {/* Grid 3 Baris Horizontal Scroll untuk ITEM */}
          <div className="custom-horizontal-scroll" style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.ceil(category.items.length / 3)}, 200px)`,
            gridTemplateRows: "repeat(3, auto)",
            gridAutoFlow: "row", // Penuhi ke kanan dulu, lalu ke bawah
            gap: "0.75rem",
            overflowX: "auto",
            paddingBottom: "1.5rem"
          }}>
            {category.items.map((item, i) => {
              return (
              <div key={item.id} onClick={() => router.push(`/auction/${item.id}`)} style={{
                width: "200px", // Card lebih ramping / rapat
                background: "rgba(10,12,14,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "var(--color-emerald)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(16, 185, 129, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.boxShadow = "none";
              }}>
                {/* Gambar Item (Atas) - Dinamis menyesuaikan gambar aslinya */}
                <div style={{ width: "100%", position: "relative", backgroundColor: "#111", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.img} alt={item.name} style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }} />
                  {/* Badge Waktu Tersisa */}
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    background: "rgba(0,0,0,0.7)",
                    color: "var(--color-ivory)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                      <Clock size={12} /> {item.endTime}
                    </span>
                  </div>
                </div>

                {/* Info Item (Bawah) - Padding lebih rapat */}
                <div style={{ padding: "0.75rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h4 style={{ 
                    fontSize: "0.9rem", 
                    fontWeight: 600, 
                    color: "var(--color-ivory)", 
                    marginBottom: "0.5rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.3
                  }}>
                    {item.name}
                  </h4>
                  
                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Harga Buka</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-ivory)" }}>
                        {item.price.toLocaleString("id-ID")} CC
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-emerald)", fontWeight: 600 }}>Bid Skrg</span>
                      <span style={{ fontSize: "0.95rem", color: "var(--color-gold)", fontWeight: 700, fontFamily: "var(--font-numeric)" }}>
                        {item.currentBid.toLocaleString("id-ID")} CC
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
        ))
      )}
    </section>
  );
}
