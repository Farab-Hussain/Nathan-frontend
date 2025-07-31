import CustomButton from "@/components/custom/CustomButton";
import React from "react";

const data = [
  {
    title: "3x",
    subtitle: "increase in sales",
    description:
      "Groups that switch from traditional brochure fundraising to virtual fundraising see sales go up threefold.",
  },
  {
    title: "$360",
    subtitle: "average per seller",
    description:
      "An average seller should be able to make between 10-15 sales over a 5 day fundraiser.",
  },
  {
    title: "$3,500",
    subtitle: "average per team",
    description: "Most teams of 20 sellers can expect to earn about $3,500.",
  },
];

const Rope = () => {
  return (
    <section className="w-full min-h-full flex flex-col items-center justify-center py-8 md:py-12 lg:py-16 px-4 md:px-8 bg-secondary">
      <div className="w-full flex flex-col items-center justify-center relative gap-6 md:gap-8 lg:gap-10 layout">
        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white text-center max-w-4xl leading-tight">
          Virtual fundraising with real results
        </h1>
        <p className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-white text-center w-full md:w-3/4 lg:w-1/2 leading-relaxed">
          Our Traditional, sweet, and sour flavors bring joy to all who try
          them. Orders are packaged fresh and shipped directly from the South
          anywhere in the U.S.
        </p>
        <button
          className="font-bold text-white w-full md:w-auto px-8 py-3 md:py-4 mt-4 rounded-full text-[14px] md:text-[16px]"
          style={{ backgroundColor: '#FF5D39' }}
        >
          Explore Flavors
        </button>
      </div>
    </section>
  );
};

export default Rope;
