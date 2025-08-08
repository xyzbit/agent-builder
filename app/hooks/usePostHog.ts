import { useEffect } from "react";
import posthog from "posthog-js";

export function usePostHog() {
  useEffect(() => {
    posthog?.init("phc_oP0L7D3Fvteaygj3QCqI7kgqMAtctseWF0AhlFho2ZS", {
      api_host: "https://posthog.launch.today",
      session_recording: {
        recordCrossOriginIframes: true,
      },
      autocapture: false,
    });

    return () => {
      posthog?.reset();
    };
  }, []);
} 
