import React from "react";
import Image from "next/image";
import Step from "@/components/custom/Step";

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-left mb-16">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-2 text-left">
            OUR PROCESS
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 w-2xl">
            How It Works? Follow the steps to the profit
          </h2>
          <p className="text-lg text-gray-600  text-left w-2xl">
            Looking to spice up snack time with something fun, flavorful, and a
            little nostalgic? Meet Southern Sweet & Sour&apos;s signature
            Licorice Ropes! Whether you&apos;re eating them solo or sharing with
            friends, these chewy ropes are perfect for snacking and
            smilin&apos;.
          </p>
        </div>

        {/* Steps Section */}
        <div className="relative w-full flex items-center justify-center">
          {/* Use the arrow image as a background */}
          <div
            className="w-full flex items-center justify-center relative"
            style={{
              backgroundImage: "url('/assets/svg/arrow.svg')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "contain",
            }}
          >
            <div className="flex w-full h-full items-center justify-center">
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
                title="Step 3"
                description="Step 3 description"
                image="/assets/svg/3.svg"
              />
            </div>
          </div>
        </div>
          {/* SVG Line - Full Background */}
          {/* <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1070 475"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <g filter="url(#filter0_d_2737_305)">
              <path d="M26.5 337C74.5 372 186.3 438 249.5 422C328.5 402 348 299 470 275C592 251 681.5 334.5 776 214C870.5 93.5003 916.5 14.5003 1043.5 31.5003" stroke="#F57059" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <rect x="151" y="380" width="64" height="64" rx="20" fill="white"/>
            <rect x="171" y="400" width="23" height="23" rx="10" fill="#C4C4C4"/>
            <rect x="618" y="248" width="64" height="64" rx="20" fill="white"/>
            <rect x="638" y="268" width="23" height="23" rx="10" fill="#C4C4C4"/>
            <rect x="954" y="-0.000244141" width="64" height="64" rx="20" fill="white"/>
            <rect x="974" y="19.9998" width="23" height="23" rx="10" fill="#C4C4C4"/>
            <defs>
              <filter id="filter0_d_2737_305" x="0" y="26.7036" width="1070" height="448.255" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="24"/>
                <feGaussianBlur stdDeviation="12"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.215686 0 0 0 0 0.203922 0 0 0 0 0.662745 0 0 0 0.3 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2737_305"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2737_305" result="shape"/>
              </filter>
            </defs>
          </svg> */}
      </div>
    </section>
  );
};

export default HowItWorks;
