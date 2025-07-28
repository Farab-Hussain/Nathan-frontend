import Image from "next/image";
import React from "react";

const WhoWeCard = () => {
  return (
    <div className="flex flex-col items-start justify-start w-72 sm:w-80 md:w-96 bg-secondary rounded-xl shadow-lg p-6">
      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-4">
        <Image
          src="/assets/svg/logo.svg"
          alt="Southern Sweet & Sour Logo"
          width={100}
          height={100}
          className="w-full h-full object-contain"
        />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
        Fundraising Made Easy
      </h1>
      <p className="text-sm sm:text-base md:text-lg text-white leading-relaxed">
        We&apos;ve simplified the fundraising process so anyone can succeed.
        With no fees, no minimum orders, and 50% of every sale going to your
        cause, our program is designed to remove the stress and maximize your
        results.
      </p>
    </div>
    // </div>
  );
};

export default WhoWeCard;
