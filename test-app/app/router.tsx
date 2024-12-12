import { createRouter as createTanStackRouter } from "@tanstack/react-router";

// this will be generated later
import { routeTree } from "./routeTree.gen";

// creating the router based on the routeTree
export function createRouter() {
  const router = createTanStackRouter({ routeTree });
  return router;
}

// augmenting the `react-router` module
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
