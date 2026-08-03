// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyValue } from "@/components/copy-value";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CopyValue", () => {
  it("copies through the Clipboard API", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<CopyValue value="secret-value" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(writeText).toHaveBeenCalledWith("secret-value");
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("falls back to execCommand when Clipboard API fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });
    render(<CopyValue value="fallback-value" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(await screen.findByText("Copied")).toBeInTheDocument();
    expect(execCommand).toHaveBeenCalledWith("copy");
  });
});
