"use client";

type FilterBarProps = {
    categories: string[];
    active: string;
    onChange: (category: string) => void;
};

export default function FilterBar({ categories, active, onChange }: FilterBarProps) {
    return (
        <div className="filter-bar" role="group" aria-label="Product category filters">
            {categories.map((category) => {
                const isActive = active === category;
                return (
                    <button
                        key={category}
                        className={`filter-chip ${isActive ? "filter-chip-active" : ""}`}
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
