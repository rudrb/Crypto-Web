export default function PageContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-w-0 flex-1">{children}</div>;
}