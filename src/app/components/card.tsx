interface CardProps {
  title: string;
  children: React.ReactNode;
  image?: string;
  imageAlt?: string;
  footer?: React.ReactNode;
}

export function Card({ title, children, image, imageAlt, footer }: CardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
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
