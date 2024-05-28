import { ReactNode } from "react";

type MaxWidthWrapperType = {
  className?: string;
  children: ReactNode;
};

const MaxWidthWrapper = ({ className, children }: MaxWidthWrapperType) => {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-2.5 md:px-20">
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
