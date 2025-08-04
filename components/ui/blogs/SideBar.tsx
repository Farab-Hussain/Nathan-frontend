import React from "react";
import Image from "next/image";
import AnimatedText from "@/components/custom/AnimatedText";

interface SideBarProps {
  title: string;
  description: string;
  image: string;
}

const SideBar = ({ title, description, image }: SideBarProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-lg ">
      <Image
        src={image}
        alt="blog"
        width={1000}
        height={1000}
        className="rounded-lg w-full h-auto"
      />
      <AnimatedText
        text={title}
        className="text-xl md:text-2xl font-semibold text-black"
        splitBy="word"
        duration={0.5}
        stagger={0.08}
        triggerStart="top 85%"
      />
      <p className="text-sm text-[#555555] leading-6">
        {description}
      </p>
    </div>
  );
};

export default SideBar;
