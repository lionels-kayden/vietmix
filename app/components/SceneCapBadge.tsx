"use client";

import React from "react";
import { Scene, Outfit } from "@/lib/types";
import { modernCount, isWithinSceneCap } from "@/lib/remix";

export interface SceneCapBadgeProps {
  scene: Scene;
  outfit: Outfit;
  className?: string;
}

const SCENE_CULTURAL_HINTS: Record<string, string> = {
  tet: "Không gian Tết truyền thống chuộng sự trang nghiêm cổ kính (tối đa 1 món cách tân). Bạn có thể thử đổi sang Quần lụa trắng hoặc Hài vải đen để trọn vẹn phong vị Tết xưa.",
  "le-hoi": "Không khí lễ hội truyền thống tôn vinh nét đẹp nguyên bản (tối đa 1 món cách tân). Bạn có thể chọn Hài thêu hoặc Áo dài truyền thống để hòa nhịp cùng hội làng.",
  "ky-yeu": "Không gian kỷ yếu học đường rất cởi mở, khuyến khích sáng tạo cách tân trẻ trung (tối đa 2 món).",
  "doi-thuong": "Dạo phố đời thường tự do, phóng khoáng, thoải mái kết hợp cổ phục cùng phong cách hiện đại (tối đa 2 món).",
};

export function SceneCapBadge({
  scene,
  outfit,
  className = "",
}: SceneCapBadgeProps) {
  const count = modernCount(outfit);
  const isWithin = isWithinSceneCap(outfit, scene);
  const cap = scene.remix_cap;
  const hint = SCENE_CULTURAL_HINTS[scene.id] || "Không gian này khuyến khích sự cân bằng văn hóa.";

  if (isWithin) {
    return (
      <div
        data-testid="scene-cap-badge"
        data-status="within-cap"
        role="status"
        className={`flex items-start sm:items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-900 text-xs transition-all ${className}`}
      >
        <span className="text-base flex-shrink-0" aria-hidden="true">
          🌿
        </span>
        <div className="flex-1 leading-relaxed">
          <span className="font-semibold">Hòa hợp bối cảnh {scene.name_vi}: </span>
          <span>
            Đang dùng {count}/{cap} món hiện đại. Trang phục trang nhã, đúng tinh thần không gian.
          </span>
        </div>
      </div>
    );
  }

  // When exceeding cap: NON-BINDING cultural suggestion (Never blocks or disables)
  return (
    <div
      data-testid="scene-cap-badge"
      data-status="exceeding-cap"
      role="status"
      className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50/90 text-amber-900 text-xs transition-all ${className}`}
    >
      <span className="text-base flex-shrink-0 mt-0.5" aria-hidden="true">
        💡
      </span>
      <div className="flex-1 space-y-1">
        <div className="font-semibold flex items-center gap-1.5 text-amber-950">
          <span>Gợi ý văn hóa cho bối cảnh {scene.name_vi}</span>
          <span className="text-[10px] font-normal px-1.5 py-0.2 bg-amber-200/80 text-amber-900 rounded-md">
            Khuyên dùng: max {cap} món
          </span>
        </div>
        <p className="text-amber-800 leading-relaxed">{hint}</p>
        <p className="text-[11px] text-amber-700/90 italic">
          * Gợi ý này không bắt buộc. Bạn hoàn toàn có thể tự do giữ nguyên set đồ theo ý thích!
        </p>
      </div>
    </div>
  );
}
