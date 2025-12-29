import { supabase } from "@/integrations/supabase/client";

export interface DiagnosticResult {
  step: string;
  status: "ok" | "error" | "pending";
  message: string;
  details?: string;
}

export interface DiagnosticsReport {
  timestamp: string;
  browser: string;
  results: DiagnosticResult[];
  lastError?: string;
}

export async function runVoiceDiagnostics(): Promise<DiagnosticsReport> {
  const results: DiagnosticResult[] = [];
  let lastError: string | undefined;

  const browser = `${navigator.userAgent}`;

  // Step 1: Check microphone permission
  results.push({ step: "microphone", status: "pending", message: "Checking microphone access..." });
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    results[results.length - 1] = {
      step: "microphone",
      status: "ok",
      message: "Microphone access granted",
    };
  } catch (err: any) {
    const errorName = err?.name || "Unknown";
    let message = "Microphone access denied";
    let details = err?.message || "";

    if (errorName === "NotAllowedError") {
      message = "Microphone permission blocked";
      details = "Click the lock icon in your browser's address bar and allow microphone access.";
    } else if (errorName === "NotFoundError") {
      message = "No microphone found";
      details = "Please connect a microphone and try again.";
    } else if (errorName === "NotReadableError") {
      message = "Microphone is in use by another app";
      details = "Close other apps using the microphone and try again.";
    }

    results[results.length - 1] = { step: "microphone", status: "error", message, details };
    lastError = `Mic: ${errorName} - ${err?.message}`;
  }

  // Step 2: Check ephemeral token generation
  results.push({ step: "ephemeral_token", status: "pending", message: "Fetching ephemeral token..." });
  try {
    const { data, error } = await supabase.functions.invoke("openai-realtime-session", {
      body: { instructions: "test", voice: "alloy" },
    });

    if (error) throw error;

    if (data?.client_secret?.value) {
      results[results.length - 1] = {
        step: "ephemeral_token",
        status: "ok",
        message: "Ephemeral token retrieved successfully",
      };
    } else if (data?.error) {
      throw new Error(data.error);
    } else {
      throw new Error("No client_secret in response");
    }
  } catch (err: any) {
    const message = err?.message || "Failed to get ephemeral token";
    results[results.length - 1] = {
      step: "ephemeral_token",
      status: "error",
      message: "Ephemeral token failed",
      details: message,
    };
    lastError = `Token: ${message}`;
  }

  // Step 3: Check WebRTC support
  results.push({ step: "webrtc", status: "pending", message: "Checking WebRTC support..." });
  try {
    if (!window.RTCPeerConnection) {
      throw new Error("RTCPeerConnection not supported");
    }
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    await pc.createOffer({ offerToReceiveAudio: true });
    pc.close();
    results[results.length - 1] = {
      step: "webrtc",
      status: "ok",
      message: "WebRTC is supported",
    };
  } catch (err: any) {
    results[results.length - 1] = {
      step: "webrtc",
      status: "error",
      message: "WebRTC not available",
      details: err?.message,
    };
    lastError = `WebRTC: ${err?.message}`;
  }

  // Step 4: Basic network check (can we reach OpenAI domain?)
  results.push({ step: "network", status: "pending", message: "Checking network connectivity..." });
  try {
    // We can't directly test the realtime endpoint without a token, but we can check if fetch works
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Simple HEAD request to a known endpoint (this may fail with 401 which is expected)
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "HEAD",
      signal: controller.signal,
    }).catch((err) => {
      // If it's a network error (not HTTP error), we have a problem
      if (err.name === "AbortError") throw new Error("Request timed out");
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        throw new Error("Network blocked - possible firewall/adblock");
      }
      // 401/403 is fine - it means we reached the server
      return { ok: false, status: 401 };
    });
    
    clearTimeout(timeoutId);
    
    results[results.length - 1] = {
      step: "network",
      status: "ok",
      message: "Network connectivity OK",
      details: "Can reach OpenAI servers",
    };
  } catch (err: any) {
    results[results.length - 1] = {
      step: "network",
      status: "error",
      message: "Network connectivity issue",
      details: err?.message || "Cannot reach OpenAI. Check firewall, VPN, or ad-blocker.",
    };
    lastError = `Network: ${err?.message}`;
  }

  return {
    timestamp: new Date().toISOString(),
    browser,
    results,
    lastError,
  };
}

export function formatDiagnosticsForCopy(report: DiagnosticsReport): string {
  const lines = [
    `Voice Chat Diagnostics - ${report.timestamp}`,
    `Browser: ${report.browser}`,
    "",
    "Results:",
  ];

  for (const r of report.results) {
    const icon = r.status === "ok" ? "✓" : r.status === "error" ? "✗" : "…";
    lines.push(`  ${icon} ${r.step}: ${r.message}`);
    if (r.details) lines.push(`      ${r.details}`);
  }

  if (report.lastError) {
    lines.push("", `Last Error: ${report.lastError}`);
  }

  return lines.join("\n");
}
