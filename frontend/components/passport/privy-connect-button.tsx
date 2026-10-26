"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAuth } from "@/lib/auth-context";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { ShieldCheck, Loader2, Sparkles, Wallet, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

interface PrivyConnectButtonProps {
  label?: string;
  redirectTo?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark" | "accent" | "danger";
}

export function PrivyConnectButton({
  label = "Continue with Privy",
  redirectTo = "/portal/passport",
  className = "w-full cursor-pointer",
  size = "md",
  variant = "dark",
}: PrivyConnectButtonProps) {
  const router = useRouter();
  const { ready, authenticated, user: privyUser, login, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const { user: zyronUser, loginWithPrivy } = useAuth();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const syncingRef = React.useRef(false);

  // Sync Privy session with Zyron backend
  const syncWithZyron = React.useCallback(
    async (token: string) => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      setIsProcessing(true);
      try {
        const embeddedWallet = wallets.find((w) => w.walletClientType === "privy") || wallets[0];
        const walletAddress = embeddedWallet?.address || privyUser?.wallet?.address;
        const email = privyUser?.email?.address || (privyUser as any)?.google?.email;

        toast.loading("Generating your Monad Trust Passport...", { id: "privy-sync" });
        await loginWithPrivy(token, walletAddress, email);
        toast.success("Zyron Trust Passport ready on Monad Testnet!", { id: "privy-sync" });
        router.push(redirectTo);
      } catch (err: any) {
        console.error("Failed to sync Privy auth with Zyron:", err);
        toast.error(
          err?.response?.data?.message || err?.message || "Failed to link Privy identity",
          { id: "privy-sync" }
        );
      } finally {
        setIsProcessing(false);
        syncingRef.current = false;
      }
    },
    [wallets, privyUser, loginWithPrivy, router, redirectTo]
  );

  // Auto-sync if Privy authenticated but Zyron user not loaded
  React.useEffect(() => {
    if (ready && authenticated && !zyronUser && !syncingRef.current) {
      getAccessToken()
        .then((token) => {
          if (token && !syncingRef.current) {
            syncWithZyron(token);
          }
        })
        .catch((err) => {
          console.warn("Could not retrieve Privy token:", err);
        });
    }
  }, [ready, authenticated, zyronUser, getAccessToken, syncWithZyron]);

  const handlePrivyClick = async () => {
    if (!ready) {
      toast.info("Initializing Privy identity layer...");
      return;
    }

    if (authenticated) {
      try {
        const token = await getAccessToken();
        if (token) {
          await syncWithZyron(token);
        } else {
          login();
        }
      } catch {
        login();
      }
      return;
    }

    // Trigger Privy authentication modal
    try {
      login();
    } catch (err: any) {
      toast.error(err?.message || "Could not open Privy authentication");
    }
  };

  return (
    <ExpandingButton
      type="button"
      variant={variant}
      size={size}
      rounded="xl"
      disabled={!ready || isProcessing}
      onClick={handlePrivyClick}
      className={className}
      icon={
        isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin stroke-[2.5]" />
        ) : (
          <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
        )
      }
    >
      <span className="flex items-center gap-2.5">
        <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
        <span>
          {isProcessing ? "Creating Passport..." : label}
        </span>
      </span>
    </ExpandingButton>
  );
}
