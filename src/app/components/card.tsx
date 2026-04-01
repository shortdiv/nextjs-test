interface CardProps {
  title: string;
  children: React.ReactNode;
  image?: string;
  imageAlt?: string;
  footer?: React.ReactNode;
  variant?: "default" | "outlined" | "elevated";
  onClick?: () => void;
}

//this is a card
export function Card({
  title,
  children,
  image,
  imageAlt,
  footer,
  variant = "default",
  onClick,
}: CardProps) {
  const variantStyles = {
    default: "border border-gray-200 bg-white shadow-sm",
    outlined: "border-2 border-gray-300 bg-transparent",
    elevated: "border border-gray-100 bg-white shadow-lg",
  };

  return (
    <div
      className={`rounded-xl overflow-hidden ${variantStyles[variant]} ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={image}
            alt={imageAlt ?? title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <div className="mt-2 text-sm text-gray-500">{children}</div>
      </div>
      {footer && (
        <div className="border-t border-gray-200 px-6 py-4 text-sm text-gray-400">
          {footer}
        </div>
      )}
    </div>
  );
}
