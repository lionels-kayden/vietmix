"use client";

import { useState } from "react";
import Link from "next/link";
import { Gender } from "@/lib/types";

export default function DressUpPage() {
  const [gender, setGender] = useState<Gender | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-cream)] text-[var(--ink-text)]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-cream)]/90 backdrop-blur-md border-b border-[var(--border-paper)] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink-text)] min-h-[44px] min-w-[44px] px-2 py-2 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)]"
            aria-label="Quay lại trang chủ"
          >
            <span aria-hidden="true">←</span>
            <span>Trang chủ</span>
          </Link>
          <h1 className="font-serif text-lg md:text-xl font-bold text-[var(--red-lacquer)] tracking-tight">
            Việt phục Remix
          </h1>
          <div className="w-[80px]" aria-hidden="true" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col items-center justify-center">
        {gender === null ? (
          /* Step 1: Character Selection */
          <section
            aria-labelledby="character-heading"
            className="w-full max-w-md bg-[var(--bg-paper)] border border-[var(--border-paper)] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center gap-6"
          >
            <div className="text-center space-y-2">
              <h2
                id="character-heading"
                className="font-serif text-2xl md:text-3xl font-bold text-[var(--ink-text)]"
              >
                Chọn nhân vật
              </h2>
              <p className="text-sm md:text-base text-[var(--ink-muted)]">
                Chọn nhân vật nam hoặc nữ để bắt đầu phối trang phục.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full pt-2">
              <button
                type="button"
                onClick={() => setGender("male")}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-[var(--border-paper)] bg-white hover:border-[var(--indigo-deep)] hover:shadow-md transition-all min-h-[96px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--indigo-deep)] cursor-pointer"
                aria-label="Chọn nhân vật Nam"
              >
                <div
                  className="w-12 h-12 rounded-full bg-[var(--indigo-deep)]/10 text-[var(--indigo-deep)] flex items-center justify-center font-serif font-bold text-xl"
                  aria-hidden="true"
                >
                  ♂
                </div>
                <span className="font-serif font-semibold text-base md:text-lg text-[var(--ink-text)]">
                  Nam
                </span>
              </button>

              <button
                type="button"
                onClick={() => setGender("female")}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-[var(--border-paper)] bg-white hover:border-[var(--red-lacquer)] hover:shadow-md transition-all min-h-[96px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--red-lacquer)] cursor-pointer"
                aria-label="Chọn nhân vật Nữ"
              >
                <div
                  className="w-12 h-12 rounded-full bg-[var(--red-lacquer)]/10 text-[var(--red-lacquer)] flex items-center justify-center font-serif font-bold text-xl"
                  aria-hidden="true"
                >
                  ♀
                </div>
                <span className="font-serif font-semibold text-base md:text-lg text-[var(--ink-text)]">
                  Nữ
                </span>
              </button>
            </div>
          </section>
        ) : (
          /* Step 2: Dressing shell placeholder (active in T2-T4) */
          <section
            aria-label="Khu vực phối đồ"
            className="w-full flex flex-col items-center gap-4"
          >
            <div className="w-full flex items-center justify-between border-b border-[var(--border-paper)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--ink-muted)]">
                  Nhân vật:
                </span>
                <span className="font-serif font-semibold text-base text-[var(--ink-text)] capitalize">
                  {gender === "male" ? "Nam" : "Nữ"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setGender(null)}
                className="min-h-[44px] px-3 py-2 text-sm font-medium text-[var(--indigo-deep)] hover:text-[var(--red-lacquer)] underline underline-offset-4 transition-colors"
                aria-label="Đổi nhân vật khác"
              >
                Đổi nhân vật
              </button>
            </div>

            <div
              data-testid="dressing-area"
              className="w-full bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-paper)] p-6 text-center text-[var(--ink-muted)]"
            >
              Khu vực phối đồ đang được chuẩn bị
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
