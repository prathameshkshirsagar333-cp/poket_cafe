export default function SectionHeading({
  title,
  subtitle,
  centered = true,
  light = false
}: {
  title: string;
  subtitle: string;
  centered?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`flex flex-col ${centered ? "items-center text-center" : "items-start text-left"} mb-12`}>
      <span className="text-cafe-secondary font-semibold tracking-widest uppercase text-sm mb-2 relative">
        {subtitle}
      </span>
      <h2 className={`text-4xl md:text-5xl font-serif font-bold ${light ? "text-white" : "text-cafe-dark"}`}>
        {title}
      </h2>
      <div className={`mt-6 flex flex-col ${centered ? "items-center" : "items-start"} gap-1`}>
        <div className="h-0.5 w-16 bg-cafe-secondary"></div>
        <div className="h-0.5 w-8 bg-cafe-accent opacity-50"></div>
      </div>
    </div>
  );
}
