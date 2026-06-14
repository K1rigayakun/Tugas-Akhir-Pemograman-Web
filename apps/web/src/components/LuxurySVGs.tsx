export function ImperialEagle({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
      <defs>
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7d070" />
          <stop offset="50%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#8a6a1c" />
        </linearGradient>
      </defs>
      <path
        d="M50 10 L55 25 L85 15 L70 40 L90 60 L60 65 L50 90 L40 65 L10 60 L30 40 L15 15 L45 25 Z"
        fill="url(#gold-grad)"
        stroke="#4a3600"
        strokeWidth="1"
      />
      <circle cx="50" cy="45" r="8" fill="#111" stroke="#f7d070" strokeWidth="2" />
      <path d="M47 45 L53 45 M50 42 L50 48" stroke="#00ff88" strokeWidth="1.5" />
    </svg>
  );
}

export function ShieldEmblem({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 120" className={className} style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.6))" }}>
      <defs>
        <linearGradient id="shield-base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1a24" />
          <stop offset="50%" stopColor="#0d0d14" />
          <stop offset="100%" stopColor="#050508" />
        </linearGradient>
        <linearGradient id="shield-border" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5e1a4" />
          <stop offset="40%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#594311" />
        </linearGradient>
      </defs>
      {/* Outer Border */}
      <path d="M50 5 L90 20 L90 60 C90 90, 50 115, 50 115 C50 115, 10 90, 10 60 L10 20 Z" fill="url(#shield-border)" />
      {/* Inner Shield */}
      <path d="M50 12 L83 25 L83 60 C83 85, 50 106, 50 106 C50 106, 17 85, 17 60 L17 25 Z" fill="url(#shield-base)" />
      {/* Center Emerald */}
      <polygon points="50,40 65,55 50,85 35,55" fill="#10b981" stroke="#047857" strokeWidth="2" />
      <polygon points="50,40 65,55 50,55" fill="#34d399" opacity="0.6" />
      <polygon points="50,40 50,85 35,55" fill="#064e3b" opacity="0.4" />
    </svg>
  );
}

export function CrossedSwords({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="blade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="hilt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
      </defs>
      {/* Sword 1 */}
      <g transform="rotate(45 50 50)">
        <path d="M48 20 L50 5 L52 20 L52 70 L48 70 Z" fill="url(#blade)" />
        <rect x="42" y="70" width="16" height="4" fill="url(#hilt)" />
        <rect x="46" y="74" width="8" height="15" fill="#1e293b" stroke="url(#hilt)" strokeWidth="1" />
        <circle cx="50" cy="92" r="4" fill="url(#hilt)" />
      </g>
      {/* Sword 2 */}
      <g transform="rotate(-45 50 50)">
        <path d="M48 20 L50 5 L52 20 L52 70 L48 70 Z" fill="url(#blade)" />
        <rect x="42" y="70" width="16" height="4" fill="url(#hilt)" />
        <rect x="46" y="74" width="8" height="15" fill="#1e293b" stroke="url(#hilt)" strokeWidth="1" />
        <circle cx="50" cy="92" r="4" fill="url(#hilt)" />
      </g>
    </svg>
  );
}

export function ScrollIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="paper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="gold-trim" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <path d="M20 25 C20 15, 80 15, 80 25 L80 85 C80 95, 20 95, 20 85 Z" fill="url(#paper)" stroke="#92400e" strokeWidth="2" />
      {/* Rolled ends */}
      <ellipse cx="50" cy="20" rx="35" ry="8" fill="url(#paper)" stroke="#92400e" strokeWidth="2" />
      <ellipse cx="50" cy="85" rx="35" ry="8" fill="url(#paper)" stroke="#92400e" strokeWidth="2" />
      {/* Gold details */}
      <rect x="15" y="18" width="70" height="4" fill="url(#gold-trim)" />
      <rect x="15" y="83" width="70" height="4" fill="url(#gold-trim)" />
      {/* Writing lines */}
      <line x1="30" y1="40" x2="70" y2="40" stroke="#78350f" strokeWidth="2" opacity="0.6" strokeDasharray="5,2" />
      <line x1="30" y1="50" x2="60" y2="50" stroke="#78350f" strokeWidth="2" opacity="0.6" strokeDasharray="5,2" />
      <line x1="30" y1="60" x2="70" y2="60" stroke="#78350f" strokeWidth="2" opacity="0.6" strokeDasharray="5,2" />
      {/* Emerald Seal */}
      <circle cx="50" cy="50" r="12" fill="#dc2626" />
      <circle cx="50" cy="50" r="8" fill="#991b1b" />
      <polygon points="50,45 55,52 45,52" fill="#fca5a5" opacity="0.8" />
    </svg>
  );
}

export function SettingsGear({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="gear-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      <g transform="translate(50,50)">
        {/* Teeth */}
        {[...Array(8)].map((_, i) => (
          <rect key={i} x="-8" y="-45" width="16" height="20" fill="url(#gear-metal)" transform={`rotate(${i * 45})`} rx="2" />
        ))}
        {/* Inner Ring */}
        <circle cx="0" cy="0" r="30" fill="url(#gear-metal)" stroke="#334155" strokeWidth="4" />
        {/* Hole */}
        <circle cx="0" cy="0" r="15" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
      </g>
    </svg>
  );
}

export function ImperialNameCardBg({ className = "" }: { className?: string }) {
  return (
    <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 250" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0b0f19" />
          <stop offset="50%" stopColor="#1a1423" />
          <stop offset="100%" stopColor="#051014" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(201, 168, 76, 0.2)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <pattern id="hex-pattern" x="0" y="0" width="40" height="69.282" patternUnits="userSpaceOnUse">
          <path d="M40 17.32l-20 11.547L0 17.32V-5.774l20-11.547L40-5.774V17.32zm0 46.188l-20 11.548-20-11.548V40.414L20 28.867l20 11.547v23.094z" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
        </pattern>
        <linearGradient id="gold-trim" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8a6a1c" />
          <stop offset="25%" stopColor="#f7d070" />
          <stop offset="50%" stopColor="#c9a84c" />
          <stop offset="75%" stopColor="#f7d070" />
          <stop offset="100%" stopColor="#8a6a1c" />
        </linearGradient>
      </defs>
      
      {/* Base Background */}
      <rect width="100%" height="100%" fill="url(#bg-grad)" />
      
      {/* Geometric Pattern Overlay */}
      <rect width="100%" height="100%" fill="url(#hex-pattern)" />
      <rect width="100%" height="100%" fill="url(#glow)" />
      
      {/* Ornate Gold Borders */}
      <path d="M 0 10 L 800 10" stroke="url(#gold-trim)" strokeWidth="3" opacity="0.8" />
      <path d="M 0 15 L 800 15" stroke="url(#gold-trim)" strokeWidth="1" opacity="0.4" />
      
      {/* Intricate Corner Accents */}
      <path d="M 0 0 L 40 0 L 40 40 L 30 40 L 30 10 L 0 10 Z" fill="url(#gold-trim)" opacity="0.7" />
      <path d="M 800 0 L 760 0 L 760 40 L 770 40 L 770 10 L 800 10 Z" fill="url(#gold-trim)" opacity="0.7" />
      <path d="M 0 250 L 40 250 L 40 210 L 30 210 L 30 240 L 0 240 Z" fill="url(#gold-trim)" opacity="0.7" />
      <path d="M 800 250 L 760 250 L 760 210 L 770 210 L 770 240 L 800 240 Z" fill="url(#gold-trim)" opacity="0.7" />
      
      {/* Centerpiece Mandala/Crest Backdrop */}
      <g transform="translate(400, 125)" opacity="0.15">
        <circle cx="0" cy="0" r="100" fill="none" stroke="url(#gold-trim)" strokeWidth="2" />
        <circle cx="0" cy="0" r="110" fill="none" stroke="url(#gold-trim)" strokeWidth="0.5" strokeDasharray="5,5" />
        <path d="M 0 -100 L 20 -30 L 100 0 L 20 30 L 0 100 L -20 30 L -100 0 L -20 -30 Z" fill="url(#gold-trim)" />
        <path d="M 0 -70 L 10 -20 L 70 0 L 10 20 L 0 70 L -10 20 L -70 0 L -10 -20 Z" fill="#fff" />
      </g>
      
      {/* Secondary Abstract Wings/Flourishes */}
      <path d="M 200 250 Q 300 150 400 250" fill="none" stroke="url(#gold-trim)" strokeWidth="2" opacity="0.5" />
      <path d="M 600 250 Q 500 150 400 250" fill="none" stroke="url(#gold-trim)" strokeWidth="2" opacity="0.5" />
      <path d="M 250 250 Q 300 180 400 250" fill="none" stroke="url(#gold-trim)" strokeWidth="1" opacity="0.3" />
      <path d="M 550 250 Q 500 180 400 250" fill="none" stroke="url(#gold-trim)" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

export function AvatarSilhouette({ size = 100, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="avatar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a5568" />
          <stop offset="100%" stopColor="#1a202c" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="35" r="20" fill="url(#avatar-grad)" />
      <path d="M 20 90 Q 20 60 50 60 Q 80 60 80 90 Z" fill="url(#avatar-grad)" />
    </svg>
  );
}
