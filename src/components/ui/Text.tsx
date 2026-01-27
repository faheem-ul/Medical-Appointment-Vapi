import { twMerge } from "tailwind-merge";

interface TextPropTypes {
  children: React.ReactNode;
  className?: string;
  as?: string;

  id?: string;
  onClick?: () => void;
}

const Text: React.FC<TextPropTypes> = (props) => {
  const { className, children, as, onClick, id } = props;

  if (as === "h1") {
    return (
      <h1
        id={id}
        className={twMerge(
          "text-primary text-[24px] leading-[33px] md:text-[48px] md:leading-[52px] font-semibold font-poppins",
          className
        )}
      >
        {children}
      </h1>
    );
  }

  if (as === "h2") {
    return (
      <h2
        id={id}
        className={twMerge(
          "text-primary text-[24px] leading-[33px] md:text-[28px] md:leading-[32px] font-medium font-poppins",

          className
        )}
      >
        {children}
      </h2>
    );
  }

  return (
    <p
      className={twMerge(
        "text-primary text-[16px] leading-[22px] md:text-[20px] md:leading-[24px] font-normal font-poppins",
        className
      )}
      onClick={onClick}
      id={id}
    >
      {children}
    </p>
  );
};

export default Text;
