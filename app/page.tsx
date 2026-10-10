import fs from "fs";
import path from "path";
import Link from "next/link";
import { CharacterCanvas } from "./components/CharacterCanvas";

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

  const collections = [
    {
      title: "Áo Ngũ Thân",
      dynasty: "Thời Nguyễn (Thế kỷ 18 - 19)",
      desc: "Năm vạt tượng trưng cho tứ thân phụ mẫu và bản thân; năm hạt cúc là ngũ thường (Nhân, Lễ, Nghĩa, Trí, Tín). Chuẩn mực thanh lịch và kín đáo.",
      image: "/assets/female/F_A_TOP_ao_ngu_than.png",
      tag: "Di sản Nho nhã",
    },
    {
      title: "Áo Giao Lĩnh",
      dynasty: "Thời Lê - Trịnh (Thế kỷ 15 - 18)",
      desc: "Cổ áo vạt chéo khoáng đạt, vạt buông suông hoặc thắt nơ eo duyên dáng. Biểu tượng của vẻ đẹp cổ kính ngàn năm văn hiến.",
      image: "/assets/female/F_B_TOP_ao_giao_linh.png",
      tag: "Cổ phong Đại Việt",
    },
    {
      title: "Áo Nhật Bình & Áo Tấc",
      dynasty: "Lễ phục Cung đình Huế",
      desc: "Áo Nhật Bình viền cổ ngũ sắc của bậc hoàng thân nữ giới, Áo Tấc tay thụng trang trọng cho nam nhân trong dịp đại lễ.",
      image: "/assets/female/F_C_TOP_ao_nhat_binh.png",
      tag: "Vương giả Cung đình",
    },
    {
      title: "Phong Cách Remix Gen Z",
      dynasty: "Đương đại đương thời",
      desc: "Kết hợp áo ngũ thân, giao lĩnh cùng quần âu ống suông hiện đại và giày sneaker năng động. Giao thoa giữa bản sắc và hơi thở trẻ trung.",
      image: "/assets/female/F_MIX_SHOES_giay_sneaker.png",
      tag: "Sáng tạo Phá cách",
    },
  ];

  const historicalScenes = [
    {
      id: "tet",
      name: "Tết Hoàng Cung",
      desc: "Không khí lễ hội đầu năm chốn hoàng thành nguy nga rực rỡ hoa mai đào.",
      image: "/assets/scenes/tet.jpg",
    },
    {
      id: "ky-yeu",
      name: "Kỷ Yếu Học Đường",
      desc: "Góc sân trường cổ kính lưu dấu kỷ niệm thanh xuân của học sinh, sinh viên.",
      image: "/assets/scenes/ky-yeu.jpg",
    },
    {
      id: "le-hoi",
      name: "Lễ Hội Dân Gian",
      desc: "Sân đình làng rộn rã cờ hội, tiếng trống hội xuân và sắc màu truyền thống.",
      image: "/assets/scenes/le-hoi.jpg",
    },
    {
      id: "doi-thuong",
      name: "Dạo Phố Hội An",
      desc: "Phố cổ trầm mặc bên dòng sông Hoài với lồng đèn ấm áp và tường vàng cổ kính.",
      image: "/assets/scenes/doi-thuong.jpg",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-cream)] text-[var(--ink-text)] selection:bg-[var(--red-lacquer)] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg-cream)]/90 backdrop-blur-md border-b border-[var(--border-paper)] px-4 md:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">👘</span>
            <span className="font-serif text-xl md:text-2xl font-bold text-[var(--red-lacquer)] tracking-tight">
              Việt phục Remix
            </span>
          </div>

          <nav className="flex items-center gap-3 md:gap-6">
            <a
              href="#bo-suu-tap"
              className="text-xs md:text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink-text)] transition-colors hidden sm:inline"
            >
              Bộ sưu tập
            </a>
            <a
              href="#boi-canh"
              className="text-xs md:text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink-text)] transition-colors hidden sm:inline"
            >
              Không gian
            </a>
            <Link
              href="/dress-up"
              className="inline-flex items-center justify-center min-h-[42px] px-5 py-2 text-xs md:text-sm font-semibold text-white bg-[var(--red-lacquer)] hover:bg-[var(--red-lacquer-hover)] rounded-xl shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)]"
            >
              <span>Thử đồ ngay</span>
              <span className="ml-1" aria-hidden="true">→</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 px-4 md:px-8 border-b border-[var(--border-paper)] bg-gradient-to-b from-[var(--bg-paper)]/60 to-[var(--bg-cream)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs font-semibold text-[var(--red-lacquer)]">
              <span>✨</span>
              <span>Dự án khám phá & bảo tồn di sản cổ phục Việt Nam</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[var(--red-lacquer)] leading-tight">
              Việt phục Remix
            </h1>

            <p className="text-base md:text-lg text-[var(--ink-text)]/80 max-w-xl leading-relaxed">
              Khám phá và sáng tạo phối trang phục truyền thống Việt Nam cùng phong cách hiện đại.
              Tìm hiểu câu chuyện ngàn năm qua lăng kính sáng tạo đương đại của thế hệ trẻ.
            </p>

            {/* Status Line for data check */}
            <p className="text-xs md:text-sm text-[var(--ink-muted)] bg-white/80 px-3.5 py-2 rounded-xl border border-[var(--border-paper)] shadow-xs">
              Trạng thái: {itemsCount} items | {scenesCount} scenes | {rulesCount} rules
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/dress-up"
                className="inline-flex items-center justify-center min-h-[50px] px-7 py-3 text-base font-semibold text-white bg-[var(--red-lacquer)] hover:bg-[var(--red-lacquer-hover)] rounded-xl shadow-md transition-all hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--red-lacquer)]"
              >
                <span>Bắt đầu phối đồ</span>
                <span className="ml-2 font-bold" aria-hidden="true">→</span>
              </Link>

              <a
                href="#bo-suu-tap"
                className="inline-flex items-center justify-center min-h-[50px] px-6 py-3 text-base font-semibold text-[var(--ink-text)] bg-white border border-[var(--border-paper)] hover:border-[var(--indigo-deep)] rounded-xl shadow-xs transition-colors"
              >
                Tìm hiểu di sản
              </a>
            </div>
          </div>

          {/* Hero Right Visuals */}
          <div className="lg:col-span-5 flex items-center justify-center gap-4 relative">
            {/* Visual Frame 1: Female Giao Linh */}
            <div className="relative w-44 md:w-56 aspect-[9/16] bg-white rounded-2xl border-2 border-[var(--border-paper)] shadow-xl overflow-hidden p-1.5 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <CharacterCanvas
                gender="female"
                itemIds={[
                  "F_B_TOP_ao_giao_linh",
                  "F_B_BOTTOM_vay_dai",
                  "F_COMMON_SHOES_giay_vai_den",
                ]}
                sceneId="tet"
                className="w-full h-full border-0 shadow-none rounded-xl"
              />
              <div className="absolute bottom-3 left-3 right-3 z-30 bg-black/65 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white text-xs font-semibold text-center shadow-md">
                Áo Giao Lĩnh & Váy Đen
              </div>
            </div>

            {/* Visual Frame 2: Male Ngu Than */}
            <div className="relative w-44 md:w-56 aspect-[9/16] bg-white rounded-2xl border-2 border-[var(--border-paper)] shadow-xl overflow-hidden p-1.5 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <CharacterCanvas
                gender="male"
                itemIds={[
                  "M_A_TOP_ao_ngu_than",
                  "M_MIX_BOTTOM_quan_hien_dai",
                  "M_MIX_SHOES_giay_sneaker",
                ]}
                sceneId="ky-yeu"
                className="w-full h-full border-0 shadow-none rounded-xl"
              />
              <div className="absolute bottom-3 left-3 right-3 z-30 bg-black/65 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white text-xs font-semibold text-center shadow-md">
                RX-01 Ngũ Thân Hiện Đại
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars: 3 Steps */}
      <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[var(--border-paper)] shadow-sm flex flex-col gap-3">
            <span className="text-3xl" aria-hidden="true">🎨</span>
            <h3 className="font-serif font-bold text-lg text-[var(--red-lacquer)]">
              1. Thử Đồ Tự Do
            </h3>
            <p className="text-xs md:text-sm text-[var(--ink-muted)] leading-relaxed">
              Trực tiếp thay áo, quần/váy, giày và nón lá trên cả hai nhân vật Nam và Nữ với 18 món phục chế chuẩn xác.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[var(--border-paper)] shadow-sm flex flex-col gap-3">
            <span className="text-3xl" aria-hidden="true">📜</span>
            <h3 className="font-serif font-bold text-lg text-[var(--indigo-deep)]">
              2. Đánh Giá Văn Hóa
            </h3>
            <p className="text-xs md:text-sm text-[var(--ink-muted)] leading-relaxed">
              Hệ thống tự động chấm điểm hòa hợp, đưa ra lời bình chi tiết theo từng bối cảnh và thẻ tư liệu lịch sử lật 3D.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[var(--border-paper)] shadow-sm flex flex-col gap-3">
            <span className="text-3xl" aria-hidden="true">📲</span>
            <h3 className="font-serif font-bold text-lg text-emerald-800">
              3. Lookbook & Quét Mã QR
            </h3>
            <p className="text-xs md:text-sm text-[var(--ink-muted)] leading-relaxed">
              Xuất bưu thiếp thời trang 1080x1350 độ nét cao, in kèm mã QR để bạn bè quét camera là mở ngay bộ đồ của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* Collections Showcase */}
      <section id="bo-suu-tap" className="py-12 md:py-16 px-4 md:px-8 border-t border-[var(--border-paper)] bg-[var(--bg-paper)]/40">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[var(--red-lacquer)] uppercase tracking-wider">
              Kho Tàng Cổ Phục
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-bold text-[var(--ink-text)]">
              Bốn Dòng Trang Phục Tiêu Biểu
            </h2>
            <p className="text-sm text-[var(--ink-muted)] max-w-2xl">
              Mỗi mẫu áo là một lát cắt lịch sử mang đậm mỹ cảm, tôn ti trật tự và nhân sinh quan của tiền nhân.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((c, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[var(--border-paper)] shadow-sm overflow-hidden flex flex-col hover:border-[var(--red-lacquer)] transition-colors group"
              >
                <div className="h-44 bg-[var(--bg-paper)] p-4 flex items-center justify-center overflow-hidden border-b border-[var(--border-paper)]">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <span className="text-xs font-semibold text-[var(--red-lacquer)]">
                    {c.tag}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[var(--ink-text)]">
                    {c.title}
                  </h3>
                  <span className="text-xs text-[var(--indigo-deep)] font-medium">
                    {c.dynasty}
                  </span>
                  <p className="text-xs text-[var(--ink-muted)] mt-1 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Historical Scenes Showcase */}
      <section id="boi-canh" className="py-12 md:py-16 px-4 md:px-8 border-t border-[var(--border-paper)]">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[var(--indigo-deep)] uppercase tracking-wider">
              Không Gian Văn Hóa
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-bold text-[var(--ink-text)]">
              Bốn Bối Cảnh Lịch Sử Sống Động
            </h2>
            <p className="text-sm text-[var(--ink-muted)] max-w-2xl">
              Từ chốn cung đình trang nghiêm đến phố cổ rêu phong, trang phục tỏa sáng hài hòa trong từng bối cảnh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {historicalScenes.map((s) => (
              <div
                key={s.id}
                className="relative rounded-2xl overflow-hidden border border-[var(--border-paper)] aspect-[4/5] shadow-sm group"
              >
                <img
                  src={s.image}
                  alt={s.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                  <h3 className="font-serif font-bold text-lg">{s.name}</h3>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed line-clamp-3">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA Card */}
          <div className="mt-8 bg-gradient-to-r from-[var(--red-lacquer)] to-amber-900 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <h3 className="font-serif text-2xl md:text-3xl font-bold">
                Sẵn sàng khám phá nét duyên Việt phục?
              </h3>
              <p className="text-sm md:text-base text-amber-100 max-w-xl">
                Tự do sáng tạo, lưu giữ những tấm bưu thiếp thời trang độc đáo và lan tỏa vẻ đẹp cổ phục đến cộng đồng.
              </p>
            </div>

            <Link
              href="/dress-up"
              className="shrink-0 inline-flex items-center justify-center min-h-[50px] px-8 py-3 bg-white text-[var(--red-lacquer)] font-bold text-base rounded-xl shadow-lg hover:bg-amber-50 hover:scale-105 transition-all"
            >
              <span>Vào phòng thử đồ</span>
              <span className="ml-2 font-bold" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--border-paper)] bg-[var(--bg-paper)] px-4 md:px-8 py-8 text-center text-xs text-[var(--ink-muted)]">
        <div className="max-w-6xl mx-auto flex flex-col gap-3 items-center">
          <p className="font-serif font-bold text-sm text-[var(--red-lacquer)]">
            Việt phục Remix • Phục Hưng Bản Sắc Dân Tộc
          </p>
          <p className="max-w-md leading-relaxed">
            Dự án giáo dục và lan tỏa văn hóa phi lợi nhuận dành cho giới trẻ và cộng đồng yêu mến cổ phục Việt Nam.
          </p>
          <p className="text-[11px] text-zinc-400 mt-2">
            © 2026 Việt phục Remix. Bản quyền thuộc về những người yêu di sản văn hóa Việt Nam.
          </p>
        </div>
      </footer>
    </div>
  );
}
