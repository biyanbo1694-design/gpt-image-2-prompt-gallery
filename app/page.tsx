import { CategoryPills } from "@/components/category-pills";
import { Hero } from "@/components/hero";
import { PromptGrid } from "@/components/prompt-grid";
import { SectionHeader } from "@/components/section-header";
import { getAllCategories, getFeaturedPrompts, getLatestPrompts, getStats } from "@/lib/data";

export default function HomePage() {
  const categories = getAllCategories();
  const featuredPrompts = getFeaturedPrompts(8);
  const latestPrompts = getLatestPrompts(4);
  const stats = getStats();

  return (
    <div className="pb-20 pt-24">
      <Hero stats={stats} prompts={featuredPrompts.slice(0, 4)} />

      <section className="container-shell mt-12">
        <SectionHeader
          eyebrow="Browse"
          title="Start by format, mood, or use case."
          description="Jump into a category and find prompts worth copying."
        />
        <CategoryPills categories={categories} />
      </section>

      <section className="container-shell mt-20">
        <SectionHeader
          eyebrow="Featured"
          title="High-signal prompt cases."
          description="Popular public examples pulled from the synced upstream data."
          href="/prompts"
          action="View All"
        />
        <PromptGrid prompts={featuredPrompts} />
      </section>

      <section className="container-shell mt-20">
        <SectionHeader
          eyebrow="Latest"
          title="Fresh cases from upstream sync."
          description="New public cases appear here after each sync."
        />
        <PromptGrid prompts={latestPrompts} compact />
      </section>
    </div>
  );
}
