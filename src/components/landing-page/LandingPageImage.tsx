import Image from "next/image";

type LandingPageImageType = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
};

const LandingPageImage = ({
  src,
  alt,
  width,
  height,
  quality,
}: LandingPageImageType) => (
  <div className="mx-auto max-w-6xl px-6 lg:px-8">
    <div className="mt-16 flow-root sm:mt-24">
      <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
        <Image
          src={src}
          alt={alt}
          width={width ?? 1364}
          height={height ?? 866}
          quality={quality ?? 100}
          className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
        />
      </div>
    </div>
  </div>
);

export default LandingPageImage;
