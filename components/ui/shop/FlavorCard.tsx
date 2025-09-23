"use client";
import React from "react";
import Image from "next/image";

type Flavor = {
  id: string;
  name: string;
  aliases: string[];
  imageUrl?: string;
  active: boolean;
};

interface FlavorCardProps {
  flavor: Flavor;
  isSelected: boolean;
  inStock: boolean;
  stockCount: number;
  onClick: () => void;
  disabled?: boolean;
}

const FlavorCard: React.FC<FlavorCardProps> = ({
  flavor,
  isSelected,
  inStock,
  stockCount,
  onClick,
  disabled = false,
}) => {
  const getFlavorColor = (flavorName: string) => {
    // Generate consistent colors based on flavor name
    const colors = [
      "from-purple-400 to-pink-400",
      "from-blue-400 to-cyan-400",
      "from-green-400 to-emerald-400",
      "from-yellow-400 to-orange-400",
      "from-red-400 to-pink-400",
      "from-indigo-400 to-purple-400",
      "from-teal-400 to-blue-400",
      "from-lime-400 to-green-400",
      "from-amber-400 to-yellow-400",
      "from-rose-400 to-red-400",
    ];

    const hash = flavorName.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  const getButtonClassName = () => {
    if (isSelected) return "border-[#FF5D39] bg-[#FF5D39]/5 shadow-md";
    if (inStock && !disabled)
      return "border-gray-200 hover:border-[#FF5D39]/50 hover:shadow-sm";
    return "border-gray-200 opacity-50 cursor-not-allowed";
  };

  return (
    <button
      type="button"
      className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 w-full text-left ${getButtonClassName()}`}
      onClick={() => !disabled && inStock && onClick()}
      disabled={disabled || !inStock}
    >
      {/* Flavor Image */}
      <div className="w-full h-16 rounded-lg mb-3 overflow-hidden bg-gray-100 flex items-center justify-center">
        {flavor.imageUrl ? (
          <Image
            width={64}
            height={64}
            src={flavor.imageUrl}
            alt={flavor.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to gradient color if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        {/* Fallback gradient color */}
        <div
          className={`w-full h-full bg-gradient-to-br ${getFlavorColor(
            flavor.name
          )} rounded-lg flex items-center justify-center ${
            flavor.imageUrl ? "hidden" : "flex"
          }`}
        >
          <span className="text-white font-bold text-lg">
            {flavor.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Flavor Name */}
      <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
        {flavor.name}
      </h4>

      {/* Aliases */}
      {flavor.aliases && flavor.aliases.length > 0 && (
        <p className="text-xs text-gray-500 mb-2 truncate">
          {flavor.aliases.slice(0, 2).join(", ")}
          {flavor.aliases.length > 2 && "..."}
        </p>
      )}

      {/* Stock Status */}
      <div className="flex items-center justify-between">
        {(() => {
          const getStockColor = () => {
            if (stockCount > 10) return "text-green-600";
            if (stockCount > 0) return "text-yellow-600";
            return "text-red-600";
          };

          const getStockText = () => {
            if (stockCount >= 999) return "In Stock";
            if (stockCount > 0) return `${stockCount} left`;
            return "Out of stock";
          };

          return (
            <span className={`text-xs font-medium ${getStockColor()}`}>
              {getStockText()}
            </span>
          );
        })()}

        {isSelected && (
          <div className="w-5 h-5 bg-[#FF5D39] rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>

      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-[#FF5D39]/10 rounded-xl border-2 border-[#FF5D39] flex items-center justify-center">
          <div className="bg-[#FF5D39] text-white rounded-full p-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
};

export default FlavorCard;
