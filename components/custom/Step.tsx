import React from "react";
import Image from "next/image";

interface StepProps {
  title: string;
  description: string;
  image: string;
  image2?: string;
}

const Step = ({ title, description, image, image2 }: StepProps) => {
  return (
    <div className="flex flex-col items-start justify-center gap-4 w-1/6 h-2xs relative">
      <Image
        src={image}
        alt={"row"}
        width={100}
        height={100}
        className="absolute bottom-30 right-0 z-10"
      />
      <h1 className="text-16 font-bold text-black">{title}</h1>
      <p className="text-16 font-inter font-medium max-w-10/12 md:max-w-md relative z-10 text-black/40 text-left">
        {description}
      </p>
      {image2 && (
        <Image
          src={image2}
          alt={"Ellipse"}
          width={100} 
          height={100}
          className="absolute bottom-30 right-0 "
        />
      )}
    </div>
  );
};

export default Step;
