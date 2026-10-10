import Link from "next/link";
import Image from "next/image";

type Props = {
  href: string;
  image: string;
  label: string;
};

export default function CarteVignette({ href, image, label }: Props) {
  return (
    <Link
      href={href}
      className="relative block w-full h-full overflow-hidden rounded-xl"
    >
      <Image src={image} alt={label} fill className="object-cover" />

      {/* Bandeau sombre en dégradé, centré en hauteur, collé au bord gauche */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-fit max-w-full bg-gradient-to-r from-black/85 via-black/60 to-transparent py-4 pl-6 pr-14">
        <span className="text-white text-lg font-bold leading-tight">
          {label}
        </span>
      </div>
    </Link>
  );
}