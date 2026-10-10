"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error in development
    console.error("Vietmix Application Error:", error);
  }, [error]);

  return (
    <main
      data-testid="error-fallback"
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-cream)] text-[var(--ink-text)]"
    >
      <div className="max-w-md w-full bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-2xl p-6 shadow-md space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-3xl">
          ⚠️
        </div>

        <h1 className="font-serif font-bold text-xl text-[var(--red-lacquer)]">
          Đã có sự cố gián đoạn
        </h1>

        <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
          Ứng dụng gặp lỗi không mong muốn khi tải trang phục hoặc xử lý thao tác. Bạn có thể thử tải lại hoặc quay về trang chủ.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[var(--red-lacquer)] text-white font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)]"
          >
            Thử lại
          </button>

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
