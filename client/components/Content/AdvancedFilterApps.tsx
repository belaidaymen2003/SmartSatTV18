import React, { useEffect, useRef, useState } from "react";

type AppFilters = {
  q?: string;
  minCredit?: number | null;
  maxCredit?: number | null;
  version?: string;
  platforms?: string[];
  internetConnection?: boolean | null;
  minStorage?: number | null;
  maxStorage?: number | null;
  sortBy?: "newest" | "price" | "name" | "version";
  sortDir?: "asc" | "desc";
};

function useOutsideClick(handler: () => void) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) handler();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [handler]);
  return ref;
}

function Dropdown<T extends string | number | undefined>({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClick(() => setOpen(false));

  return (
    <div className="relative" ref={ref as any}>
      {label && <div className="text-sm text-white/60">{label}</div>}
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full mt-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white text-left flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">
          {options.find((o) => o.value === value)?.label ??
            placeholder ??
            "Select"}
        </span>
        <svg
          className={`ml-2 w-4 h-4 text-white/60 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="absolute backdrop-blur-3xl z-50 mt-2 w-full max-h-56 overflow-auto rounded-md bg-white/5 border border-white/10 py-1 shadow-lg"
        >
          {options.map((opt) => (
            <li
              key={String(opt.value)}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer hover:bg-white/10 ${
                opt.value === value ? "bg-white/10" : ""
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MultiSelectDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClick(() => setOpen(false));

  function toggle(val: string) {
    if (value.includes(val)) onChange(value.filter((v) => v !== val));
    else onChange([...value, val]);
  }

  return (
    <div className="relative" ref={ref as any}>
      {label && <div className="text-sm text-white/60">{label}</div>}
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full mt-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white text-left flex items-center justify-between"
      >
        <span className="truncate">
          {value.length ? value.join(", ") : "Any"}
        </span>
        <svg
          className={`ml-2 w-4 h-4 text-white/60 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <ul className="absolute  z-50 mt-2 w-full max-h-56 overflow-auto rounded-md bg-white/5 border border-white/10 py-2 shadow-lg">
          {options.map((opt) => (
            <li key={opt.value} className="  px-3 py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-white">{opt.label}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdvancedFilterApps({
  initial = {},
  onApply,
  onReset,
}: {
  initial?: AppFilters;
  onApply: (f: AppFilters) => void;
  onReset?: () => void;
}) {
  const [q, setQ] = useState(initial.q || "");
  const [minCredit, setMinCredit] = useState<string>(
    initial.minCredit?.toString() || ""
  );
  const [maxCredit, setMaxCredit] = useState<string>(
    initial.maxCredit?.toString() || ""
  );
  const [version, setVersion] = useState(initial.version || "");
  const [platforms, setPlatforms] = useState<string[]>(initial.platforms || []);
  const [internet, setInternet] = useState<boolean | null>(
    initial.internetConnection ?? null
  );
  const [minStorage, setMinStorage] = useState<string>(
    initial.minStorage?.toString() || ""
  );
  const [maxStorage, setMaxStorage] = useState<string>(
    initial.maxStorage?.toString() || ""
  );
  const [sortBy, setSortBy] = useState<AppFilters["sortBy"]>(
    initial.sortBy || "newest"
  );
  const [sortDir, setSortDir] = useState<AppFilters["sortDir"]>(
    initial.sortDir || "desc"
  );

  function apply() {
    const out: AppFilters = {
      q: q.trim() || undefined,
      minCredit: minCredit ? Number(minCredit) : null,
      maxCredit: maxCredit ? Number(maxCredit) : null,
      version: version || undefined,
      platforms: platforms.length ? platforms : undefined,
      internetConnection: internet,
      minStorage: minStorage ? Number(minStorage) : null,
      maxStorage: maxStorage ? Number(maxStorage) : null,
      sortBy,
      sortDir,
    };
    onApply(out);
  }

  function reset() {
    setQ("");
    setMinCredit("");
    setMaxCredit("");
    setVersion("");
    setPlatforms([]);
    setInternet(null);
    setMinStorage("");
    setMaxStorage("");
    setSortBy("newest");
    setSortDir("desc");
    onReset && onReset();
  }

  const platformOptions = [
    { value: "iOS", label: "iOS" },
    { value: "Android", label: "Android" },
    { value: "Windows", label: "Windows" },
    { value: "macOS", label: "macOS" },
    { value: "Linux", label: "Linux" },
  ];

  return (
    <div className="bg-white/10 rounded-xl p-6 mb-8 border border-white/20">
      <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
        <div className="flex-1">
          <label className="text-sm text-white/60">Search</label>
          <input
            aria-label="Search applications"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full mt-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white"
            placeholder="Search by name, description or tag..."
          />
        </div>

        <div className="w-40">
          <label className="text-sm text-white/60">Min Credits</label>
          <input
            value={minCredit}
            onChange={(e) =>
              setMinCredit(e.target.value.replace(/[^0-9]/g, ""))
            }
            className="w-full mt-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white"
            placeholder="0"
          />
        </div>

        <div className="w-40">
          <label className="text-sm text-white/60">Max Credits</label>
          <input
            value={maxCredit}
            onChange={(e) =>
              setMaxCredit(e.target.value.replace(/[^0-9]/g, ""))
            }
            className="w-full mt-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white"
            placeholder="Any"
          />
        </div>

        <div className="w-48">
          <label className="text-sm text-white/60">Version</label>
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full mt-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white"
            placeholder="e.g. 1.2.3"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center justify-center md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex gap-3 justify-center items-end">
          <div className="w-56">
            <MultiSelectDropdown
              label="Platforms"
              options={platformOptions}
              value={platforms}
              onChange={setPlatforms}
            />
          </div>

          {/* <div className="w-44">
            <Dropdown
              label="Internet Required"
              value={internet === null ? undefined : internet ? "yes" : "no"}
              onChange={(v: any) =>
                setInternet(v === "yes" ? true : v === "no" ? false : null)
              }
              placeholder="Any"
              options={[
                { value: undefined, label: "Any" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" } as any,
              ]}
            />
          </div> */}

          {/* <div className="w-40">
            <label className="text-sm text-white/60">Min Storage (MB)</label>
            <input
              value={minStorage}
              onChange={(e) =>
                setMinStorage(e.target.value.replace(/[^0-9]/g, ""))
              }
              className="w-full mt-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white"
              placeholder="0"
            />
          </div> */}

          {/* <div className="w-40">
            <label className="text-sm text-white/60">Max Storage (MB)</label>
            <input
              value={maxStorage}
              onChange={(e) =>
                setMaxStorage(e.target.value.replace(/[^0-9]/g, ""))
              }
              className="w-full mt-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white"
              placeholder="Any"
            />
          </div> */}
        
          <div className="w-44">
            <Dropdown
              value={sortBy}
              onChange={(v: any) => setSortBy((v as any) || "newest")}
              options={[
                { value: "newest", label: "Newest" },
                { value: "price", label: "Price" },
                { value: "name", label: "Name" },
                { value: "version", label: "Version" },
              ]}
            />
          </div>

          <div className="w-28">
            <Dropdown
              value={sortDir}
              onChange={(v: any) => setSortDir((v as any) || "desc")}
              options={[
                { value: "desc", label: "Desc" },
                { value: "asc", label: "Asc" },
              ]}
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={reset}
              className="px-4 py-2 rounded-md bg-white/5 border border-white/10 text-white/80"
            >
              Reset
            </button>
            <button
              onClick={apply}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Apply Filters
            </button>
          </div>
        
        </div>

      </div>
    </div>
  );
}
