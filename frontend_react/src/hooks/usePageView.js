import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import logger, { isTelemetryEnabled } from "../lib/logger";

/**
 * PUBLIC_INTERFACE
 * usePageView hook
 * Logs a "page_view" telemetry event whenever the route (pathname+search) changes.
 * Only logs when telemetry is enabled and avoids duplicate logs for the same path on initial mount.
 */
export default function usePageView() {
  const location = useLocation();
  const lastPathRef = useRef("");

  useEffect(() => {
    if (!isTelemetryEnabled()) return;

    const path = `${location.pathname}${location.search || ""}`;
    if (lastPathRef.current === path) {
      return;
    }
    lastPathRef.current = path;

    logger.telemetry("page_view", {
      path,
      title: document?.title || "",
      timestamp: new Date().toISOString(),
    });
  }, [location]);
}
