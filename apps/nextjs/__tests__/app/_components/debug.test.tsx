import { render } from "@testing-library/react";
import { describe, it, vi } from "vitest";

import { DebugInfo } from "../../../src/app/_components/map/debug-info";

vi.mock("@formkit/auto-animate/react", () => ({
  useAutoAnimate: () => [vi.fn()],
}));

vi.mock("react", () => ({
  use: vi.fn(),
  forwardRef: vi.fn(),
  createRef: vi.fn(),
  createContext: vi.fn(),
  useContext: vi.fn(() => []),
}));

vi.mock("@f3/ui/button", () => ({
  Button: vi.fn(),
}));

vi.mock("@f3/ui/input", () => ({
  Input: vi.fn(),
}));

vi.mock("@f3/ui/toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@f3/ui/form", () => ({
  Form: vi.fn(),
  FormControl: vi.fn(),
  FormField: vi.fn(),
  FormItem: vi.fn(),
  FormMessage: vi.fn(),
  useForm: vi.fn(),
}));

vi.mock("@f3/ui/toast", () => ({
  toast: vi.fn(),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    locations: {
      getLocations: {
        useQuery: vi.fn().mockReturnValue({
          data: [],
        }),
      },
    },
  },
}));

describe("posts component", () => {
  it("should render list", async () => {
    const getPosts = new Promise(function (resolve) {
      return resolve([
        {
          title: "title",
          id: 1,
          content: "content",
          createdAt: new Date(),
          updatedAt: null,
        },
      ]);
    });
    await getPosts;
    render(<DebugInfo />);
  });
});
