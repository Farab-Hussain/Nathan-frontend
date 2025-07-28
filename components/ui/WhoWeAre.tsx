import React from "react";
import WhoWeCard from "../custom/WhoWeCard";

const WhoWeAre = () => {
  return (
    <section className="h-full w-full flex flex-col items-center justify-center bg-white">
      <div className="layout flex items-center justify-center">
        <h1 className="text-4xl font-bold">Who We Are</h1>
      </div>
      <div className="layout flex items-center justify-center">
        <div className="h-full w-1/3 flex flex-col justify-center items-center gap-10">
          <WhoWeCard
            title="Fundraising Made Easy"
            desc="We've simplified the fundraising process so anyone can succeed. ..."
            bgColor="bg-[#F1A900]"
            shadowColor="bg-[#FEE2A1]"
            />
          <WhoWeCard
            title="Another Card"
            desc="Some other description."
            bgColor="bg-[#FF5D39]"
            shadowColor="bg-[#FFBEAF]"
            />
          <WhoWeCard
            title="Third Card"
            desc="Third card description."
            bgColor="bg-[#F1A900]"
            shadowColor="bg-[#FEE2A1]"
            />
          <WhoWeCard
            title="Fourth Card"
            desc="Fourth card description."
            bgColor="bg-[#FF5D39]"
            shadowColor="bg-[#FFBEAF]"
          />
        </div>
        <div></div>
        <div></div>
      </div>
    </section>
  );
};

export default WhoWeAre;
