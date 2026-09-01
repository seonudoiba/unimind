import React from 'react';

// Sunny - The Sun character with proper breathing animation
export const Sunny = ({ size = 180, breathing = false }) => {
  const scale = size / 180;
  const rayLength = 88 * scale;
  const rayWidth = 14 * scale;
  
  return (
    <div className="relative mx-auto" style={{ 
      width: size + (rayLength * 2), 
      height: size + (rayLength * 2),
      margin: '0 auto'
    }}>
      <div 
        className="absolute" 
        style={{ 
          width: size, 
          height: size,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className={`absolute inset-0 ${breathing ? 'animate-[spin_40s_linear_infinite,breathe_8s_ease-in-out_infinite]' : 'animate-spin-slow'}`}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 bg-sun rounded-lg origin-[50%_0%]"
              style={{ 
                width: Math.max(8, rayWidth),
                height: rayLength,
                marginLeft: `-${Math.max(4, rayWidth/2)}px`,
                marginTop: `-${rayLength}px`,
                transform: `rotate(${i * 45}deg)`,
                transformOrigin: '50% 100%',
              }}
            />
          ))}
        </div>
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#FFD98A] to-sun shadow-[0_8px_18px_rgba(214,134,42,0.35),inset_0_-8px_14px_rgba(214,134,42,0.25)] flex items-center justify-center z-10"
          style={{ width: 118 * scale, height: 118 * scale }}
        >
          <div className="absolute flex" style={{ top: 44 * scale, gap: 22 * scale }}>
            <div className="rounded-full bg-navy" style={{ width: Math.max(6, 10 * scale), height: Math.max(8, 12 * scale) }} />
            <div className="rounded-full bg-navy" style={{ width: Math.max(6, 10 * scale), height: Math.max(8, 12 * scale) }} />
          </div>
          <div 
            className="absolute border-[3px] sm:border-[5px] border-navy border-t-0 rounded-b-[20px] sm:rounded-b-[30px]"
            style={{ 
              top: 66 * scale, 
              width: 34 * scale, 
              height: 16 * scale,
              borderWidth: Math.max(2, 5 * scale)
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const Friends = ({ bounce = false }) => {
  const animals = ['bunny', 'bear', 'fox'];
  const bounceClasses = ['animate-bounce-delay-1', 'animate-bounce-delay-2', 'animate-bounce-delay-3'];
  
  return (
    <div className="flex gap-2 sm:gap-4 justify-center my-2 sm:my-3.5">
      {animals.map((animal, i) => (
        <div 
          key={i}
          className={`w-[50px] h-[44px] sm:w-[70px] sm:h-[60px] rounded-[50%_50%_46%_46%/60%_60%_40%_40%] inline-flex items-center justify-center relative shadow-[0_4px_8px_rgba(0,0,0,0.08)] sm:shadow-[0_6px_12px_rgba(0,0,0,0.08)]
            ${animal === 'bunny' ? 'bg-[#F6D8C6]' : ''}
            ${animal === 'bear' ? 'bg-[#C9A27A]' : ''}
            ${animal === 'fox' ? 'bg-[#E8955C]' : ''}
            ${bounce ? bounceClasses[i] : ''}`}
        >
          <div className={`absolute -top-2.5 sm:-top-3.5 w-[12px] sm:w-[18px] h-[16px] sm:h-6 rounded-full left-1.5 sm:left-2 -rotate-[15deg] 
            ${animal === 'bunny' ? 'bg-[#F6D8C6]' : ''}
            ${animal === 'bear' ? 'bg-[#C9A27A]' : ''}
            ${animal === 'fox' ? 'bg-[#E8955C]' : ''}`}
          />
          <div className={`absolute -top-2.5 sm:-top-3.5 w-[12px] sm:w-[18px] h-[16px] sm:h-6 rounded-full right-1.5 sm:right-2 rotate-[15deg]
            ${animal === 'bunny' ? 'bg-[#F6D8C6]' : ''}
            ${animal === 'bear' ? 'bg-[#C9A27A]' : ''}
            ${animal === 'fox' ? 'bg-[#E8955C]' : ''}`}
          />
          <div className="flex gap-2 sm:gap-3.5">
            <div className="w-1 sm:w-1.5 h-[5px] sm:h-[7px] bg-navy rounded-full" />
            <div className="w-1 sm:w-1.5 h-[5px] sm:h-[7px] bg-navy rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};