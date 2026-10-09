"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Gender, Item, Slot } from "@/lib/types";
import { itemsByGender, getItem, loadAll } from "@/lib/data";
import { CharacterCanvas } from "@/app/components/CharacterCanvas";
import { FitEntry, DEFAULT_FIT_ENTRY, isValidFitEntry, getFitEntry } from "@/lib/fit";
import initialFitJson from "@/data/fit.json";

const SLOTS: { slot: Slot; label: string }[] = [
  { slot: "top", label: "Áo" },
  { slot: "bottom", label: "Quần / Váy" },
  { slot: "shoes", label: "Giày" },
  { slot: "neck", label: "Vòng cổ" },
  { slot: "head", label: "Mũ / Trâm" },
];

export function FitClient() {
  // Ensure data collections are loaded
  useEffect(() => {
    loadAll();
  }, []);

  const [gender, setGender] = useState<Gender>("male");
  const [equippedItemIds, setEquippedItemIds] = useState<string[]>([]);
  const [activeItemId, setActiveItemId] = useState<string>("");
  const [fitData, setFitData] = useState<Record<string, FitEntry>>(() => {
    const initial: Record<string, FitEntry> = {};
    if (initialFitJson && typeof initialFitJson === "object") {
      for (const [key, val] of Object.entries(initialFitJson)) {
        if (isValidFitEntry(val)) {
          initial[key] = { x: val.x, y: val.y, scale: val.scale };
        }
      }
    }
    return initial;
  });

  const [showGuidelines, setShowGuidelines] = useState(true);
  const [copyStatus, setCopyStatus] = useState<string>("");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importInput, setImportInput] = useState("");
  const [importError, setImportError] = useState("");

  const currentGenderItems = useMemo(() => itemsByGender(gender), [gender]);

  // When gender switches, reset equipped items and pick default active item
  useEffect(() => {
    const items = itemsByGender(gender);
    if (items.length > 0) {
      setActiveItemId(items[0].id);
      setEquippedItemIds([items[0].id]);
    } else {
      setActiveItemId("");
      setEquippedItemIds([]);
    }
  }, [gender]);

  const activeItem = useMemo(() => {
    return getItem(activeItemId);
  }, [activeItemId]);

  const activeFit = useMemo<FitEntry>(() => {
    if (!activeItemId) return DEFAULT_FIT_ENTRY;
    return getFitEntry(activeItemId, fitData);
  }, [activeItemId, fitData]);

  // Toggle equipping an item
  const handleToggleEquip = (item: Item) => {
    setEquippedItemIds((prev) => {
      const isEquipped = prev.includes(item.id);
      if (isEquipped) {
        return prev.filter((id) => id !== item.id);
      } else {
        // Replace existing item in same slot
        const filtered = prev.filter((id) => {
          const it = getItem(id);
          return it?.slot !== item.slot;
        });
        return [...filtered, item.id];
      }
    });
    setActiveItemId(item.id);
  };

  // Update offset / scale for active item
  const updateActiveFit = (updates: Partial<FitEntry>) => {
    if (!activeItemId) return;
    setFitData((prev) => {
      const current = prev[activeItemId] || DEFAULT_FIT_ENTRY;
      return {
        ...prev,
        [activeItemId]: {
          ...current,
          ...updates,
        },
      };
    });
  };

  // Reset active item to defaults
  const handleResetActiveFit = () => {
    if (!activeItemId) return;
    setFitData((prev) => {
      const next = { ...prev };
      delete next[activeItemId];
      return next;
    });
  };

  // Export JSON file
  const handleExportJson = () => {
    const jsonString = JSON.stringify(fitData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fit.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy JSON to clipboard
  const handleCopyJson = async () => {
    try {
      const jsonString = JSON.stringify(fitData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopyStatus("Đã sao chép vào clipboard!");
      setTimeout(() => setCopyStatus(""), 3000);
    } catch {
      setCopyStatus("Không thể truy cập clipboard.");
      setTimeout(() => setCopyStatus(""), 3000);
    }
  };

  // Import JSON handler
  const handleApplyImport = () => {
    setImportError("");
    try {
      const parsed = JSON.parse(importInput);
      if (!parsed || typeof parsed !== "object") {
        setImportError("Dữ liệu JSON không đúng định dạng đối tượng.");
        return;
      }
      const importedRecord: Record<string, FitEntry> = {};
      let validCount = 0;
      for (const [key, val] of Object.entries(parsed)) {
        if (isValidFitEntry(val)) {
          importedRecord[key] = { x: val.x, y: val.y, scale: val.scale };
          validCount++;
        }
      }
      setFitData((prev) => ({ ...prev, ...importedRecord }));
      setImportModalOpen(false);
      setImportInput("");
      setCopyStatus(`Đã nạp thành công ${validCount} mục tọa độ!`);
      setTimeout(() => setCopyStatus(""), 3000);
    } catch (e: unknown) {
      setImportError(`Lỗi phân tích JSON: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] text-[var(--ink-text)] p-4 md:p-8">
      {/* Header bar */}
      <header className="max-w-6xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-paper)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[var(--red-lacquer)]">
              Công Cụ Căn Chỉnh Trang Phục (Fit Tool)
            </h1>
            <span
              data-testid="fit-internal-badge"
              className="text-xs bg-amber-100 text-amber-800 border border-amber-300 font-semibold px-2 py-0.5 rounded-full"
            >
              🔒 Nội bộ (ENABLE_FIT=1)
            </span>
          </div>
          <p className="text-xs text-[var(--ink-muted)] mt-1">
            Điều chỉnh độ dịch (X, Y) và tỷ lệ (Scale) trực tiếp trên canvas 1080×1920.
          </p>
        </div>

        {/* Action buttons: Export / Import */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-[var(--border-paper)] rounded-lg shadow-sm hover:bg-zinc-50 transition"
          >
            📥 Nạp fit.json
          </button>
          <button
            onClick={handleCopyJson}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-[var(--border-paper)] rounded-lg shadow-sm hover:bg-zinc-50 transition"
          >
            📋 Sao chép JSON
          </button>
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 text-xs font-semibold bg-[var(--indigo-deep)] text-white rounded-lg shadow-sm hover:bg-[var(--indigo-deep-hover)] transition"
          >
            💾 Xuất fit.json
          </button>
        </div>
      </header>

      {/* Copy notification */}
      {copyStatus && (
        <div className="max-w-6xl mx-auto mb-4 p-2.5 text-xs bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center justify-between">
          <span>{copyStatus}</span>
          <button onClick={() => setCopyStatus("")} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Main Workspace Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Character Canvas (5 cols) */}
        <section className="lg:col-span-5 flex flex-col items-center">
          {/* Gender and Overlay controls */}
          <div className="w-full flex items-center justify-between mb-3 px-1">
            <div className="flex gap-2" role="group" aria-label="Chọn giới tính">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition ${
                  gender === "male"
                    ? "bg-[var(--indigo-deep)] text-white border-[var(--indigo-deep)]"
                    : "bg-white text-[var(--ink-text)] border-[var(--border-paper)]"
                }`}
              >
                Nhân vật Nam
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition ${
                  gender === "female"
                    ? "bg-[var(--red-lacquer)] text-white border-[var(--red-lacquer)]"
                    : "bg-white text-[var(--ink-text)] border-[var(--border-paper)]"
                }`}
              >
                Nhân vật Nữ
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowGuidelines(!showGuidelines)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                showGuidelines ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white border-zinc-200 text-zinc-600"
              }`}
            >
              📐 {showGuidelines ? "Ẩn đường gióng" : "Bật đường gióng"}
            </button>
          </div>

          {/* Interactive Character Canvas wrapper */}
          <div className="relative w-full max-w-[380px] flex justify-center">
            <CharacterCanvas
              gender={gender}
              itemIds={equippedItemIds}
              fitData={fitData}
              className="w-full shadow-lg"
            />

            {/* Visual Guidelines Overlay */}
            {showGuidelines && (
              <div
                data-testid="fit-guidelines-overlay"
                className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl overflow-hidden"
              >
                {/* Center vertical axis (X = 50%) */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-red-400/60 border-r border-dashed border-red-500/80" />
                {/* Neck reference (Y = 22%) */}
                <div className="absolute left-0 right-0 top-[22%] h-px bg-blue-400/50 border-b border-dashed border-blue-500/70" />
                {/* Waist reference (Y = 48%) */}
                <div className="absolute left-0 right-0 top-[48%] h-px bg-amber-500/50 border-b border-dashed border-amber-500/70" />
                {/* Ankle reference (Y = 88%) */}
                <div className="absolute left-0 right-0 top-[88%] h-px bg-emerald-500/50 border-b border-dashed border-emerald-500/70" />
              </div>
            )}
          </div>

          <p className="text-[11px] text-[var(--ink-muted)] text-center mt-3">
            Đang hiển thị {equippedItemIds.length} món trên canvas. Bấm vào món bên phải để thử hoặc căn chỉnh.
          </p>
        </section>

        {/* Right Column: Wardrobe Item Picker & Fit Adjuster (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          {/* Active Item Slider Controls */}
          {activeItem ? (
            <div
              data-testid="fit-control-panel"
              className="bg-white rounded-xl border border-[var(--border-paper)] p-5 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--red-lacquer)]">
                    Đang điều chỉnh
                  </span>
                  <h2 className="text-lg font-serif font-bold text-[var(--ink-text)]">
                    {activeItem.name_vi}
                  </h2>
                  <span className="text-xs text-[var(--ink-muted)] font-mono">
                    ID: {activeItem.id} ({activeItem.slot})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResetActiveFit}
                  className="px-2.5 py-1 text-xs text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded font-semibold transition"
                  title="Đặt lại về tọa độ 0, 0 và scale 1.0"
                >
                  ↺ Đặt lại
                </button>
              </div>

              {/* Sliders Grid */}
              <div className="space-y-4">
                {/* X Slider & Input */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <label htmlFor="fit-x-input">Trục X (Ngang, px):</label>
                    <input
                      id="fit-x-input"
                      data-testid="fit-x-number-input"
                      aria-label="Nhập giá trị trục X"
                      type="number"
                      value={activeFit.x}
                      onChange={(e) => updateActiveFit({ x: parseFloat(e.target.value) || 0 })}
                      className="w-20 px-2 py-0.5 text-right font-mono text-xs border rounded bg-zinc-50"
                    />
                  </div>
                  <input
                    id="fit-x-slider"
                    data-testid="fit-x-slider-input"
                    aria-label="Thanh trượt trục X"
                    type="range"
                    min={-300}
                    max={300}
                    step={1}
                    value={activeFit.x}
                    onChange={(e) => updateActiveFit({ x: parseFloat(e.target.value) })}
                    className="w-full accent-[var(--red-lacquer)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>-300px (Trái)</span>
                    <span>0</span>
                    <span>+300px (Phải)</span>
                  </div>
                </div>

                {/* Y Slider & Input */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <label htmlFor="fit-y-input">Trục Y (Dọc, px):</label>
                    <input
                      id="fit-y-input"
                      data-testid="fit-y-number-input"
                      aria-label="Nhập giá trị trục Y"
                      type="number"
                      value={activeFit.y}
                      onChange={(e) => updateActiveFit({ y: parseFloat(e.target.value) || 0 })}
                      className="w-20 px-2 py-0.5 text-right font-mono text-xs border rounded bg-zinc-50"
                    />
                  </div>
                  <input
                    id="fit-y-slider"
                    data-testid="fit-y-slider-input"
                    aria-label="Thanh trượt trục Y"
                    type="range"
                    min={-300}
                    max={300}
                    step={1}
                    value={activeFit.y}
                    onChange={(e) => updateActiveFit({ y: parseFloat(e.target.value) })}
                    className="w-full accent-[var(--red-lacquer)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>-300px (Lên)</span>
                    <span>0</span>
                    <span>+300px (Xuống)</span>
                  </div>
                </div>

                {/* Scale Slider & Input */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <label htmlFor="fit-scale-input">Tỷ lệ (Scale):</label>
                    <input
                      id="fit-scale-input"
                      data-testid="fit-scale-number-input"
                      aria-label="Nhập giá trị tỷ lệ Scale"
                      type="number"
                      step="0.01"
                      value={activeFit.scale}
                      onChange={(e) => updateActiveFit({ scale: Math.max(0.01, parseFloat(e.target.value) || 1) })}
                      className="w-20 px-2 py-0.5 text-right font-mono text-xs border rounded bg-zinc-50"
                    />
                  </div>
                  <input
                    id="fit-scale-slider"
                    data-testid="fit-scale-slider-input"
                    aria-label="Thanh trượt tỷ lệ Scale"
                    type="range"
                    min={0.5}
                    max={1.5}
                    step={0.01}
                    value={activeFit.scale}
                    onChange={(e) => updateActiveFit({ scale: parseFloat(e.target.value) })}
                    className="w-full accent-[var(--indigo-deep)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>0.50 (50%)</span>
                    <span>1.00 (Chuẩn)</span>
                    <span>1.50 (150%)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-white rounded-xl border border-zinc-200 text-zinc-500 text-sm">
              Chọn một món đồ bên dưới để bắt đầu căn chỉnh.
            </div>
          )}

          {/* Wardrobe Items Section (Grouped by slot) */}
          <div className="bg-white rounded-xl border border-[var(--border-paper)] p-5 shadow-sm">
            <h3 className="text-sm font-serif font-bold text-[var(--ink-text)] mb-3">
              Danh Sách Món Trang Phục ({gender === "male" ? "Nam" : "Nữ"})
            </h3>

            <div className="space-y-4">
              {SLOTS.map(({ slot, label }) => {
                const slotItems = currentGenderItems.filter((i) => i.slot === slot);
                if (slotItems.length === 0) return null;

                return (
                  <div key={slot} className="border-t border-zinc-100 pt-2.5 first:border-0 first:pt-0">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      {label}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {slotItems.map((item) => {
                        const isEquipped = equippedItemIds.includes(item.id);
                        const isActive = activeItemId === item.id;
                        const hasCustomFit = Boolean(fitData[item.id]);

                        return (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-lg border text-left flex items-center justify-between gap-2 transition ${
                              isActive
                                ? "border-[var(--red-lacquer)] bg-red-50/40 ring-1 ring-[var(--red-lacquer)]"
                                : "border-zinc-200 bg-white hover:border-zinc-300"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-xs truncate">
                                  {item.name_vi}
                                </span>
                                {hasCustomFit && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Đã có tọa độ căn chỉnh" />
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400 font-mono truncate block">
                                {item.id}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setActiveItemId(item.id)}
                                className={`px-2 py-1 text-[11px] font-semibold rounded ${
                                  isActive
                                    ? "bg-[var(--red-lacquer)] text-white"
                                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                }`}
                              >
                                Chỉnh
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleEquip(item)}
                                className={`px-2 py-1 text-[11px] font-semibold rounded border ${
                                  isEquipped
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
                                }`}
                              >
                                {isEquipped ? "Đang mặc" : "Thử"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-zinc-200">
            <h3 className="text-lg font-serif font-bold text-[var(--ink-text)] mb-2">
              Nạp dữ liệu fit.json
            </h3>
            <p className="text-xs text-[var(--ink-muted)] mb-4">
              Dán nội dung JSON dạng <code>{`{ "item_id": { "x": 0, "y": 0, "scale": 1.0 } }`}</code> để nạp vào hệ thống.
            </p>

            <textarea
              rows={8}
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              placeholder='{\n  "M_A_TOP_ao_ngu_than": { "x": 0, "y": 0, "scale": 1 }\n}'
              className="w-full p-3 font-mono text-xs border rounded-lg bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[var(--red-lacquer)]"
            />

            {importError && (
              <p className="text-xs text-red-600 font-semibold mt-2">{importError}</p>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  setImportModalOpen(false);
                  setImportError("");
                }}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApplyImport}
                className="px-4 py-2 text-xs font-semibold bg-[var(--indigo-deep)] text-white hover:bg-[var(--indigo-deep-hover)] rounded-lg transition"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
