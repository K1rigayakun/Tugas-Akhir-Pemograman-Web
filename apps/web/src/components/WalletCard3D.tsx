"use client";

import { useRef, useEffect, useState } from "react";
import { animate } from "animejs";
import CrownCoinIcon from "./CrownCoinIcon";

interface WalletCard3DProps {
  balance: {
    availableBalance?: number;
    pendingHold?: number;
    totalBalance?: number;
  } | null;
  username?: string;
  rank?: string;
  hasSkin?: boolean;
}

export default function WalletCard3D({ balance, username, rank, hasSkin }: WalletCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Elegant entrance animation
    animate(card, {
      opacity: [0, 1],
      translateY: [30, 0],
      rotateX: [15, 0],
      duration: 1500,
      ease: "outExpo",
    });

    const shimmer = card.querySelector(".premium-shimmer") as HTMLElement;
    if (shimmer) {
      animate(shimmer, {
        translateX: ["-100%", "200%"],
        duration: 3500,
        ease: "inOutSine",
        loop: true,
        delay: 2500,
      });
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || isFlipped) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateY = (mouseX / (rect.width / 2)) * 12;
    const rotateX = -(mouseY / (rect.height / 2)) * 12;

    animate(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      scale: 1.03,
      duration: 400,
      ease: "outQuad",
    });

    if (glare) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.25) 0%, transparent 50%)`;
      glare.style.opacity = "1";
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card) return;

    animate(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 800,
      ease: "outElastic(1, .5)",
    });

    if (glare) {
      glare.style.opacity = "0";
    }
  };

  const handleClick = () => {
    const card = cardRef.current;
    if (!card) return;

    setIsFlipped(!isFlipped);
    animate(card, {
      rotateY: isFlipped ? 0 : 180,
      duration: 800,
      ease: "easeInOutCubic",
    });
  };

  // Ultra-premium dark gradients with subtle tinted glows
  const rankGradients: Record<string, string> = {
    EMPEROR: "linear-gradient(135deg, #0d0a14 0%, #150f24 40%, #1d1336 60%, #0d0a14 100%)",
    DUKE: "linear-gradient(135deg, #080d14 0%, #0d1624 40%, #13243b 60%, #080d14 100%)",
    MARQUIS: "linear-gradient(135deg, #170d0d 0%, #261111 40%, #3d1616 60%, #170d0d 100%)",
    EARL: "linear-gradient(135deg, #0d170d 0%, #122412 40%, #1a381a 60%, #0d170d 100%)",
    BARON: "linear-gradient(135deg, #17130c 0%, #292012 40%, #45341a 60%, #17130c 100%)",
    KNIGHT: "linear-gradient(135deg, #121212 0%, #1f1f1f 40%, #2e2e2e 60%, #121212 100%)",
    CIVIS: "linear-gradient(135deg, #0c1712 0%, #11291e 40%, #16402d 60%, #0c1712 100%)",
  };

  const currentRank = rank || "CIVIS";
  const cardBg = rankGradients[currentRank] || rankGradients.CIVIS;
  const currentUsername = username || "GUEST ACCOUNT";

  return (
    <div style={{ perspective: "1500px", display: "flex", justifyContent: "center", margin: "3rem 0" }}>
      <div
        ref={cardRef}
        className={hasSkin ? "wallet-card" : ""}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          width: "460px",
          height: "290px",
          borderRadius: "20px",
          background: cardBg,
          boxShadow: `
            0 30px 60px -15px rgba(0,0,0,0.8),
            0 0 30px rgba(201,168,76,0.1),
            inset 0 1px 1px rgba(255,255,255,0.1)
          `,
          position: "relative",
          transformStyle: "preserve-3d",
          cursor: "pointer",
          opacity: 0,
          userSelect: "none",
        }}
      >
        {/* ============================================================== */}
        {/* CLIPPED EFFECTS CONTAINER (Prevents glossy spill) */}
        {/* ============================================================== */}
        <div style={{ 
          position: "absolute", 
          inset: 0, 
          borderRadius: "20px", 
          overflow: "hidden", 
          pointerEvents: "none", 
          zIndex: 5, 
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "translateZ(1px)"
        }}>
          {/* Base Noise Texture for Matte Metal Finish */}
          <div style={{ 
            position: "absolute", 
            inset: 0, 
            opacity: 0.15, 
            backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')"
          }} />
          
          {/* Subtle Diagonal Metal Sheen */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(201,168,76,0.05) 100%)",
          }} />

          {/* Interactive Mouse Glare */}
          <div ref={glareRef} style={{ position: "absolute", inset: 0, opacity: 0, transition: "opacity 0.2s" }} />
          
          {/* Sweeping Light Shimmer */}
          <div className="premium-shimmer" style={{ 
            position: "absolute", 
            inset: "-20%", 
            background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 55%, transparent 65%)", 
            transform: "translateX(-150%)"
          }} />
        </div>

        {/* ============================================================== */}
        {/* FRONT FACE CONTENT */}
        {/* ============================================================== */}
        <div style={{ 
          position: "absolute", 
          inset: 0, 
          padding: "2.5rem", 
          backfaceVisibility: "hidden", 
          WebkitBackfaceVisibility: "hidden",
          transform: "translateZ(2px)",
          zIndex: 10, 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "space-between" 
        }}>
          
          {/* TOP: Bank Name & Logo */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ 
              fontFamily: "var(--font-cinzel, serif)", 
              fontSize: "1.25rem", 
              fontWeight: 700, 
              color: "#f5f5f0",
              letterSpacing: "0.2em", 
              textShadow: "0 2px 4px rgba(0,0,0,0.8)" 
            }}>
              EMERALD KINGDOM
            </div>
            <div style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}>
              <CrownCoinIcon size={36} />
            </div>
          </div>

          {/* MIDDLE: Realistic EMV Chip + Contactless */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginTop: "-1rem" }}>
            {/* Hyper-realistic Chip */}
            <div style={{ 
              width: "48px", 
              height: "36px", 
              borderRadius: "5px", 
              background: "linear-gradient(135deg, #d4af37 0%, #ffdf70 40%, #c59b27 60%, #8a6a1c 100%)", 
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 3px rgba(0,0,0,0.6), 0 2px 5px rgba(0,0,0,0.5)",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Chip Engravings */}
              <div style={{ position: "absolute", inset: "10%", border: "1px solid rgba(0,0,0,0.2)", borderRadius: "3px" }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: "33%", height: "1px", background: "rgba(0,0,0,0.15)", boxShadow: "0 1px 0 rgba(255,255,255,0.2)" }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: "66%", height: "1px", background: "rgba(0,0,0,0.15)", boxShadow: "0 1px 0 rgba(255,255,255,0.2)" }} />
              <div style={{ position: "absolute", left: "33%", top: 0, bottom: 0, width: "1px", background: "rgba(0,0,0,0.15)", boxShadow: "1px 0 0 rgba(255,255,255,0.2)" }} />
              <div style={{ position: "absolute", right: "33%", top: 0, bottom: 0, width: "1px", background: "rgba(0,0,0,0.15)", boxShadow: "1px 0 0 rgba(255,255,255,0.2)" }} />
              {/* Center contact */}
              <div style={{ position: "absolute", inset: "35%", background: "rgba(0,0,0,0.05)", borderRadius: "2px" }} />
            </div>
            {/* Contactless */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}>
              <path d="M8.5 21.3c-2.4-1.8-3.9-4.8-3.9-8.3s1.5-6.5 3.9-8.3" />
              <path d="M12 18.8c-1.6-1.2-2.6-3.2-2.6-5.8s1-4.6 2.6-5.8" />
              <path d="M15.5 16.3c-.8-.6-1.3-1.6-1.3-2.8s.5-2.2 1.3-2.8" />
              <path d="M19 13.8c0-.8-.3-1.5-.7-2" />
            </svg>
          </div>

          {/* BALANCE DISPLAY (Embossed Premium Typography) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span style={{ 
              fontSize: "0.6rem", 
              color: "rgba(255,255,255,0.5)", 
              textTransform: "uppercase", 
              letterSpacing: "0.2em",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)"
            }}>
              AVAILABLE BALANCE
            </span>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
              <span style={{ 
                fontFamily: "var(--font-orbitron, monospace)", 
                fontSize: "2.2rem", 
                fontWeight: 600, 
                color: "#e2e8f0", 
                letterSpacing: "2px", 
                // Classic Embossed Silver Effect
                textShadow: "1px 1px 0px rgba(255,255,255,0.3), -1px -1px 0px rgba(0,0,0,0.8), 0 4px 10px rgba(0,0,0,0.5)"
              }}>
                {balance?.availableBalance?.toLocaleString("id-ID") || "0"}
              </span>
              <span style={{ 
                fontSize: "1rem", 
                color: "rgba(201,168,76,0.9)", 
                fontWeight: 600, 
                marginBottom: "0.4rem",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)"
              }}>CC</span>
            </div>
          </div>

          {/* FOOTER: Rank, Name & Valid Thru */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 500, letterSpacing: "0.2em", color: "#e2e8f0", textTransform: "uppercase", textShadow: "1px 1px 0px rgba(255,255,255,0.2), -1px -1px 0px rgba(0,0,0,0.8)" }}>
                {currentUsername}
              </div>
              <div style={{ display: "flex", gap: "2rem", marginTop: "0.5rem" }}>
                <div>
                  <div style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em" }}>MEMBER RANK</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(201,168,76,0.9)", letterSpacing: "0.15em", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>{currentRank}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em" }}>VALID THRU</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: "0.1em", fontFamily: "var(--font-orbitron, monospace)", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>12/99</div>
                </div>
              </div>
            </div>
            
            {/* Imperial Network text */}
            <div style={{ textAlign: "right", opacity: 0.8 }}>
              <div style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", marginBottom: "2px" }}>ISSUED BY</div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(201, 168, 76, 0.9)", letterSpacing: "0.1em", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>IMPERIAL<br/>NETWORK</div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BACK FACE (Minimalist Elegance) */}
        {/* ============================================================== */}
        <div style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg) translateZ(1px)",
          zIndex: 3,
          background: `linear-gradient(135deg, rgba(0,0,0,0.9), rgba(10,10,10,0.95)), ${cardBg}`,
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)",
          overflow: "hidden"
        }}>
          {/* Real Magnetic Strip */}
          <div style={{ 
            marginTop: "2.5rem", 
            height: "55px", 
            background: "linear-gradient(to bottom, #111 0%, #000 20%, #1a1a1a 50%, #000 80%, #111 100%)", 
            width: "100%", 
            boxShadow: "0 4px 10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)" 
          }} />

          {/* Back Content */}
          <div style={{ padding: "1.5rem 2.5rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" }}>
            
            <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
               {/* Hologram Sticker */}
              <div style={{
                width: "40px",
                height: "30px",
                borderRadius: "4px",
                background: "linear-gradient(135deg, #ff007f, #00f0ff, #ffea00, #00ff40)",
                boxShadow: "0 2px 5px rgba(0,0,0,0.5), inset 0 0 10px rgba(255,255,255,0.5)",
                opacity: 0.8,
                mixBlendMode: "screen",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                 <CrownCoinIcon size={16} />
              </div>
            </div>

            {/* Centered Minimalist Logo */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.6 }}>
              <div style={{ filter: "drop-shadow(0 0 10px rgba(201,168,76,0.3))" }}>
                <CrownCoinIcon size={60} />
              </div>
              <div style={{
                fontFamily: "var(--font-cinzel, serif)",
                fontSize: "1rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "0.4em",
                marginTop: "1rem"
              }}>
                EMERALD KINGDOM
              </div>
            </div>

            {/* Fine Print */}
            <div style={{
              fontSize: "0.55rem",
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.15em",
              textAlign: "center",
              lineHeight: "1.6",
              maxWidth: "90%"
            }}>
              THIS CARD REMAINS THE PROPERTY OF THE EMERALD KINGDOM FINANCIAL AUTHORITY. 
              UNAUTHORIZED USE IS STRICTLY PROHIBITED. IF FOUND, RETURN TO THE IMPERIAL BANK.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
