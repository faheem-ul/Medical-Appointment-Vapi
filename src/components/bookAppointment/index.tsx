import Image from "next/image";
import Text from "../ui/Text";
import Button from "../ui/Button";

import appointment from "@/public/book-appointment.png";

const BookAppointment = () => {
  return (
    <section className="w-full bg-white py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
        {/* Left Section - Image */}
        <div className="w-full md:w-1/2 flex justify-center order-1 md:order-1">
          <div className="relative w-full max-w-lg">
            <Image
              src={appointment}
              alt="Book appointments"
              className="w-full h-auto object-contain rounded-[24px]"
              priority
            />
          </div>
        </div>

        {/* Right Section - Content */}
        <div className="w-full md:w-1/2 flex flex-col gap-6 md:gap-8 order-2 md:order-2">
          <Text as="h1" className="text-primary text-[32px] md:text-[48px] leading-tight font-semibold">
            Book appointments anywhere, anytime!
          </Text>

          <div className="flex flex-col gap-4">
            <Text className="text-secondary text-[16px] md:text-[18px] leading-relaxed">
              No more long queues or waiting on hold. With My Doctor, you can easily
              browse available doctors, choose a time that works for you, and book
              your appointment — all in just a few taps.
            </Text>
            <Text className="text-secondary text-[16px] md:text-[18px] leading-relaxed">
              Whether you're at home or on the go, getting medical help has never
              been this simple.
            </Text>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookAppointment;