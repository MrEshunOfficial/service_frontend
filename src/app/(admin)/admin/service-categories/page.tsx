import React from "react";
import Link from "next/link";
import CategoryList from "@/components/services/categories/CategoryListPage";

export default function CategoryPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <a href="/admin" className="hover:text-foreground transition-colors">
            Admin
          </a>
          <span>/</span>
          <Link
            href="/admin/services"
            className="hover:text-foreground transition-colors">
            Services
          </Link>
          <span>/</span>
          <span className="hover:text-foreground transition-colors cursor-alias">
            Category List
          </span>
        </nav>
      </div>
      <main className="h-full w-full">
        <CategoryList
          context="admin"
          showSearch={true}
          includeInactive={true}
          defaultFilter="all"
        />
      </main>
    </div>
  );
}
