/**
 * RootLayout Component - Simple layout for landing page routes
 *
 * Provides a minimal layout wrapper for the root path (/) and landing page.
 * Just renders <Outlet /> for nested routes.
 */

import { Outlet } from "react-router-dom";

/**
 * RootLayout component
 *
 * Simple layout wrapper for landing page routes.
 * The landing page content is rendered via the index route's Outlet.
 */
export function RootLayout() {
  return <Outlet />;
}

export default RootLayout;
