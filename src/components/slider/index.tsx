"use client"

import Image from "next/image"

import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Navigation, Scrollbar, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { GoogleRatingIcon } from "@/components/ui/Icons";
import Text from "../ui/Text";

import slider1 from "@/public/slider1.jpg";
import slider2 from "@/public/slider2.jpg";
import slider3 from "@/public/slider3.jpg";
import slider4 from "@/public/slider4.avif";
import slider5 from "@/public/slider5.avif";
import moveback from "@/public/arrowback.svg";
import moveforward from "@/public/arrownext.svg";

const Slider = () => {
  const testimonials = [
    {
      name: "Alexa Marceline",
      handle: "@marceline_alexa",
      image: slider1,
      text: "I was able to consult with a doctor late at night from home. It gave me peace of mind when I needed it most.",
      rating: "5/5",
    },
    {
      name: "John Doe",
      handle: "@john_doe",
      image: slider2,
      text: "The best medical app I have ever used. The interface is so simple and the doctors are very professional.",
      rating: "5/5",
    },
    {
      name: "Sarah Smith",
      handle: "@sarah_smith",
      image: slider3,
      text: "Booking appointments has never been easier. I highly recommend this app to everyone for their healthcare needs.",
      rating: "5/5",
    },
    {
      name: "Michael Brown",
      handle: "@michael_b",
      image: slider4,
      text: "Great experience! The 24/7 consultation feature is a lifesaver. Fast and reliable service every time.",
      rating: "5/5",
    },
    {
      name: "Emily Davis",
      handle: "@emily_d",
      image: slider5,
      text: "Very convenient and efficient. I can manage all my medical records and prescriptions in one place.",
      rating: "5/5",
    },
  ];

  return (
    <section className="w-full bg-white py-16 md:py-24 overflow-hidden max-w-7xl mx-auto">
      <style jsx global>{`
        .mySwiper .swiper-pagination {
          bottom: 0px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .mySwiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #0A5EB0 !important;
          opacity: 0.3;
          margin: 0 !important;
          transition: all 0.3s ease;
        }
        .mySwiper .swiper-pagination-bullet-active {
          width: 12px;
          height: 12px;
          opacity: 1;
        }
      `}</style>
      <div className="max-w-7xl mx-auto md:px-0 px-4">
        {/* Header Section */}
        <div className="text-center mb-3 flex flex-col items-center gap-6">
          <Text as="h1" className="text-primary text-[32px] md:text-[48px] leading-tight">
            Patients Love My Doctor
          </Text>
          <Text className="text-secondary max-w-2xl text-[16px] md:text-[18px]">
            Real stories from real users. See how My Doctor is making
            healthcare easier, faster, and more personal.
          </Text>
          
          {/* Trusted By Section */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 text-secondary text-[14px] md:text-[16px] font-medium">
            <span>Trusted by :</span>
            <span className="font-bold">69,999+</span>
            <span>users |</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <GoogleRatingIcon key={i} className="w-4 h-4 md:w-5 md:h-5" />
              ))}
            </div>
            <div className="font-bold ml-1">4.97/5</div>
          </div>
        </div>

        {/* Navigation Buttons - Top Right */}
        <div className="flex justify-end gap-4 mb-3">
          <button className="custom-prev md:w-12 md:h-12 w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-primary/70 rounded-full">
            <Image src={moveback} alt="Previous" />
          </button>
          <button className="custom-next md:w-12 md:h-12 w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-primary/70 rounded-full">
            <Image src={moveforward} alt="Next" />
          </button>
        </div>

        <Swiper
          slidesPerView={1}
          spaceBetween={20}
          breakpoints={{
            640: { 
              slidesPerView: 2, 
              spaceBetween: 24 
            },
            1024: { 
              slidesPerView: 3.3, 
              spaceBetween: 30 
            },
          }}
          centeredSlides={false}
          loop={true}
          pagination={{
            clickable: true,
          }}
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
          modules={[Keyboard, Navigation, Scrollbar, Pagination]}
          className="mySwiper pb-16!"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div className="bg-[#CBEDFB] rounded-[24px] p-8 flex flex-col gap-6 h-full min-h-[280px] shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-primary font-semibold text-[18px] leading-tight">
                      {testimonial.name}
                    </span>
                    <span className="text-primary text-[14px]">
                      {testimonial.handle}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <p className="text-secondary text-[16px] leading-[22px] font-normal">
                  {testimonial.text}
                </p>

                {/* Footer */}
                <div className="mt-auto flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <GoogleRatingIcon key={i} className="w-5 h-5" />
                    ))}
                  </div>
                  <span className="text-secondary font-bold text-[16px]">
                    {testimonial.rating}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Slider;