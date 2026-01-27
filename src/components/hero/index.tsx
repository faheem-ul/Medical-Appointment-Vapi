"use client";

import Image from "next/image";

import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { useState } from "react";

import handandPhoneImage from "@/public/Hand and iPhone 16 Pro.png";
import roundbg from "@/public/round-hero.png";

const Hero = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="relative w-full min-h-screen py-12 md:pb-20 px-4 md:px-8 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          {/* Left Section - Text and Form */}
          <div className="flex flex-col gap-6 md:gap-8 order-1 w-full md:w-1/2">
            {/* H1 Text */}
            <Text as="h1" className="text-primary">
              Manage Your Health with Confidence
            </Text>

            {/* P Tag Text */}
            <Text className="text-secondary max-w-lg">
              Everyone deserves easy access to healthcare. My Doctor makes it
              simple to book medical appointments, connect with professionals,
              and manage your well-being—all in one easy-to-use app.
            </Text>

            {/* Contact Form */}
            <form
              onSubmit={handleSubmit}
              className="bg-[#E6F2FF] rounded-[16px] border-2 border-primary p-6 md:p-8 flex flex-col gap-4 md:gap-6 w-full max-w-md"
            >
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-full bg-[#E8F0FE] outline-none text-secondary border-[0.5px] border-primary placeholder:text-gray-400 font-poppins text-[16px]"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-full border outline-none border-primary bg-[#E8F0FE] text-secondary placeholder:text-gray-400 font-poppins text-[16px]"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone No."
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-full border outline-none border-primary bg-[#E8F0FE] text-secondary placeholder:text-gray-400 font-poppins text-[16px]"
                required
              />
              <Button
                type="submit"
                className="w-full bg-primary text-accent hover:opacity-90 duration-500 rounded-full"
              >
                Submit
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section - Phone Image with Background - Positioned at right edge */}
      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
        <div className="relative h-full w-full">
          {/* Background Image - Only Behind Phone */}
          <div className="absolute inset-0 z-10 top-[27%]">
            <Image
              src={roundbg}
              alt="Background"
            //   fill
              className="object-contain object-right relative"
            //   priority
            />
          </div>
          {/* Phone Image */}
          <div className="absolute right-0 top-0 z-100! w-full pointer-events-auto">
            <Image
              src={handandPhoneImage}
              alt="Hand holding iPhone with My Doctor app"
              className="w-full h-auto object-contain relative"
            //   priority
            />
          </div>
        </div>
      </div>

      {/* Mobile - Phone Image */}
      <div className="md:hidden order-2 mt-8 flex justify-center">
        <div className="relative w-full max-w-md">
          <Image
            src={handandPhoneImage}
            alt="Hand holding iPhone with My Doctor app"
            className="w-full h-auto object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;