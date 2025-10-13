import { Search, Plus } from "lucide-react";

interface Props {
  categories: readonly string[];
  category: string;
  onCategoryChange: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  onAdd: () => void;
}

export default function FiltersBar({ categories, category, onCategoryChange, query, onQueryChange, onAdd }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 w-full md:w-48">
        <select disabled
          className="w-full bg-transparent text-white/80 text-sm focus:outline-none"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option>All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="ml-auto bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 w-full md:w-80">
        <Search className="w-4 h-4 text-white/60" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search in IPTV..."
          className="bg-transparent text-white/80 text-sm w-full placeholder-white/40 focus:outline-none"
        />
      </div>
      <button
        onClick={onAdd}
        className="px-4 py-2 rounded-lg border border-orange-500 text-orange-400 hover:bg-orange-500/10 transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        ADD ITEM
      </button>
    </div>
  );
}
