"use client"
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AnimatedText from "@/components/custom/AnimatedText";

interface BlogCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  author: string;
  wrapper?: boolean;
}

const BlogCard = ({ id, title, description, image, date, author, wrapper }: BlogCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleReadMore = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="flex flex-col gap-4 rounded-lg ">
      <Link href={`/blogs/${id}`} className="cursor-pointer">
        <Image
          src={image}
          alt="blog"
          width={1000}
          height={1000}
          className="rounded-lg w-full h-auto hover:opacity-90 transition-opacity"
        />
      </Link>
      {wrapper && (
        <div className="flex justify-self-end items-center gap-4 border-b-1 border-black/10 pb-4">
          <AnimatedText
            text={date}
            className="text-sm text-black font-regular"
            splitBy="character"
            duration={0.3}
            stagger={0.02}
            triggerStart="top 90%"
          />
          <hr className="w-2 h-1 bg-black" />
          <Image
            src="/assets/images/blogRG.png"
            alt="blog"
            width={25}
            height={40}
            className="rounded-lg"
          />
          <p className="text-sm text-black font-light uppercase">
            {author}
          </p>
        </div>
      )}
      <AnimatedText
        text={title}
        className="text-2xl md:text-3xl lg:text-4xl font-semibold text-black"
        splitBy="word"
        duration={0.5}
        stagger={0.08}
        triggerStart="top 85%"
      />
      <p className="text-sm text-[#555555] font-light leading-6">
        {description}
      </p>
      {isOpen && (
        <p className="text-sm text-[#555555] font-light leading-6">
          {description}
        </p>
      )}
      <button onClick={toggleReadMore} className="text-sm text-black font-light leading-6 self-start">
        {isOpen ? "Read Less" : "Read More"}
      </button>
    </div>
  );
};

export default BlogCard;