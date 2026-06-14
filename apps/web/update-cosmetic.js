const { PrismaClient } = require('@emerald-kingdom/db'); 
const prisma = new PrismaClient(); 

const css = `
/* Emperor's Aura Overlay */
html::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, transparent 0%, rgba(201, 168, 76, 0.15) 100%);
  z-index: 9998;
  animation: emperor-pulse 4s ease-in-out infinite alternate;
}

/* Floating Gold Dust Particles */
html::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  background-image: 
    radial-gradient(1px 1px at 10% 20%, #ffd700 100%, transparent),
    radial-gradient(2px 2px at 30% 40%, #ffdf00 100%, transparent),
    radial-gradient(1px 1px at 50% 10%, #ffc000 100%, transparent),
    radial-gradient(2px 2px at 70% 60%, #ffd700 100%, transparent),
    radial-gradient(1px 1px at 90% 80%, #ffdf00 100%, transparent),
    radial-gradient(3px 3px at 80% 30%, rgba(255, 215, 0, 0.8) 100%, transparent),
    radial-gradient(1px 1px at 20% 80%, rgba(255, 215, 0, 0.6) 100%, transparent);
  background-size: 150vw 150vh;
  animation: gold-dust 20s linear infinite;
  opacity: 0.6;
}

@keyframes emperor-pulse {
  0% { box-shadow: inset 0 0 50px rgba(201, 168, 76, 0.3); }
  100% { box-shadow: inset 0 0 120px rgba(255, 215, 0, 0.6); }
}

@keyframes gold-dust {
  0% { background-position: 0 0; }
  100% { background-position: 100% 100%; }
}

/* Content cards glassmorphism gold */
.content-card {
  background: rgba(10, 15, 10, 0.6) !important;
  backdrop-filter: blur(12px) !important;
  border-color: rgba(201, 168, 76, 0.4) !important;
  box-shadow: 0 8px 32px rgba(201, 168, 76, 0.1) !important;
}
`; 

prisma.cosmetic.update({
  where: { id: 'cmq4fea6500126vxrreno0pp9' }, 
  data: { webCode: css }
}).then(() => console.log('Aura Updated!'))
  .finally(()=>prisma.$disconnect());
