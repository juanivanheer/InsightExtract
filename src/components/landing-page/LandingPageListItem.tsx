import { ReactNode } from "react";

type ListItemChildrenType = {
  stepNumber: number;
  mainTitle: string;
  subTitle: ReactNode;
};

const LandingPageListItem = ({
  stepNumber,
  mainTitle,
  subTitle,
}: ListItemChildrenType) => {
  return (
    <li className="md:flex-1">
      <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
        <span className="text-sm font-medium text-blue-600">
          Step {stepNumber}
        </span>
        <span className="text-xl font-semibold">{mainTitle}</span>
        {subTitle}
      </div>
    </li>
  );
};

export default LandingPageListItem;
