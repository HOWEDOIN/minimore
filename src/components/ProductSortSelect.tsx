"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import React from "react";

export default function ProductSortSelect({ hidePrices = true }: { hidePrices?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "featured";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <select
      className="sort-select"
      value={currentSort}
      onChange={handleSortChange}
      aria-label="Sort products"
    >
      <option value="featured">Sort by: Featured</option>
      {!hidePrices && <option value="price-low-high">Price: Low to High</option>}
      {!hidePrices && <option value="price-high-low">Price: High to Low</option>}
      <option value="newest">Newest Arrivals</option>
    </select>
  );
}
