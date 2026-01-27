"use client";

import Image from "next/image";

import logo from "@/public/Logo.svg"

import Text from "@/components/ui/Text";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/ShadCnDrawer";
import { MenuIcon, MenuCloseIcon } from "@/components/ui/Icons";

const Navbar = () => {
  const navLinks = ["Home", "Features", "About Us", "Feedback", "Contact"];

  return (
    <nav className="w-full py-6 md:pt-[80px] px-4 md:px-8 pb-12 md:pb-16 relative z-0" style={{ background: 'linear-gradient(179.1deg, #CBEDFB 0%, #FFFFFF 60%)' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Brand Name */}
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt="My Doctor Logo"
            // width={40}
            // height={40}
            // className="w-10 h-10"
          />
          <Text
            className="text-primary text-[28px] leading-[32px] font-normal font-poppins"
          >
            My Doctor
          </Text>
        </div>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Text
              key={link}
              className="text-primary text-[16px] leading-[22px] font-normal font-poppins cursor-pointer hover:opacity-80 transition-opacity"
            >
              {link}
            </Text>
          ))}
        </div>

        {/* Mobile Menu - Drawer */}
        <div className="md:hidden">
          <Drawer direction="left">
            <DrawerTrigger asChild>
              <button className="text-primary p-2" aria-label="Open menu">
                <MenuIcon className="text-primary" />
              </button>
            </DrawerTrigger>

            <DrawerContent className="h-full w-full max-w-none rounded-none border-none">
              <div className="relative h-full w-full flex flex-col bg-white">
                {/* Close Icon - Top Right */}
                <div className="absolute top-6 right-6 z-10">
                  <DrawerClose asChild>
                    <button
                      className="bg-transparent p-2"
                      aria-label="Close menu"
                    >
                      <MenuCloseIcon />
                    </button>
                  </DrawerClose>
                </div>

                {/* Navigation Links Content */}
                <div className="flex-1 flex flex-col pt-20 pb-8 px-6 gap-6">
                  {navLinks.map((link) => (
                    <DrawerClose key={link} asChild>
                      <Text
                        className="text-primary text-[20px] leading-[28px] font-normal font-poppins cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        {link}
                      </Text>
                    </DrawerClose>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;