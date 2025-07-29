import Fundraising from "@/components/ui/Fundraising";
import HowItWorks from "@/components/ui/HowItWorks";
import ShopOur from "@/components/ui/ShopOur";
import WhoWeAre from "@/components/ui/WhoWeAre";
import WhyChose from "@/components/ui/WhyChose";
import React from "react";

const home = () => {
  return (
    <>
      <Fundraising/>
      <HowItWorks/>
      <WhyChose/>
      <WhoWeAre/>
      <ShopOur/>
    </>
  );
};

export default home;  