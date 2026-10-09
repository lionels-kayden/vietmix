import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import FitPage from "./page";
import { FitClient } from "./FitClient";
import HomePage from "@/app/page";
import DressUpPage from "@/app/dress-up/page";
import { loadAll } from "@/lib/data";

// Mock next/navigation notFound
const mockNotFound = vi.fn();
vi.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

describe("Phase 3b: Hidden /fit Page (Internal garment alignment tool)", () => {
  const originalEnv = process.env;

  beforeAll(() => {
    loadAll();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("T1: Internal Route & Security Gate", () => {
    it("calls notFound() when ENABLE_FIT is not set", () => {
      delete process.env.ENABLE_FIT;
      delete process.env.NEXT_PUBLIC_ENABLE_FIT;

      render(<FitPage />);
      expect(mockNotFound).toHaveBeenCalledTimes(1);
    });

    it("calls notFound() when ENABLE_FIT is set to '0' or any value other than '1'", () => {
      process.env.ENABLE_FIT = "0";
      process.env.NEXT_PUBLIC_ENABLE_FIT = "false";

      render(<FitPage />);
      expect(mockNotFound).toHaveBeenCalledTimes(1);
    });

    it("renders FitClient and does not call notFound() when ENABLE_FIT is '1'", () => {
      process.env.ENABLE_FIT = "1";

      render(<FitPage />);
      expect(mockNotFound).not.toHaveBeenCalled();
      expect(screen.getByText(/Công Cụ Căn Chỉnh Trang Phục/i)).toBeInTheDocument();
      expect(screen.getByTestId("fit-internal-badge")).toBeInTheDocument();
    });

    it("renders FitClient and does not call notFound() when NEXT_PUBLIC_ENABLE_FIT is '1'", () => {
      delete process.env.ENABLE_FIT;
      process.env.NEXT_PUBLIC_ENABLE_FIT = "1";

      render(<FitPage />);
      expect(mockNotFound).not.toHaveBeenCalled();
      expect(screen.getByText(/Công Cụ Căn Chỉnh Trang Phục/i)).toBeInTheDocument();
    });

    it("guarantees zero public navigation links pointing to /fit in HomePage and DressUpPage", () => {
      const { unmount: unmountHome } = render(<HomePage />);
      const homeLinks = screen.queryAllByRole("link");
      for (const link of homeLinks) {
        expect(link.getAttribute("href")).not.toBe("/fit");
      }
      unmountHome();

      render(<DressUpPage />);
      const dressUpLinks = screen.queryAllByRole("link");
      for (const link of dressUpLinks) {
        expect(link.getAttribute("href")).not.toBe("/fit");
      }
    });
  });

  describe("T2: Alignment UI & Real-Time Canvas Controls", () => {
    it("renders gender selector, character canvas, guidelines, and control panel", () => {
      render(<FitClient />);

      expect(screen.getByRole("button", { name: /Nhân vật Nam/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Nhân vật Nữ/i })).toBeInTheDocument();
      expect(screen.getByTestId("canvas-wrapper")).toBeInTheDocument();
      expect(screen.getByTestId("fit-guidelines-overlay")).toBeInTheDocument();
      expect(screen.getByTestId("fit-control-panel")).toBeInTheDocument();
    });

    it("switches gender and updates available catalog items", () => {
      render(<FitClient />);

      // Male is default
      expect(screen.getByText(/Áo tấc/i)).toBeInTheDocument();

      // Switch to Female
      const femaleBtn = screen.getByRole("button", { name: /Nhân vật Nữ/i });
      fireEvent.click(femaleBtn);

      expect(screen.getByText(/Áo nhật bình/i)).toBeInTheDocument();
    });

    it("toggles visual guidelines overlay", () => {
      render(<FitClient />);

      expect(screen.getByTestId("fit-guidelines-overlay")).toBeInTheDocument();

      const toggleGuidelinesBtn = screen.getByRole("button", { name: /Ẩn đường gióng/i });
      fireEvent.click(toggleGuidelinesBtn);

      expect(screen.queryByTestId("fit-guidelines-overlay")).not.toBeInTheDocument();

      const showGuidelinesBtn = screen.getByRole("button", { name: /Bật đường gióng/i });
      fireEvent.click(showGuidelinesBtn);

      expect(screen.getByTestId("fit-guidelines-overlay")).toBeInTheDocument();
    });

    it("adjusts X, Y, and Scale values and supports Reset", () => {
      render(<FitClient />);

      const xInput = screen.getByTestId("fit-x-number-input");
      const yInput = screen.getByTestId("fit-y-number-input");
      const scaleInput = screen.getByTestId("fit-scale-number-input");

      // Modify values
      fireEvent.change(xInput, { target: { value: "25" } });
      fireEvent.change(yInput, { target: { value: "-40" } });
      fireEvent.change(scaleInput, { target: { value: "1.15" } });

      expect(xInput).toHaveValue(25);
      expect(yInput).toHaveValue(-40);
      expect(scaleInput).toHaveValue(1.15);

      // Click Reset
      const resetBtn = screen.getByRole("button", { name: /Đặt lại/i });
      fireEvent.click(resetBtn);

      expect(xInput).toHaveValue(0);
      expect(yInput).toHaveValue(0);
      expect(scaleInput).toHaveValue(1);
    });
  });

  describe("T3: Fit Data Export & Import Handoff", () => {
    it("copies JSON to clipboard when clicking Sao chép JSON", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<FitClient />);

      const copyBtn = screen.getByRole("button", { name: /Sao chép JSON/i });
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled();
        expect(screen.getByText(/Đã sao chép vào clipboard/i)).toBeInTheDocument();
      });
    });

    it("triggers file download on clicking Xuất fit.json", () => {
      const clickMock = vi.fn();
      const createObjectURLMock = vi.fn().mockReturnValue("blob:mock-url");
      const revokeObjectURLMock = vi.fn();

      window.URL.createObjectURL = createObjectURLMock;
      window.URL.revokeObjectURL = revokeObjectURLMock;

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
        const el = originalCreateElement(tagName);
        if (tagName === "a") {
          el.click = clickMock;
        }
        return el;
      });

      render(<FitClient />);

      const exportBtn = screen.getByRole("button", { name: /Xuất fit.json/i });
      fireEvent.click(exportBtn);

      expect(clickMock).toHaveBeenCalled();
      expect(createObjectURLMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it("opens import modal, validates input, and updates fit data", () => {
      render(<FitClient />);

      const openImportBtn = screen.getByRole("button", { name: /Nạp fit.json/i });
      fireEvent.click(openImportBtn);

      expect(screen.getByText(/Nạp dữ liệu fit.json/i)).toBeInTheDocument();

      const textarea = screen.getByPlaceholderText(/M_A_TOP_ao_ngu_than/i);
      const applyBtn = screen.getByRole("button", { name: /Áp dụng/i });

      // Test invalid JSON
      fireEvent.change(textarea, { target: { value: "invalid-json" } });
      fireEvent.click(applyBtn);

      expect(screen.getByText(/Lỗi phân tích JSON/i)).toBeInTheDocument();

      // Test valid JSON
      const validPayload = JSON.stringify({
        M_A_TOP_ao_ngu_than: { x: 30, y: -15, scale: 1.08 },
      });
      fireEvent.change(textarea, { target: { value: validPayload } });
      fireEvent.click(applyBtn);

      expect(screen.getByText(/Đã nạp thành công 1 mục tọa độ/i)).toBeInTheDocument();
      expect(screen.queryByText(/Lỗi phân tích JSON/i)).not.toBeInTheDocument();
    });
  });
});
