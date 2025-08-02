"use client"
import React, { useState } from "react";
import Image from "next/image";

interface BlogCardProps {
  title: string;
  description: string;
  image: string;
  date: string;
  author: string;
}

const BlogCard = ({ title, description, image, date, author }: BlogCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleReadMore = () => {
    setIsOpen(!isOpen);
  };
  return (
    <section className="bg-white min-h-screen">
          <div className="flex flex-col gap-4 bg-red-50 rounded-lg">
            <Image
              src={image}
              alt="blog"
              width={1000}
              height={1000}
              className="rounded-lg"
            />
            <div className="flex justify-self-end items-center gap-4 border-b-1 border-black/10 pb-4">
              <h1 className="text-sm text-black font-regular">{date}</h1>
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
            <h1 className="text-5xl font-semibold text-black w-5xl">
              {title}
            </h1>
            <p className="text-sm text-[#555555] font-light w-5xl leading-6 py-6">
              {description}
            </p>
            {isOpen && (
              <p className="text-sm text-[#555555] font-light w-5xl leading-6 py-6">
                {description}
              </p>
            )}
            <button onClick={toggleReadMore} className="text-sm text-black font-light w-5xl leading-6 py-6">
              {isOpen ? "Read Less" : "Read More"}
            </button>
          </div>
    </section>
  );
};

export default BlogCard;