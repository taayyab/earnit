type StepTitleProps = {
  title: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

const StepTitle = ({
  title,
  subtitle,
  titleClassName = "",
  subtitleClassName = "",
}: StepTitleProps) => (
  <>
    <h2 className={`mt-6 text-3xl font-bold mb-2 ${titleClassName}`}>
      {title}
    </h2>
    {subtitle ? (
      <p className={`mt-3 text-[#65758b] text-lg ${subtitleClassName}`}>
        {subtitle}
      </p>
    ) : null}
  </>
);

export default StepTitle;
