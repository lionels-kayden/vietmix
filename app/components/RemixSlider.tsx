"use client";

import React, { useState } from "react";
import { Outfit, Scene } from "@/lib/types";
import { modernCount, remixLevel, sceneCapLevel } from "@/lib/remix";

export interface RemixSliderProps {
  outfit: Outfit;
  scene?: Scene;
  className?: string;
}

export interface StepInfo {
  level: number;
  label: string;
  sublabel: string;
  description: string;
  tag: string;
}

const STEPS: StepInfo[] = [
  {
    level: 0,
    label: "Cổ điển",
    sublabel: "0 món hiện đại",
    description: "100% cổ phục truyền thống. Giữ trọn cốt cách, phom dáng và quy chuẩn trang nghiêm của người xưa.",
    tag: "Thuần cổ phong",
  },
  {
    level: 1,
    label: "Cách tân nhẹ",
    sublabel: "1 món hiện đại",
    description: "Điểm xuyết một chi tiết đương đại (như Quần âu hoặc Giày sneaker) kết hợp hài hòa cùng áo cổ truyền.",
    tag: "Giao thoa thanh lịch",
  },
  {
    level: 2,
    label: "Đột phá",
    sublabel: "2+ món hiện đại",
    description: "Phối hợp phóng khoáng giữa nhiều món đồ hiện đại và áo truyền thống. Phong cách đậm chất Gen Z trẻ trung.",
    tag: "Remix sáng tạo",
  },
];

export function RemixSlider({
  outfit,
  scene,
  className = "",
}: RemixSliderProps) {
  const count = modernCount(outfit);
  const currentLevel = remixLevel(outfit);
  const cap = scene ? sceneCapLevel(scene) : 2;

  // Active step info popup/inspector
  const [inspectedStep, setInspectedStep] = useState<number | null>(null);

  const activeStepInfo = STEPS[currentLevel];
  const displayedInfo = inspectedStep !== null ? STEPS[inspectedStep] : activeStepInfo;

  return (
    <section
      data-testid="remix-slider"
      aria-label="Thước đo cấp độ Remix trang phục"
      className={`w-full bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-paper)] p-4 shadow-sm flex flex-col gap-3.5 ${className}`}
    >
      {/* Header with Title and Current Level Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">
            ⚡
          </span>
          <h3 className="font-serif font-semibold text-sm md:text-base text-[var(--ink-text)]">
            Cấp độ Remix
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            data-testid="remix-count-badge"
            className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-[var(--bg-cream)] border border-[var(--border-paper)] text-[var(--ink-muted)]"
          >
            {count} món hiện đại
          </span>
          <span
            data-testid="remix-level-badge"
            className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[var(--indigo-deep)] text-white"
          >
            Mốc {currentLevel}: {activeStepInfo.label}
          </span>
        </div>
      </div>

      {/* Visual Slider Meter */}
      <div
        role="meter"
        aria-label="Cấp độ phối đồ Remix"
        aria-valuenow={currentLevel}
        aria-valuemin={0}
        aria-valuemax={2}
        aria-valuetext={`Mốc ${currentLevel}: ${activeStepInfo.label}`}
        className="relative pt-2 pb-1"
      >
        {/* Track Background */}
        <div className="relative h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
          {/* Active Fill Track */}
          <div
            data-testid="remix-slider-track"
            className="h-full bg-gradient-to-r from-amber-600 via-[var(--red-lacquer)] to-[var(--indigo-deep)] transition-all duration-300 rounded-full"
            style={{ width: `${(currentLevel / 2) * 100}%` }}
          />
        </div>

        {/* 3 Step Nodes */}
        <div className="relative -mt-3.5 flex justify-between items-center w-full px-0">
          {STEPS.map((step) => {
            const isCurrent = step.level === currentLevel;
            const isReached = step.level <= currentLevel;
            const isCap = scene && step.level === cap;

            return (
              <button
                key={step.level}
                type="button"
                data-testid={`remix-step-${step.level}`}
                onClick={() => setInspectedStep(inspectedStep === step.level ? null : step.level)}
                aria-label={`Mốc ${step.level}: ${step.label} (${step.sublabel})`}
                className="flex flex-col items-center group cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--red-lacquer)]"
              >
                {/* Node Circle */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                    isCurrent
                      ? "bg-[var(--red-lacquer)] border-white shadow-md scale-125 ring-2 ring-[var(--red-lacquer)]/40"
                      : isReached
                      ? "bg-[var(--indigo-deep)] border-white shadow-sm"
                      : "bg-white border-zinc-300 group-hover:border-zinc-400"
                  }`}
                >
                  <span
                    className={`text-[9px] font-bold ${
                      isCurrent || isReached ? "text-white" : "text-zinc-500"
                    }`}
                  >
                    {step.level}
                  </span>
                </div>

                {/* Node Label */}
                <span
                  className={`text-[11px] md:text-xs mt-1.5 font-medium transition-colors ${
                    isCurrent
                      ? "text-[var(--red-lacquer)] font-bold"
                      : "text-[var(--ink-muted)] group-hover:text-[var(--ink-text)]"
                  }`}
                >
                  {step.label}
                </span>

                {/* Cap Tag if this step is the scene cap */}
                {isCap && (
                  <span
                    data-testid={`scene-cap-marker-${step.level}`}
                    className="text-[9px] font-semibold px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 mt-0.5"
                    title={`Giới hạn bối cảnh: ${scene?.name_vi}`}
                  >
                    Cap cảnh
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanatory Detail Card */}
      <div
        data-testid="remix-description-card"
        className="bg-[var(--bg-cream)]/70 rounded-xl p-3 border border-[var(--border-paper)] text-xs text-[var(--ink-text)] flex items-start justify-between gap-3"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--red-lacquer)]">
              Mốc {displayedInfo.level}: {displayedInfo.label}
            </span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[var(--border-paper)] text-[var(--ink-muted)]">
              {displayedInfo.tag}
            </span>
          </div>
          <p className="text-[var(--ink-muted)] leading-relaxed">
            {displayedInfo.description}
          </p>
        </div>
        {inspectedStep !== null && (
          <button
            type="button"
            onClick={() => setInspectedStep(null)}
            className="text-[11px] text-[var(--ink-muted)] hover:text-[var(--ink-text)] underline shrink-0 min-h-[36px] flex items-center"
            aria-label="Đóng xem chi tiết"
          >
            Đóng
          </button>
        )}
      </div>
    </section>
  );
}
