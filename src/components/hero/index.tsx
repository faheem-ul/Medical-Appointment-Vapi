"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { isValidPhoneNumber } from "libphonenumber-js";
import toast from "react-hot-toast";

import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";

import handandPhoneImage from "@/public/Hand and iPhone 16 Pro.png";
import roundbg from "@/public/round-hero.png";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

const Hero = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+1");
  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Ensure "+1" is always at the start and can't be deleted
    if (!value.startsWith("+1")) {
      // If user tries to delete "+1", restore it
      if (value.length < 2) {
        value = "+1";
      } else {
        // If user types something else, prepend "+1"
        value = "+1" + value.replace(/^\+1/, "");
      }
    }
    setPhone(value);
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError("");
    }
    // Validate phone number if it's not empty or just the default "+1"
    if (value.trim() !== "" && value.trim() !== "+1") {
      const isValid = isValidPhoneNumber(value);
      if (!isValid) {
        setPhoneError("Please enter a valid phone number");
      } else {
        setPhoneError("");
      }
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPosition = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;
    // Prevent deleting "+1" if cursor is at the beginning or selection includes it
    if (e.key === "Backspace") {
      if (cursorPosition <= 2 && selectionEnd === cursorPosition) {
        e.preventDefault();
        input.setSelectionRange(2, 2);
      } else if (cursorPosition < 2) {
        // Prevent deleting if selection starts before +1
        e.preventDefault();
        input.setSelectionRange(2, Math.max(2, selectionEnd));
      }
    }
    if (e.key === "Delete") {
      if (cursorPosition < 2) {
        e.preventDefault();
        input.setSelectionRange(2, Math.max(2, selectionEnd));
      }
    }
    // Prevent arrow keys from moving cursor before "+1"
    if ((e.key === "ArrowLeft" || e.key === "Home") && cursorPosition <= 2) {
      e.preventDefault();
      input.setSelectionRange(2, 2);
    }
  };

  const handlePhoneSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (input.selectionStart !== null && input.selectionStart < 2) {
      input.setSelectionRange(2, Math.max(2, input.selectionEnd || 0));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number before submission
    if (phone.trim() === "" || phone.trim() === "+1") {
      setPhoneError("Phone number is required");
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      setPhoneError("Please enter a valid phone number");
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions to continue");
      return;
    }

    setIsLoading(true);
    setPhoneError("");

    try {
      // Execute reCAPTCHA v3
      let recaptchaToken = "";
      const siteKey = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY;
      if (siteKey && typeof window !== "undefined" && window.grecaptcha) {
        try {
          recaptchaToken = await window.grecaptcha.execute(siteKey, {
            action: "submit",
          });
        } catch (recaptchaError) {
          console.error("reCAPTCHA error:", recaptchaError);
          toast.error("reCAPTCHA verification failed. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      // Call agentForm API to send emails
      const agentFormResponse = await fetch("/api/agentForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          recaptchaToken,
          termsAccepted,
        }),
      });

      const agentFormData = await agentFormResponse.json();

      if (!agentFormResponse.ok) {
        console.error("AgentForm API error:", agentFormData);
        const errorMessage =
          agentFormData.error ||
          agentFormData.message ||
          "Something went wrong. Please try again.";
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }


      // Call VAPI to initiate the call
      const vapiResponse = await fetch("/api/vapi/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone }),
      });

      const vapiData = await vapiResponse.json();

      if (!vapiResponse.ok) {
        throw new Error(vapiData.error || "Failed to initiate call");
      }

      
      toast.success("Call initiated! Our AI will call you shortly.");

      // Reset form on success
      setName("");
      setEmail("");
      setPhone("+1");
      setPhoneError("");
      setTermsAccepted(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative w-full md:min-h-screen pt-12 pb-24 md:pb-20 px-4 md:px-8 overflow-hidden">
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-full bg-[#E8F0FE] outline-none text-secondary border-[0.5px] border-primary placeholder:text-gray-400 font-poppins text-[16px] disabled:opacity-50"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-full border outline-none border-primary bg-[#E8F0FE] text-secondary placeholder:text-gray-400 font-poppins text-[16px] disabled:opacity-50"
                required
              />
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone No."
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyDown={handlePhoneKeyDown}
                  onSelect={handlePhoneSelect}
                  onClick={handlePhoneSelect}
                  onKeyUp={handlePhoneSelect}
                  onFocus={(e) => {
                    // Ensure cursor is after "+1" when focused
                    if (
                      e.target.selectionStart !== null &&
                      e.target.selectionStart < 2
                    ) {
                      e.target.setSelectionRange(
                        2,
                        Math.max(2, e.target.selectionEnd || 0)
                      );
                    }
                  }}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-full border outline-none bg-[#E8F0FE] text-secondary placeholder:text-gray-400 font-poppins text-[16px] disabled:opacity-50 ${
                    phoneError
                      ? "border-red-500 focus:border-red-500"
                      : "border-primary focus:border-primary"
                  }`}
                  required
                />
                {phoneError && (
                  <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                )}
              </div>
              
              {/* Terms Checkbox */}
              <div className="flex items-start w-full">
                <label className="flex gap-2 cursor-pointer text-sm text-secondary">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 mt-px rounded border-primary text-primary focus:ring-2 focus:ring-primary disabled:opacity-50 cursor-pointer accent-primary"
                    style={{ accentColor: "var(--primary)" }}
                  />
                  <span>
                    By checking this box, I consent to receive automated calls,
                    texts, and emails.
                    
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-accent hover:opacity-90 duration-500 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Submitting..." : "Submit"}
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
    </section>
  );
};

export default Hero;