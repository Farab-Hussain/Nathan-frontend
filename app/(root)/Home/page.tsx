import CustomButton from "@/components/custom/CustomButton";
import Image from "next/image";
import React from "react";

const home = () => {
  return (
    <section className="layout flex flex-col-reverse md:flex-row items-center justify-center gap-8 md:gap-10 min-h-[70vh]  w-full text-white  ">
      <div className="flex flex-col items-start justify-center w-full  gap-4 text-white">
        <h1 className="font-archivo font-bold text-[2.5rem] sm:text-[3rem] md:w-2xl w-full md:text-[4rem] lg:text-[72px] leading-[110%] tracking-[0]">
          Fundraising just got sweeter
        </h1>
        <p className="text-16 font-inter font-medium max-w-md leading-[150%] tracking-[0] py-6 md:py-8">
          Sell Southern Sweet & Sour Licorice Ropes and keep 50% of every sale.
          No fees, no minimums, just success.
        </p>
        <CustomButton
          title="Get Started Now"
          className="bg-primary text-white w-full sm:w-auto"
        />
      </div>
      <div className="flex flex-col items-end justify-end w-full">
        <Image
          src="/assets/images/hero.png"
          alt="hero-image"
          width={400}
          height={400}
          className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[500px] "
        />
      </div>
    </section>
  );
};

export default home;