import { cleanup, render } from "@testing-library/react";
import { DatabaseIcon } from "lucide-react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { StatusCard } from "./status-card";

afterEach(cleanup);

const props = {
  icon: DatabaseIcon,
  title: "Pangkalan Data",
  description: "PostgreSQL",
  latencyHint: "Pertanyaan ujian diukur di pelayan",
};

describe("StatusCard", () => {
  it("shows a skeleton while loading", () => {
    const { container, queryByText } = render(<StatusCard {...props} state="loading" />);

    expect(container.querySelector("[data-slot=skeleton]")).not.toBeNull();
    expect(queryByText("Operasi")).toBeNull();
  });

  it("shows the operational badge and latency when up", () => {
    const { getByText } = render(<StatusCard {...props} state="up" latencyMs={5.67} />);

    expect(getByText("Operasi")).toBeTruthy();
    expect(getByText("5.7")).toBeTruthy();
    expect(getByText("ms")).toBeTruthy();
  });

  it("shows the outage badge and no latency when down", () => {
    const { getByText, queryByText } = render(<StatusCard {...props} state="down" />);

    expect(getByText("Gangguan")).toBeTruthy();
    expect(queryByText("ms")).toBeNull();
  });
});
