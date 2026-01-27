"use client";

import Image from "next/image";
import Text from "../ui/Text";
import Button from "../ui/Button";

import mobile from "@/public/mobile.png";
import edit from "@/public/edit.svg";
import calendar from "@/public/calendar-tick.svg";
import directory from "@/public/ranking.svg";
import medicalrecords from "@/public/document-text.svg";
import prescrption from "@/public/receipt-2.svg";

const KeyFeatures = () => {
  const features = [
    {
      icon: calendar,
      title: "Smart Booking",
      description:
        "Book appointments with verified doctors instantly. Get reminders and manage your schedule effortlessly.",
      order: 1,
    },
    {
      icon: edit,
      title: "24/7 Consultation",
      description:
        "Access medical consultations anytime, anywhere. Connect with healthcare professionals round the clock.",
      order: 2,
    },
    {
      icon: directory,
      title: "Doctor Directory",
      description:
        "Browse through a comprehensive directory of verified doctors. Find specialists based on your needs.",
      order: 3,
    },
    {
      icon: medicalrecords,
      title: "Medical Records",
      description:
        "Store and access your medical records securely. Keep track of your health history in one place.",
      order: 4,
    },
    {
      icon: prescrption,
      title: "E-Prescription",
      description:
        "Receive digital prescriptions directly in the app. No need to carry paper prescriptions anymore.",
      order: 5,
    },
  ];

  return (
    <section className="w-full bg-white py-12 md:py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Heading Section */}
        <div className="text-center mb-12 md:mb-16">
          <Text as="h1" className="text-primary mb-4">
            Key Features
          </Text>
          <Text className="text-secondary max-w-2xl mx-auto">
            We are dedicated to empowering individuals to manage your health
            effectively
          </Text>
        </div>

        {/* Features Grid - Desktop */}
        <div className="hidden md:grid md:grid-cols-3 gap-x-8 items-center mb-16">
          {/* Left Column */}
          <div className="flex flex-col gap-8 h-full justify-center">
            {/* Smart Booking */}
            <div className="bg-[#CBEDFB] rounded-[24px] p-8 flex flex-col gap-4 min-h-[240px]">
              <div className="bg-[#0A5EB0] w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Image
                  src={features[0].icon}
                  alt={features[0].title}
                  width={24}
                  height={24}
                  className="invert brightness-0"
                />
              </div>
              <Text as="h2" className="text-primary text-[24px] font-semibold">
                {features[0].title}
              </Text>
              <Text className="text-secondary text-[16px] leading-[22px]">
                {features[0].description}
              </Text>
              <a
                href="#"
                className="text-primary font-medium text-[16px] mt-auto flex items-center gap-1"
              >
                Learn more →
              </a>
            </div>

            {/* Doctor Directory */}
            <div className="bg-[#CBEDFB] rounded-[24px] p-8 flex flex-col gap-4 min-h-[240px]">
              <div className="bg-[#0A5EB0] w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Image
                  src={features[2].icon}
                  alt={features[2].title}
                  width={24}
                  height={24}
                  className="invert brightness-0"
                />
              </div>
              <Text as="h2" className="text-primary text-[24px] font-semibold">
                {features[2].title}
              </Text>
              <Text className="text-secondary text-[16px] leading-[22px]">
                {features[2].description}
              </Text>
              <a
                href="#"
                className="text-primary font-medium text-[16px] mt-auto flex items-center gap-1"
              >
                Learn more →
              </a>
            </div>
          </div>

          {/* Middle Column - Phone and Medical Records */}
          <div className="flex flex-col gap-8 items-center justify-between h-full">
            {/* Phone Image */}
            <div className="relative w-full ">
              <Image
                src={mobile}
                alt="Mobile app"
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Medical Records (Below Phone) */}
            <div className="bg-[#CBEDFB] rounded-[24px] p-8 flex flex-col gap-4 w-full min-h-[240px]">
              <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Image
                  src={features[3].icon}
                  alt={features[3].title}
                  width={24}
                  height={24}
                  className="invert brightness-0"
                />
              </div>
              <Text as="h2" className="text-primary text-[24px] font-semibold">
                {features[3].title}
              </Text>
              <Text className="text-secondary text-[16px] leading-[22px]">
                {features[3].description}
              </Text>
              <a
                href="#"
                className="text-primary font-medium text-[16px] mt-auto flex items-center gap-1"
              >
                Learn more →
              </a>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-8 h-full justify-center">
            {/* 24/7 Consultation */}
            <div className="bg-[#CBEDFB] rounded-[24px] p-8 flex flex-col gap-4 min-h-[240px]">
              <div className="bg-[#0A5EB0] w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Image
                  src={features[1].icon}
                  alt={features[1].title}
                  width={24}
                  height={24}
                  className="invert brightness-0"
                />
              </div>
              <Text as="h2" className="text-primary text-[24px] font-semibold">
                {features[1].title}
              </Text>
              <Text className="text-secondary text-[16px] leading-[22px]">
                {features[1].description}
              </Text>
              <a
                href="#"
                className="text-primary font-medium text-[16px] mt-auto flex items-center gap-1"
              >
                Learn more →
              </a>
            </div>

            {/* E-Prescription */}
            <div className="bg-[#CBEDFB] rounded-[24px] p-8 flex flex-col gap-4 min-h-[240px]">
              <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Image
                  src={features[4].icon}
                  alt={features[4].title}
                  width={24}
                  height={24}
                  className="invert brightness-0"
                />
              </div>
              <Text as="h2" className="text-primary text-[24px] font-semibold">
                {features[4].title}
              </Text>
              <Text className="text-secondary text-[16px] leading-[22px]">
                {features[4].description}
              </Text>
              <a
                href="#"
                className="text-primary font-medium text-[16px] mt-auto flex items-center gap-1"
              >
                Learn more →
              </a>
            </div>
          </div>
        </div>

        {/* Mobile View - Vertical Stack */}
        <div className="md:hidden flex flex-col gap-8 mb-12">
          {/* 2 cards above */}
          {features.slice(0, 2).map((feature, index) => (
            <div
              key={index}
              className="bg-[#CBEDFB] rounded-[20px] p-6 flex flex-col gap-4"
            >
              <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={20}
                  height={20}
                  className="invert brightness-0"
                />
              </div>
              <Text as="h2" className="text-primary text-[20px] font-semibold">
                {feature.title}
              </Text>
              <Text className="text-secondary text-[14px] leading-[20px]">
                {feature.description}
              </Text>
              <a
                href="#"
                className="text-primary font-medium text-[14px] flex items-center gap-1"
              >
                Learn more →
              </a>
            </div>
          ))}

          {/* Phone Image - Center */}
          <div className="">
            <Image
              src={mobile}
              alt="Mobile app"
              className="w-full h-auto"
              priority
            />
          </div>

          {/* 3 cards below */}
          {features.slice(2).map((feature, index) => (
            <div
              key={index + 2}
              className="bg-[#CBEDFB] rounded-[20px] p-6 flex flex-col gap-4"
            >
              <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={20}
                  height={20}
                  className="invert brightness-0"
                />
              </div>
              <Text as="h2" className="text-primary text-[20px] font-semibold">
                {feature.title}
              </Text>
              <Text className="text-secondary text-[14px] leading-[20px]">
                {feature.description}
              </Text>
              <a
                href="#"
                className="text-primary font-medium text-[14px] flex items-center gap-1"
              >
                Learn more →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;