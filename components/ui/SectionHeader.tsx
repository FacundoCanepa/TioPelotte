interface Props {
  title: string;
  subtitle?: string;
  center?: boolean;
}

const SectionHeader = ({ title, subtitle, center = true }: Props) => {
  return (
    <div className={`${center ? "text-center" : "text-left"} mb-6`}>
      <h3 className="font-garamond text-3xl md:text-5xl italic tracking-wide">
        {title}
      </h3>
      {subtitle && (
        <p className="text-stone-600 italic font-garamond text-base md:text-lg mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
