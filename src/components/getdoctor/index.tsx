"use client";

import Image from "next/image";
import Text from "../ui/Text";
import Button from "../ui/Button";

import phones from "@/public/get-doctor-monile.png";

const GetDoctor = () => {
  return (
    <section className="w-full bg-primary py-16 md:py-24 px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Left Content */}
        <div className="w-full md:w-1/2 flex flex-col gap-6 md:gap-8">
          <Text as="h1" className="text-white capitalize">
            Get a doctor's consultation right now
          </Text>
          
          <Text className="text-white/90 text-[16px] md:text-[18px] leading-relaxed max-w-xl">
            Need medical advice? Our certified doctors are available 24/7 to support 
            you with accurate, reliable care — whether it's a quick question or a 
            serious concern. Get connected instantly and experience a hassle-free 
            consultation from the comfort of your home.
          </Text>
        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/2 relative flex justify-center md:justify-end">
          <div className="relative w-full max-w-[600px]">
            <Image 
              src={phones} 
              alt="My Doctor App Interface" 
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetDoctor;
