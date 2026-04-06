export default function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}