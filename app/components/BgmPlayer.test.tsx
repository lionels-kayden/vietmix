import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BgmPlayer } from "./BgmPlayer";

describe("BgmPlayer component (app/components/BgmPlayer.tsx)", () => {
  beforeEach(() => {
    // Clear session storage between tests
    window.sessionStorage.clear();

    // Mock HTMLMediaElement play and pause methods in jsdom
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    });
    window.HTMLMediaElement.prototype.pause = vi.fn().mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("pause"));
    });
  });

  it("attempts to autoplay on enter web", async () => {
    await act(async () => {
      render(<BgmPlayer />);
    });
    const toggleBtn = screen.getByTestId("btn-toggle-bgm");
    expect(toggleBtn).toBeInTheDocument();
    // Autoplay succeeds in test environment
    expect(toggleBtn).toHaveTextContent("Nhạc nhẹ: Inh Lả Ơi");
    expect(toggleBtn).toHaveAttribute("aria-label", "Tắt nhạc nền (Inh Lả Ơi)");
  });

  it("renders audio element with MP3 and M4A sources for Inh La Oi", async () => {
    await act(async () => {
      render(<BgmPlayer />);
    });
    const audioElement = screen.getByTestId("bgm-audio-element") as HTMLAudioElement;
    expect(audioElement).toBeInTheDocument();
    expect(audioElement).toHaveAttribute("loop");

    const sources = audioElement.querySelectorAll("source");
    expect(sources.length).toBe(2);
    expect(sources[0]).toHaveAttribute("src", "/assets/audio/inh-la-oi.mp3");
    expect(sources[1]).toHaveAttribute("src", "/assets/audio/inh-la-oi.m4a");
  });

  it("allows user to turn off and turn on playback and updates aria-label", async () => {
    await act(async () => {
      render(<BgmPlayer />);
    });
    const toggleBtn = screen.getByTestId("btn-toggle-bgm");

    // Click to turn off (pause)
    await act(async () => {
      fireEvent.click(toggleBtn);
    });
    expect(toggleBtn).toHaveTextContent("Nhạc nền");
    expect(toggleBtn).toHaveAttribute("aria-label", "Bật nhạc nền (Inh Lả Ơi)");

    // Click to turn back on
    await act(async () => {
      fireEvent.click(toggleBtn);
    });
    expect(toggleBtn).toHaveTextContent("Nhạc nhẹ: Inh Lả Ơi");
    expect(toggleBtn).toHaveAttribute("aria-label", "Tắt nhạc nền (Inh Lả Ơi)");
  });

  it("toggles volume slider popover and adjusts volume", async () => {
    await act(async () => {
      render(<BgmPlayer />);
    });
    const volumeBtn = screen.getByTestId("btn-bgm-volume-toggle");

    expect(screen.queryByTestId("bgm-volume-popover")).not.toBeInTheDocument();
    fireEvent.click(volumeBtn);
    expect(screen.getByTestId("bgm-volume-popover")).toBeInTheDocument();

    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: "0.2" } });
    expect(slider).toHaveValue("0.2");
  });
});
