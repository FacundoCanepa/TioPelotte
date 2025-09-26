import dynamic from 'next/dynamic';

const FabricacionSection = dynamic(() => import('@/components/sections/admin/fabricacion/FabricacionSection'), {
  ssr: false,
});

export default function FabricacionPage() {
  return (
    <div className="space-y-6">
      <FabricacionSection />
    </div>
  );
}
