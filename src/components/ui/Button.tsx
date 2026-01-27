import React, { FC } from "react";
import { twMerge } from "tailwind-merge";

// import { BackArrowIcon } from "./icons";
import Spinner from "./Spinner";

interface ButtonPropTypes {
  children: React.ReactNode;
  className?: string;
  as?: string;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

const Button: FC<ButtonPropTypes> = (props) => {
  const {
    className,
    children,
    onClick,
    isLoading = false,
    disabled = false,
    type = "button",
  } = props;

  const isDisabled = isLoading || disabled;

  return (
    <button
      type={type}
      className={twMerge(
        "bg-secondary disabled:bg-primary/80 cursor-pointer flex h-[49px] w-[146px] py-3 md:py-[15px] px-4 md:px-[22px] items-center justify-center rounded-[9px] text-[16px] leading-0 text-black transition-opacity font-medium ",
        isDisabled && "cursor-not-allowed ",
        className
      )}
      onClick={onClick}
      disabled={isDisabled}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Spinner className="h-4 md:h-8 w-4 md:w-8" />
          <span>Loading...</span>
        </div>
      ) : (
        <>
          {children}
          {/* <BackArrowIcon /> */}
        </>
      )}
    </button>
  );
};

export default Button;
