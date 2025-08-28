"use client";
import React, { useState } from "react";
import Image from "next/image";
import { navLinks } from "@/constant";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlignLeft, X } from "lucide-react";
import CustomButton from "@/components/custom/CustomButton";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

const Header = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuthStore();
  const { user } = useUser();
  const router = useRouter();

  const handleAuthButtonClick = () => {
    if (user) {
      logout()
        .then(() => router.replace("/"))
        .catch(() => {});
    } else {
      router.push("/auth/register");
    }
  };
  return (
    <header className="z-50 h-auto min-h-[80px] md:h-[114px] w-full layout flex justify-between items-center py-4 px-4 md:px-0">
      <div className="flex justify-between items-center w-full md:w-[50%] gap-4 md:gap-10">
        <div className="flex justify-between items-center gap-4 md:hidden">
          <AlignLeft
            onClick={() => setIsOpen(!isOpen)}
            className="text-white"
          />
          {isOpen && (
            <div className="flex justify-between items-start gap-4 absolute top-0 left-0 w-1/2 h-screen z-50 bg-primary border-r border-white p-4 transition-all duration-700 pt-11">
              <div className="flex flex-col justify-between items-start gap-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      href={link.href}
                      key={link.label}
                      className="no-underline"
                    >
                      <span
                        className={`text-16 font-inter transition-all duration-300 ${
                          isActive ? "text-secondary" : "text-white"
                        } hover:text-secondary active:text-secondary focus:text-secondary`}
                      >
                        {link.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
              <X onClick={() => setIsOpen(!isOpen)} className="text-white" />
            </div>
          )}
        </div>
        <Link href="/">
          <Image
            src="/assets/svg/logo.svg"
            alt="logo"
            width={110}
            height={110}
            className="w-[80px] h-[80px] md:w-[110px] md:h-[110px]"
          />
        </Link>
        <div className="justify-between items-center gap-6 md:gap-10 hidden md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link href={link.href} key={link.label} className="no-underline">
                <span
                  className={`text-16 font-inter transition-all duration-300 ${
                    isActive ? "text-secondary" : "text-white"
                  } hover:text-secondary active:text-secondary focus:text-secondary`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex justify-end items-center gap-4 w-full md:w-[60%]">
        <Link href="/orders" className="hidden md:inline-block">
          <span className="text-white hover:text-secondary transition-colors flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="lucide lucide-shopping-cart w-5 h-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 3H4.2a2 2 0 0 1 2 1.72l.34 2.06m0 0L7.6 8.6A2 2 0 0 0 9.5 10h7.72a2 2 0 0 0 1.97-1.68l1.38-7.32A1 1 0 0 0 19.6 0H6.21" />
            </svg>

          </span>
        </Link>
        <CustomButton
          title={user ? "Logout" : "Sign up"}
          onClick={handleAuthButtonClick}
          className="bg-white !text-primary font-inter font-bold rounded-md px-4 py-2 md:px-6 md:py-4 text-sm md:text-base"
        />
      </div>
    </header>
  );
};

export default Header;
