import Image from "next/image";

import React from "react";

interface WhoWeCardProps {
  title: string;
  desc: string;
  className?: string;
  bgColor?: string;      // Card background
  shadowColor?: string;  // Shadow background
}

const WhoWeCard: React.FC<WhoWeCardProps> = ({
  title,
  desc,
  className,
  bgColor = "bg-[#F1A900]",
  shadowColor,
}) => {
  // If no shadowColor is provided, use the same as bgColor
  const shadow = shadowColor || bgColor;

  return (
    <div className={`relative w-72 sm:w-80 md:w-96 ${className ? className : ""}`}>
      <div className={`absolute top-3 left-3 w-full h-full rounded-2xl z-0 ${shadow}`}></div>
      <div className={`relative flex flex-col items-start justify-start w-full rounded-2xl p-6 z-10 ${bgColor}`}>
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-4">
          <Image
            src="/assets/svg/logo.svg"
            alt="Southern Sweet & Sour Logo"
            width={100}
            height={100}
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-base md:text-lg text-white leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
};

export default WhoWeCard;
