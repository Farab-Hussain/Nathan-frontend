import React from "react";
import Image from "next/image";
import Step from "@/components/custom/Step";

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-16 text-left">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-2">
            OUR PROCESS
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 max-w-3xl">
            How It Works? Follow the steps to the profit
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
            Looking to spice up snack time with something fun, flavorful, and a
            little nostalgic? Meet Southern Sweet &amp; Sour&apos;s signature
            Licorice Ropes! Whether you&apos;re eating them solo or sharing with
            friends, these chewy ropes are perfect for snacking and
            smilin&apos;.
          </p>
        </div>

        {/* Steps Section */}
        <div className="relative w-full flex items-center justify-center">
          {/* Use the arrow image as a background */}
          <Image
            src={"/assets/svg/circle.svg"}
            alt={"circle"}
            width={500}
            height={100}
            className="absolute -top-60 -right-80 z-0"
          />
          <div className="w-full flex items-center justify-center z-10">
            <div className="flex flex-col w-full h-full items-center gap-9 justify-center">
              <Step
                title="Sign Up for a Fundraiser"
                description="No Fees. No minimums.
              Sign up via our online form,
              email, or call
              our sales
              team. We
              are invested in
              your success.
              Sign up at least one
              month in advance and we will send you a box of samples so You can sell"
                image="/assets/svg/1.svg"
              />
              <Step
                title="Start Selling"
                description="We make it easy.   
              Each fundraiser runs for either
              4 or 5 days (your choice).  
              We provide you a media kit along
              with some best practices to ensure 
              you are successful. "
                image="/assets/svg/2.svg"
              />
              <Step
                title="Earn for  your Organization"
                description="50% of your sales (not counting tax or shipping) goes to your organization.
                You can expect a check about 14 days after
                your fundraiser ends."
                image="/assets/svg/3.svg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;