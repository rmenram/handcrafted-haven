"use client";

type FilterBarProps = {
    categories: string[];
    active: string;
    onChange: (category: string) => void;
};

export default function FilterBar({ categories, active, onChange }: FilterBarProps) {
    return (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Product category filters">
            {categories.map((category) => {
                const isActive = active === category;
                return (
                    <button
                        key={category}
                        className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
                            isActive 
                            ? "bg-amber-600 text-white shadow-md shadow-amber-600/20" 
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-amber-600"
                        }`}
                        onClick={() => onChange(category)}
                        type="button"
                    >
                        {category}
                    </button>
                );
            })}
        </div>
    );
}
