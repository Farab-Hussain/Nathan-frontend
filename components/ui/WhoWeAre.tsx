import React from "react";
import WhoWeCard from "../custom/WhoWeCard";
import Image from "next/image";
import CustomButton from "../custom/CustomButton";

const WhoWeAre = () => {
  return (
    <section className="h-full w-full flex flex-col items-center justify-center bg-white py-8 md:py-12 lg:py-16 px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-black text-center mb-6 md:mb-8 lg:mb-10">
        Who We Are
      </h1>
      <div className="layout flex flex-col lg:flex-row items-center justify-between w-full gap-8 lg:gap-4">
        <div className="h-full w-full flex flex-col justify-center items-center gap-4 md:gap-6 lg:gap-8">
          <WhoWeCard
            title="Fundraising Made Easy"
            desc="We’ve simplified the fundraising process 
            so anyone can succeed. With no fees, no minimum 
            orders, and 50% of every sale going to your cause, 
            our program is designed to remove the stress and maximize your results."
            bgColor="bg-[#F1A900]"
            shadowColor="bg-[#FEE2A1]"
          />
          <WhoWeCard
            title="Deliciously Unique Product"
            desc="Our Southern Sweet & Sour 
            Licorice Ropes are a hit with both kids and 
            adults. We carefully package our top flavors to 
            make selling easy — supporters love them, and 
            participants feel confident sharing something they enjoy."
            bgColor="bg-[#FF5D39]"
            shadowColor="bg-[#FFBEAF]"
          />
        </div>
        <div className="h-full w-full relative flex flex-col items-center justify-center gap-6 md:gap-8 lg:gap-10 mt-8 md:mt-16 lg:mt-36" style={{ perspective: '800px', transformStyle: 'preserve-3d' }}>
          <div className="bg-[#00B2AA] rounded-lg h-[300px] w-[240px] md:h-[400px] md:w-[320px] lg:h-[475px] lg:w-[368px] relative mb-10 transition-transform duration-500 ease-in-out cursor-pointer hover-moved">
            <Image
              src="/assets/images/girl.png"
              alt="who-we-are"
              width={368}
              height={475}
              className="absolute bottom-0 left-0 object-cover"
            />
          </div>
          <CustomButton
            title="Start Fundraiser"
            className="mt-8 md:mt-12 lg:mt-[92px]"
          />
        </div>
        <div className="h-full w-full flex flex-col justify-center items-center gap-4 md:gap-6 lg:gap-8">
          <WhoWeCard
            title="Rooted in Real Experience"
            desc="Our founders grew up doing 
            traditional fundraisers. With 6 kids, 
            they've experienced just about everything. 
            After a career in the Army and gaining experience 
            selling concessions, they created Licorice 4 Good 
            to offer a smarter, tastier way to raise funds."
            bgColor="bg-[#FF5D39]"
            shadowColor="bg-[#FFBEAF]"
          />
          <WhoWeCard
            title="Focused on Your Success"
            desc="We're not just about candy — we're 
            about community. We provide free sample boxes, 
            full support, and everything you need to run a 
            successful fundraiser from start to finish. Your 
            success is our mission."
            bgColor="bg-[#F1A900]"
            shadowColor="bg-[#FEE2A1]"
          />
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
