/* eslint-disable @next/next/no-img-element */
export default function Photo({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return null;
  return (
    <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
  );
}