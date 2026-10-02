import fs from "fs";
import path from "path";

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
    <main className="min-h-screen p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Việt phục Remix</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Trạng thái: {itemsCount} items | {scenesCount} scenes | {rulesCount} rules
      </p>
    </main>
  );
}
