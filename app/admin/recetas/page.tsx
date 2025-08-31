import RecipeSection from '@/components/sections/admin/recetas/RecipeSection';

export const dynamic = 'force-dynamic';

export default function AdminRecetasPage() {
  return (
      <div className="mx-auto max-w-7xl p-4">
        <RecipeSection />
      </div>
  );
}

