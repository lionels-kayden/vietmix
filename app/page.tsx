import fs from "fs";
import path from "path";
import Link from "next/link";

export function loadData() {
  const dataDir = path.join(process.cwd(), "data");

  const readJson = (filename: string) => {
    const fullPath = path.join(dataDir, filename);
    const content = fs.readFileSync(fullPath, "utf-8");
    return JSON.parse(content);
  };

  const items = readJson("items.json");
  const stories = readJson("stories.json");
  const rules = readJson("rules.json");
  const anchors = readJson("anchors.json");
  const fit = readJson("fit.json");
  const fit_defaults = readJson("fit_defaults.json");
  const manifest = readJson("manifest.json");
  const scenes = readJson("scenes.json");

  return {
    items,
    stories,
    rules,
    anchors,
    fit,
    fit_defaults,
    manifest,
    scenes,
  };
}

export default function Home() {
  const data = loadData();

  const itemsCount = Array.isArray(data.items) ? data.items.length : 0;
  const scenesCount = Array.isArray(data.scenes) ? data.scenes.length : 0;
  const rulesCount = Array.isArray(data.rules) ? data.rules.length : 0;

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto flex flex-col gap-6 items-start justify-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-serif font-bold tracking-tight text-[var(--red-lacquer)]">
          Việt phục Remix
        </h1>
        <p className="text-base text-[var(--ink-muted)] max-w-md">
          Khám phá và sáng tạo phối trang phục truyền thống Việt Nam cùng phong cách hiện đại.
        </p>
      </div>

      <p className="text-sm text-[var(--ink-muted)] bg-[var(--bg-paper)] px-3 py-1.5 rounded-md border border-[var(--border-paper)]">
        Trạng thái: {itemsCount} items | {scenesCount} scenes | {rulesCount} rules
      </p>

      <div className="pt-2">
        <Link
          href="/dress-up"
          className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 text-base font-semibold text-white bg-[var(--red-lacquer)] hover:bg-[var(--red-lacquer-hover)] rounded-xl shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--red-lacquer)]"
        >
          Bắt đầu phối đồ
        </Link>
      </div>
    </main>
  );
}
