import React from "react";
import WhoWeCard from "../custom/WhoWeCard";

const WhoWeAre = () => {
  return (
    <section className="h-full w-full flex flex-col items-center justify-center">
      <div className="layout flex items-center justify-center">
        <h1 className="text-4xl font-bold">Who We Are</h1>
      </div>
      <div className="layout flex items-center justify-center">
        <WhoWeCard/>
      </div>
    </section>
  );
};

export default WhoWeAre;
