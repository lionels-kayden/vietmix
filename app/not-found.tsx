import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      data-testid="not-found-page"
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-cream)] text-[var(--ink-text)]"
    >
      <div className="max-w-md w-full bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-2xl p-6 md:p-8 shadow-md space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-3xl">
          🏮
        </div>

        <h1 className="font-serif font-bold text-2xl text-[var(--red-lacquer)]">
          404 - Không tìm thấy trang
        </h1>

        <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
          Đường dẫn bạn yêu cầu không tồn tại hoặc đã được gỡ bỏ khỏi bộ sưu tập Việt phục.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-3">
          <Link
            href="/dress-up"
            className="flex-1 min-h-[44px] flex items-center justify-center px-4 py-2.5 rounded-xl bg-[var(--red-lacquer)] text-white font-semibold text-sm hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)]"
          >
            Vào phòng phối đồ
          </Link>

          <Link
            href="/"
            className="flex-1 min-h-[44px] flex items-center justify-center px-4 py-2.5 rounded-xl border border-[var(--border-paper)] bg-white text-[var(--ink-text)] font-semibold text-sm hover:border-[var(--indigo-deep)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--indigo-deep)]"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
