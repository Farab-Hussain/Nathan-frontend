"use client";
import React from "react";
import Link from "next/link";

interface ButtonProps {
  title: string;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const CustomButton = ({ title, className,  disabled = false, type = "button", style, href, onClick }: ButtonProps) => {
  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex items-center justify-center bg-secondary text-[14px] md:text-[16px] px-4 py-2 md:px-6 md:py-4 rounded-full text-white disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        style={style}
        aria-disabled={disabled}
      >
        {title}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`bg-secondary 
        text-[14px] md:text-[16px] px-4 py-2 md:px-6 md:py-4 rounded-full text-white disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      style={style}
      onClick={onClick}
    >
      {title}
    </button>
  );
};

export default CustomButton;