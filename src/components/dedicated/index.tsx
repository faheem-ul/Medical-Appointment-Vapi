"use client";

import Image from "next/image";
import Text from "../ui/Text";
import Button from "../ui/Button";

import doctorImage from "@/public/doctor.png";
import pattern from "@/public/Pattern.png";

const Dedicated = () => {
  const stats = [
    { number: "150+", label: "Verified Doctors" },
    { number: "800+", label: "Appointments Booked" },
    { number: "1M+", label: "App Downloads" },
  ];

  return (
    <section className="w-full bg-[#CBEDFB] py-12 md:py-0 px-4 md:px-8">
      <div className="max-w-7xl mx-auto h-auto md:py-[100px] py-[50px] flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Left Section - Doctor Image with Pattern */}
        <div className="relative w-full md:w-1/2 h-[400px] md:h-full flex items-center justify-center order-1 md:order-1">
          {/* Pattern Background */}
          <div className="absolute inset-0 z-0 md:h-[507px] h-[607px] top-1/2 -translate-y-1/2">
            <Image
              src={pattern}
              alt="Pattern background"
              fill
              className="object-contain"
              priority
            />
          </div>
          {/* Doctor Image */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <Image
              src={doctorImage}
              alt="Doctor"
              className="w-full h-full max-w-[320px] object-contain"
            //   priority
            />
          </div>
        </div>

        {/* Right Section - Content */}
        <div className="w-full md:w-1/2 flex flex-col gap-6 md:gap-8 order-2 md:order-2">
          {/* Main Heading */}
          <Text as="h1" className="text-primary">
            We are dedicated to empowering individuals to take control of their
            health.
          </Text>

          {/* Descriptive Paragraph */}
          <Text className="text-secondary max-w-lg">
            Manage your health with ease and confidence — from finding the right
            doctor to booking appointments and tracking your progress, all in
            one simple app you can rely on.
          </Text>

          {/* Statistics */}
          <div className="flex flex-col md:flex-row md:gap-12 gap-8 mt-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Text as="h1" className="text-secondary text-[32px] md:text-[48px] leading-tight">
                  {stat.number}
                </Text>
                <Text className="text-secondary text-[14px] md:text-[20px] md:leading-[24px]">
                  {stat.label}
                </Text>
              </div>
            ))}
          </div>

         
        </div>
      </div>
    </section>
  );
};

export default Dedicated;