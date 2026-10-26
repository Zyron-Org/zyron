"use client";

import * as React from "react";
import { PrivyProvider } from "@privy-io/react-auth";

export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "MonadVision",
      url: "https://testnet.monadvision.com",
    },
  },
};

export function ZyronPrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmuv68do900590djsjbesiz7m";

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#836EF9", // Monad purple accent
          logo: "/icon.svg",
        },
        loginMethods: ["wallet", "email", "github"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: monadTestnet as any,
        supportedChains: [monadTestnet as any],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
