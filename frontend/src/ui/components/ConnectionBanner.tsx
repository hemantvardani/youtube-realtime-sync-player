"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { CheckCircle2, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "../shadcn/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../shadcn/components/ui/alert";
import { socketServiceInstance } from "@/utils/socket";
import type { ConnectionStatus } from "@/redux/slices/connection";

const CONNECTED_TOAST_MS = 15_000;

type ConnectionState = {
  status: ConnectionStatus;
  attempt: number;
  maxAttempts: number;
};

export default function ConnectionBanner() {
  const { status, attempt, maxAttempts } = useSelector(
    (state: { connection: ConnectionState }) => state.connection
  );
  const [showConnectedToast, setShowConnectedToast] = useState(false);
  const prevStatusRef = useRef<ConnectionStatus>(status);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (status === "connected" && prev !== "connected") {
      setShowConnectedToast(true);
      const timeoutId = window.setTimeout(() => {
        setShowConnectedToast(false);
      }, CONNECTED_TOAST_MS);
      return () => window.clearTimeout(timeoutId);
    }

    if (status !== "connected") {
      setShowConnectedToast(false);
    }
  }, [status]);

  if (status === "connected") {
    if (!showConnectedToast) return null;

    return (
      <div className="fixed bottom-4 right-4 z-50 w-[min(100%-2rem,22rem)] shadow-lg">
        <Alert className="border-emerald-400 bg-emerald-50 text-emerald-950 [&>svg]:text-emerald-700 *:data-[slot=alert-description]:text-emerald-900/80">
          <CheckCircle2 />
          <AlertTitle>Connected</AlertTitle>
          <AlertDescription>
            <p>Server is up. You are good to go.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isFailed = status === "failed";

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(100%-2rem,22rem)] shadow-lg">
      <Alert
        variant={isFailed ? "destructive" : "default"}
        className={
          isFailed
            ? "border-destructive/50 bg-red-50"
            : "border-amber-400 bg-amber-50 text-amber-950 [&>svg]:text-amber-700 *:data-[slot=alert-description]:text-amber-900/80"
        }
      >
        {isFailed ? <WifiOff /> : <Loader2 className="animate-spin" />}
        <AlertTitle>
          {isFailed ? "Couldn't reach the server" : "Waking up the server"}
        </AlertTitle>
        <AlertDescription>
          <p>
            {isFailed
              ? "We stopped retrying after several attempts. Refresh or try again."
              : "This usually takes 30-60 seconds after idle. Retrying..."}
          </p>
          {!isFailed && attempt > 0 && (
            <p className="tabular-nums">
              Attempt {attempt} of {maxAttempts}
            </p>
          )}
          {isFailed && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2 border-destructive/30 bg-white"
              onClick={() => socketServiceInstance.retryConnect()}
            >
              <RefreshCw className="size-3.5" />
              Try again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
