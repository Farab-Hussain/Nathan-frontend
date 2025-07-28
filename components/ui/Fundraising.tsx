import React from "react";
import CustomButton from "../custom/CustomButton";
import Image from "next/image";
import AnimatedText from "../custom/AnimatedText";

const Fundraising = () => {


  return (
    <section className="layout flex flex-col-reverse md:flex-row items-center justify-center gap-8 md:gap-10 min-h-[10vh] w-full text-white pb-28">
      <div className="flex flex-col items-start justify-center w-full md:w-[48%] gap-4 text-white relative">
        <AnimatedText
          text="Fundraising just got sweeter"
          className="font-archivo font-bold text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] xl:text-[72px] leading-[110%] tracking-[0]"
          splitBy="word"
          duration={0.3}
          stagger={0.1}
        />
        <p className="text-16 font-inter font-medium max-w-full md:max-w-md leading-[150%] tracking-[0] pb-20 relative z-10">
          Sell Southern Sweet & Sour Licorice Ropes and keep 50% of every sale.
          No fees, no minimums, just success.
        </p>
        <Image
          src="/assets/images/Arrow.png"
          alt="decorative arrow"
          width={40}
          height={40}
          className="
            w-full max-w-[60px]
            sm:max-w-[90px] md:max-w-[120px] lg:max-w-[150px] h-auto
            sm:absolute sm:bottom-0 sm:left-1/3 sm:-translate-x-0
            md:left-0 md:ml-[190px] md:translate-x-0 md:absolute
            left-1/2 -translate-x-1/2
            rotate-3 z-10 
          "
        />
        <CustomButton
          title="Get Started Now"
          className="bg-primary text-white w-full sm:w-auto relative z-10"
        />
      </div>
      <div className="flex flex-col items-center md:items-end justify-center w-full md:w-[52%] mb-6 md:mb-0">
        <Image
          src="/assets/images/hero.png"
          alt="hero-image"
          width={400}
          height={400}
          className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] h-auto"
        />
      </div>
    </section>
  );
};

export default Fundraising;
