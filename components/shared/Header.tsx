"use client";
import React, { useState } from "react";
import Image from "next/image";
import { navLinks } from "@/constant";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlignLeft, X } from "lucide-react";
import CustomButton from "@/components/custom/CustomButton";


const Header = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header
      className="z-50 h-[114px] w-full layout
    flex justify-between items-center py-4 layout "
    >
      <div className="flex justify-between items-center md:w-[50%] w-full gap-10 ">
        <div className="flex justify-between items-center gap-4 md:hidden">
          <AlignLeft onClick={() => setIsOpen(!isOpen)} />
          {isOpen && (
            <div
              className="flex  justify-between 
            items-start gap-4 absolute top-0 left-0 w-1/2 h-screen z-50 bg-primary border-r border-white     
            p-4 transition-all duration-700 pt-11"
            >
              <div className="flex flex-col justify-between items-start gap-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link href={link.href} key={link.label}>
                      <h2
                        className={`text-16 font-inter transition-all duration-300
                        ${isActive ? "text-secondary" : ""}
                        hover:text-secondary active:text-secondary focus:text-secondary`}
                      >
                        {link.label}
                      </h2>
                    </Link>
                  );
                })}
              </div>
              <X onClick={() => setIsOpen(!isOpen)} className="text-white" />
            </div>
          )}
        </div>
        <Link href="/">
          <Image src="/assets/svg/logo.svg" alt="logo" width={110} height={110} />
        </Link>
        <div className="justify-between items-center gap-10 hidden md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link href={link.href} key={link.label}>
                <h2
                  className={`text-16 font-inter transition-all duration-300
                  ${isActive ? "text-secondary" : ""}
                  hover:text-secondary active:text-secondary focus:text-secondary`}
                >
                  {link.label}
                </h2>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex justify-end items-center gap-4  w-full">
        <CustomButton
          title="Sign in"
          className="bg-white !text-primary font-inter font-bold rounded-md"
        />
      </div>
    </header>
  );
};

export default Header;
