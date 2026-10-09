'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash2, ChefHat } from 'lucide-react';

interface Recipe {
  id: number;
  name: string;
  ingredients: string;
  instructions: string;
  created_at: string;
}

export default function RecipesApp() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    ingredients: '',
    instructions: '',
  });
  const [expanded, setExpanded] = useState<Record<number, { ingredients: boolean; instructions: boolean }>>({});

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    try {
      const res = await fetch('/api/recipes');
      const data = await res.json();
      setRecipes(data);
    } catch {
      console.error('Error fetching recipes');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.ingredients.trim() || !form.instructions.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setForm({ name: '', ingredients: '', instructions: '' });
        await fetchRecipes();
      } else {
        setError('Error al guardar la receta');
      }
    } catch {
      setError('Error al guardar la receta');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
      await fetchRecipes();
    } catch {
      console.error('Error deleting recipe');
    }
  }

  function toggleSection(id: number, section: 'ingredients' | 'instructions') {
    setExpanded((prev) => ({
      ...prev,
      [id]: {
        ingredients: prev[id]?.ingredients ?? false,
        instructions: prev[id]?.instructions ?? false,
        [section]: !(prev[id]?.[section] ?? false),
      },
    }));
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center gap-3 mb-8">
          <ChefHat className="w-8 h-8 text-[#FF8C42]" />
          <h1 className="text-2xl font-semibold text-[#222222]">Recetas de Cocina</h1>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Section */}
          <section className="bg-white rounded-[0.25rem] p-6 shadow-sm h-fit">
            <h2 className="text-xl font-semibold text-[#222222] mb-6">Nueva Receta</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#777777] mb-1">
                  Nombre de la Receta
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Pasta a la Carbonara"
                  className="w-full px-3 py-2 border border-[#DDD] rounded-[0.25rem] bg-white text-[#222222] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#777777] mb-1">
                  Ingredientes
                </label>
                <textarea
                  value={form.ingredients}
                  onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                  placeholder="Uno por línea, ej:&#10;400g de pasta&#10;200g de guanciale"
                  rows={4}
                  className="w-full px-3 py-2 border border-[#DDD] rounded-[0.25rem] bg-white text-[#222222] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#777777] mb-1">
                  Instrucciones
                </label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  placeholder="Describe los pasos:&#10;Precalienta el horno a 180°C..."
                  rows={6}
                  className="w-full px-3 py-2 border border-[#DDD] rounded-[0.25rem] bg-white text-[#222222] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#FF8C42] hover:bg-[#e67d3a] text-white font-medium py-3 px-6 rounded-[0.5rem] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar Receta'}
              </button>

              {error && (
                <p className="text-[#E63946] text-sm text-center">{error}</p>
              )}
            </form>
          </section>

          {/* Recipes List Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#222222]">Mis Recetas</h2>
              <span className="text-sm text-[#666666]">
                Total: {recipes.length} {recipes.length === 1 ? 'receta' : 'recetas'}
              </span>
            </div>

            {loading ? (
              <div className="bg-white rounded-[0.25rem] p-6 shadow-sm text-center text-[#777777]">
                Cargando recetas...
              </div>
            ) : recipes.length === 0 ? (
              <div className="bg-white rounded-[0.25rem] p-6 shadow-sm text-center text-[#777777]">
                No hay recetas guardadas. Agrega tu primera receta.
              </div>
            ) : (
              <div className="space-y-3">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    expanded={expanded[recipe.id] ?? { ingredients: false, instructions: false }}
                    onToggle={(section) => toggleSection(recipe.id, section)}
                    onDelete={() => handleDelete(recipe.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

interface RecipeCardProps {
  recipe: Recipe;
  expanded: { ingredients: boolean; instructions: boolean };
  onToggle: (section: 'ingredients' | 'instructions') => void;
  onDelete: () => void;
}

function RecipeCard({ recipe, expanded, onToggle, onDelete }: RecipeCardProps) {
  return (
    <div className="bg-white rounded-[0.25rem] shadow-[0_2px_4px_rgba(0,0,0,0.05)] border-l-4 border-l-[#FF8C42] p-4 relative">
      <button
        onClick={onDelete}
        className="absolute top-4 right-4 text-[#E63946] hover:text-[#c5303c] transition-colors duration-200"
        aria-label="Eliminar receta"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <h3 className="text-base font-semibold text-[#222222] pr-8 mb-3">{recipe.name}</h3>

      <CollapsibleSection
        title="Ingredientes"
        content={recipe.ingredients}
        isOpen={expanded.ingredients}
        onToggle={() => onToggle('ingredients')}
      />

      <CollapsibleSection
        title="Instrucciones"
        content={recipe.instructions}
        isOpen={expanded.instructions}
        onToggle={() => onToggle('instructions')}
      />
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}

function CollapsibleSection({ title, content, isOpen, onToggle }: CollapsibleSectionProps) {
  return (
    <div className="mt-2">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-sm font-medium text-[#555555] hover:text-[#333333] transition-colors duration-200"
      >
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {title}
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-[13px] text-[#555555] whitespace-pre-line pl-5">{content}</p>
      </div>
    </div>
  );
}
