import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders loading state on mount", () => {
  render(<App />);
  const heading = screen.getByText(/loading survey/i);
  expect(heading).toBeInTheDocument();
});
