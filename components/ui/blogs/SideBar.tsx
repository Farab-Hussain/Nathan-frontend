import React from "react";
import Image from "next/image";
import AnimatedText from "@/components/custom/AnimatedText";

interface SideBarProps {
  title: string;
  description: string | string[];
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
      <div className="text-sm text-[#555555] leading-6">
        {Array.isArray(description) ? (
          description.map((paragraph, index) => (
            <p key={index} className="mb-3 last:mb-0">
              {paragraph}
            </p>
          ))
        ) : (
          <p>{description}</p>
        )}
      </div>
    </div>
  );
};

export default SideBar;
