import { useState, useEffect } from 'react';

const icons = [
  { id: 1, type: 'refinery_complex', top: '5%', left: '5%', size: 300, rotate: 0, mobile: false },
  { id: 2, type: 'gear_large', top: '15%', right: '8%', size: 140, rotate: true, speed: '25s', mobile: true },
  { id: 3, type: 'christmas_tree', top: '55%', left: '3%', size: 200, rotate: 0, mobile: false },
  { id: 4, type: 'pressure_gauge', top: '75%', right: '15%', size: 100, rotate: false, mobile: true },
  { id: 5, type: 'drilling_rig_pro', top: '35%', right: '4%', size: 220, rotate: 0, mobile: true },
  { id: 6, type: 'refinery_tower', bottom: '8%', left: '18%', size: 240, rotate: 0, mobile: false },
  { id: 7, type: 'gear_small', bottom: '20%', right: '22%', size: 90, rotate: true, speed: '18s', direction: 'reverse', mobile: true },
  { id: 8, type: 'pipeline_manifold', top: '5%', right: '25%', size: 150, rotate: 0, mobile: false },
];

const GearIcon = ({ speed = '20s', direction = 'normal' }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" style={{ animation: `spin ${speed} linear infinite ${direction}` }}>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    <path d="M94.4 43.1l-8.9-1.5c-.6-2.5-1.5-4.8-2.7-7l5.4-7.3c.7-.9.6-2.2-.3-3l-7.1-7.1c-.8-.8-2.1-.9-3-.3l-7.3 5.4c-2.2-1.2-4.5-2.1-7-2.7l-1.5-8.9c-.2-1.1-1.1-1.9-2.2-1.9h-10c-1.1 0-2 .8-2.2 1.9l-1.5 8.9c-2.5.6-4.8 1.5-7 2.7l-7.3-5.4c-.9-.7-2.2-.6-3 .3l-7.1 7.1c-.8.8-.9 2.1-.3 3l5.4 7.3c-1.2 2.2-2.1 4.5-2.7 7l-8.9 1.5c-1.1.2-1.9 1.1-1.9 2.2v10c0 1.1.8 2 1.9 2.2l8.9 1.5c.6 2.5 1.5 4.8 2.7 7l-5.4 7.3c-.7.9-.6 2.2.3 3l7.1 7.1c.8.8 2.1.9 3 .3l7.3-5.4c2.2 1.2 4.5 2.1 7 2.7l1.5 8.9c.2 1.1 1.1 1.9 2.2 1.9h10c1.1 0 2-.8 2.2-1.9l1.5-8.9c2.5-.6 4.8-1.5 7-2.7l7.3 5.4c.9.7 2.2.6 3-.3l7.1-7.1c.8-.8.9-2.1.3-3l-5.4-7.3c1.2-2.2 2.1-4.5 2.7-7l8.9-1.5c1.1-.2 1.9-1.1 1.9-2.2v-10c0-1.1-.8-2-1.9-2.2zM50 65c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15z" />
  </svg>
);

const RefineryComplex = () => (
  <svg viewBox="0 0 160 100" fill="currentColor">
    <path d="M10 90h140v2H10zM20 90V40h20v50zM45 90V60h15v30zM65 90V25h12v65H65zM85 90V55h25v35H85zM115 90V15h10v75h-10z" />
    <path d="M25 40V25h2v15h-2zM35 40V30h2v10h-2zM120 15V5h2v10h-2z" />
    <path d="M40 70h25M77 40h8M110 65h5" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <circle cx="97" cy="65" r="5" opacity="0.6" />
  </svg>
);

const ChristmasTree = () => (
  <svg viewBox="0 0 100 100" fill="currentColor">
    <rect x="45" y="10" width="10" height="80" /><rect x="25" y="30" width="50" height="8" />
    <rect x="30" y="50" width="40" height="8" /><rect x="35" y="70" width="30" height="8" />
    <circle cx="25" cy="34" r="4" /><circle cx="75" cy="34" r="4" />
    <circle cx="30" cy="54" r="3" /><circle cx="70" cy="54" r="3" />
  </svg>
);

const PressureGauge = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="50" cy="50" r="30" /><path d="M50 50l15-15" strokeWidth="3" />
    <path d="M35 50h5M60 50h5M50 35v5M50 60v5" opacity="0.5" />
    <rect x="45" y="80" width="10" height="10" fill="currentColor" stroke="none" />
  </svg>
);

const DrillingRigPro = () => (
  <svg viewBox="0 0 100 100" fill="currentColor">
    <path d="M50 5L15 90h70L50 5zm0 12l25 73H25L50 17z" />
    <path d="M48 20h4v65h-4zM30 75h40v2H30zM35 60h30v2H35zM42 40h16v2H42z" />
    <path d="M10 90h80v3H10z" />
  </svg>
);

const renderIcon = (type, speed, direction) => {
  switch (type) {
    case 'refinery_complex': case 'refinery_tower': return <RefineryComplex />;
    case 'gear_large': case 'gear_small': return <GearIcon speed={speed} direction={direction} />;
    case 'christmas_tree': case 'pipeline_manifold': return <ChristmasTree />;
    case 'pressure_gauge': return <PressureGauge />;
    case 'drilling_rig_pro': return <DrillingRigPro />;
    default: return null;
  }
};

export const AuthBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 40, y: (e.clientY / window.innerHeight - 0.5) * 40 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-[0.05] sm:opacity-[0.07]">
      {icons.map((icon) => (
        <div
          key={icon.id}
          className={`absolute text-[#8B4513] transition-transform duration-1000 ease-out ${!icon.mobile ? 'hidden sm:block' : ''}`}
          style={{
            top: icon.top, left: icon.left, right: icon.right, bottom: icon.bottom,
            width: icon.size, height: icon.size,
            transform: `translate(${mousePos.x * (icon.id * 0.08)}px, ${mousePos.y * (icon.id * 0.08)}px) scale(${icon.mobile ? '0.7' : '1'})`,
          }}
        >
          {renderIcon(icon.type, icon.speed, icon.direction)}
        </div>
      ))}
    </div>
  );
};
