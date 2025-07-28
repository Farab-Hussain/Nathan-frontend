import React from "react";
import AnimatedText from "@/components/custom/AnimatedText";

const HowItWorks = () => {

  return (
    <section className=" min-h-[100vh] w-full text-white bg-white h-full  bg-[url('/assets/images/Section.png')] bg-cover bg-no-repeat bg-center">
      <div className="flex flex-col items-start justify-start w-full md:w-[48%] gap-4 text-white  py-12 layout  h-full">
        <h4 className="font-archivo font-bold text-sm leading-[110%] tracking-[0] uppercase text-primary">
          Our Process
        </h4>
        <AnimatedText
          text="How It Works? Follow the steps to the profit"
          className="text-5xl font-inter font-bold max-w-1/3 tracking-[0] relative z-10 text-black"
          splitBy="word"
          duration={0.3}
          stagger={0.1}
        />
        <p className="text-16 font-inter font-medium max-w-full md:max-w-2xl relative z-10 text-black/40 leading">
          Looking to spice up snack time with something fun, flavorful, and a
          little nostalgic? Meet Southern Sweet & Sour&apos;s signature Licorice
          Ropes! Whether you&apos;re eating them solo or sharing with friends,
          these chewy ropes are perfect for snacking and smilin&apos;.
        </p>
      </div>
      {/* <div className="flex flex-col items-start justify-center w-full h-[65vh] ">
          <div className="flex flex-col items-start justify-center gap-4 w-full">
            <div className="flex flex-row items-start justify-between gap-4 w-full">
              <Step
                title="Sign Up for a Fundraiser"
                description="No Fees. No minimums. Sign up via our online form, email, or call our sales team. We are invested in your success. Sign up at least one month in advance and we will send you a box of samples so You can sell."
                image="/assets/svg/1.svg"
              />
              <Step
                title="Sign Up for a Fundraiser"
                description="No Fees. No minimums. Sign up via our online form, email, or call our sales team. We are invested in your success. Sign up at least one month in advance and we will send you a box of samples so You can sell."
                image="/assets/svg/2.svg"
              />
              <Step
                title="Sign Up for a Fundraiser"
                description="No Fees. No minimums. Sign up via our online form, email, or call our sales team. We are invested in your success. Sign up at least one month in advance and we will send you a box of samples so You can sell."
                image="/assets/svg/3.svg"
                image2="/assets/svg/Ellipse.svg"
              />
            </div>
          </div>
        </div> */}
    </section>
  );
};

export default HowItWorks;
