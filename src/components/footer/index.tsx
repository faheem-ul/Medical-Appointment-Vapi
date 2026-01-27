"use client";

import Image from "next/image";
import Text from "../ui/Text";
import logo from "@/public/footer-logo.svg";

const Footer = () => {
  const footerLinks = {
    explore: [
      { label: "Features", href: "#" },
      { label: "Tutorials", href: "#" },
      { label: "Feedback", href: "#" },
    ],
    support: [
      { label: "About Us", href: "#" },
      { label: "Download App", href: "#" },
    ],
    company: [
      { label: "About My Doctor", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
    ],
  };

  return (
    <footer className="w-full bg-primary pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Border Line */}
        <div className="w-full h-px bg-white/20 mb-12" />

        <div className="flex flex-col md:items-start md:flex-row justify-between gap-12 md:gap-8 mb-16">
          {/* Logo and Brand */}
            <Image
              src={logo}
              alt="My Doctor Logo"
              className=""
            />
            
          {/* Links Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-20">
            {/* Explore */}
            <div className="flex flex-col gap-4">
              <Text className="text-white font-bold text-[18px]">Explore</Text>
              <div className="flex flex-col gap-3">
                {footerLinks.explore.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors text-[16px]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="flex flex-col gap-4">
              <Text className="text-white font-bold text-[18px]">Support</Text>
              <div className="flex flex-col gap-3">
                {footerLinks.support.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors text-[16px]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-4">
              <Text className="text-white font-bold text-[18px]">Company</Text>
              <div className="flex flex-col gap-3">
                {footerLinks.company.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors text-[16px]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/10">
          <Text className="text-white/60 text-[12px] md:text-[12px]">
            ©2026 Mo.Edu Inc All rights reserved.
          </Text>
          
          <div className="flex gap-6 md:gap-12">
            <a href="#" className="text-white/60 hover:text-white text-[14px] transition-colors">
              Term of Use
            </a>
            <a href="#" className="text-white/60 hover:text-white text-[14px] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white/60 hover:text-white text-[14px] transition-colors">
              Cookie Preferences
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
