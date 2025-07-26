import React from "react";

interface ButtonProps {
  title: string;
  className?: string;
  onClick?: () => void;
}

const CustomButton = ({ title, className, onClick }: ButtonProps) => {
  return (
    <button
      className={`bg-secondary 
        text-[14px] md:text-[16px] px-4 py-2 md:px-6 md:py-4 rounded-full text-white ${className}`}
      onClick={onClick}
    >
      {title}
    </button>
  );
};

export default CustomButton;