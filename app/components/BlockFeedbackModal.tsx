"use client";

import React from "react";
import { RuleHit } from "@/lib/types";

export interface BlockFeedbackModalProps {
  blockHits: RuleHit[];
  onClose: () => void;
}

export function BlockFeedbackModal({
  blockHits,
  onClose,
}: BlockFeedbackModalProps) {
  if (blockHits.length === 0) return null;

  return (
    <div
      data-testid="block-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="block-modal-title"
        data-testid="block-feedback-modal"
        className="w-full max-w-md bg-white rounded-2xl border border-red-200 shadow-xl p-5 md:p-6 flex flex-col gap-4 text-[var(--ink-text)]"
      >
        <div className="flex items-center gap-3 border-b border-red-100 pb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xl shrink-0 font-bold">
            ⚠️
          </div>
          <div>
            <h3
              id="block-modal-title"
              className="font-serif font-bold text-base md:text-lg text-[var(--red-lacquer)]"
            >
              Chưa thể chốt bộ trang phục
            </h3>
            <p className="text-xs text-[var(--ink-muted)]">
              Phát hiện phối hợp chưa đúng quy chuẩn cổ phục
            </p>
          </div>
        </div>

        {/* Violations List */}
        <div className="space-y-2.5">
          {blockHits.map((hit) => (
            <div
              key={hit.ruleId}
              data-testid={`block-rule-${hit.ruleId}`}
              className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs md:text-sm text-red-900 leading-relaxed"
            >
              <div className="font-semibold text-red-950 mb-1">
                Lỗi quy chuẩn:
              </div>
              <p>{hit.message_vi}</p>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            data-testid="btn-close-block-modal"
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[var(--red-lacquer)] text-white font-semibold text-sm hover:opacity-90 shadow-sm transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--red-lacquer)]"
          >
            Quay lại chỉnh sửa trang phục
          </button>
        </div>
      </div>
    </div>
  );
}
