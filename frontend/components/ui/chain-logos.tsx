import * as React from "react";

export function ChainLogo({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  switch (name) {
    case "Ethereum":
      return (
        <svg viewBox="0 0 256 417" className={className} fill="none">
          <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" fill="#8C8CBE" />
          <path d="M127.962 0L0 212.32l127.962 75.639V0z" fill="#E5E5F2" />
          <path d="M127.961 312.187l-1.571 1.916v97.68l1.571 4.582 128.038-180.178z" fill="#8C8CBE" />
          <path d="M127.962 416.365V312.187L0 236.187z" fill="#E5E5F2" />
          <path d="M127.961 287.958l127.96-75.637-127.96-58.162z" fill="#3C3C77" />
          <path d="M0 212.32l127.96 75.638v-133.8z" fill="#8C8CBE" />
        </svg>
      );
    case "Arbitrum":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M12 2L2 19.5h20L12 2zm0 4.2l6.7 11.8H5.3L12 6.2zm-1.1 4.8l-2.3 4.1h4.6l-2.3-4.1z" fill="#28A0F0" />
        </svg>
      );
    case "Optimism":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#FF0420" />
          <text x="12" y="16" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">OP</text>
        </svg>
      );
    case "Polygon":
      return (
        <svg viewBox="0 0 38 33" className={className} fill="none">
          <path d="M29 10.2L19.2 4.5a1.6 1.6 0 00-1.6 0L8 10.2a1.6 1.6 0 00-.8 1.4v11.4c0 .6.3 1.1.8 1.4l9.6 5.6a1.6 1.6 0 001.6 0l9.6-5.6a1.6 1.6 0 00.8-1.4V11.6a1.6 1.6 0 00-.8-1.4z" fill="#8247E5" />
          <path d="M18.4 12.3l-4.8 2.8v5.6l4.8 2.8 4.8-2.8v-5.6l-4.8-2.8z" fill="#FFFFFF" />
        </svg>
      );
    case "Base":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#0052FF" />
          <path d="M12 5a7 7 0 100 14 7 7 0 000-14zm0 2.2a4.8 4.8 0 110 9.6 4.8 4.8 0 010-9.6z" fill="#FFFFFF" />
        </svg>
      );
    case "Avalanche":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#E84142" />
          <path d="M12 6l5 9h-3l-2-3.8L10 15H7l5-9z" fill="#FFFFFF" />
          <path d="M15.5 16.5l1.5 2.5h-3l1.5-2.5z" fill="#FFFFFF" />
        </svg>
      );
    case "BNB Chain":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#F3BA2F" />
          <path d="M12 6.5l2.2 2.2-2.2 2.2-2.2-2.2L12 6.5zm-3.8 3.8l2.2 2.2-2.2 2.2-2.2-2.2 2.2-2.2zm7.6 0l2.2 2.2-2.2 2.2-2.2-2.2 2.2-2.2zM12 14.1l2.2 2.2-2.2 2.2-2.2-2.2 2.2-2.2z" fill="#0B0D10" />
        </svg>
      );
    case "Linea":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <rect width="24" height="24" rx="6" fill="#121212" />
          <path d="M7 6h3v12H7V6zm7 0h3v7h-3V6z" fill="#61DFFF" />
        </svg>
      );
    case "Scroll":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#FFE799" />
          <path d="M8 8.5c0-1.4 1.1-2.5 2.5-2.5h5c1.4 0 2.5 1.1 2.5 2.5v7c0 1.4-1.1 2.5-2.5 2.5h-5c-1.4 0-2.5-1.1-2.5-2.5v-7z" stroke="#C9983A" strokeWidth="1.5" />
          <path d="M10.5 11h3m-3 2.5h2" stroke="#C9983A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "Blast":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#FCFC03" />
          <path d="M8 14l3.5-6.5L11 11h5l-4 6.5L12.5 14H8z" fill="#000000" />
        </svg>
      );
    case "zkSync Era":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#8C8DFC" />
          <path d="M7 16V8l5 4-5 4zm10-8v8l-5-4 5-4z" fill="#FFFFFF" />
        </svg>
      );
    case "Solana":
      return (
        <svg viewBox="0 0 397 311" className={className} fill="none">
          <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.7 0 8.6 6.9 4.5 11l-58.4 58.4c-2.4 2.4-5.7 3.8-9.2 3.8H5.7c-5.7 0-8.6-6.9-4.5-11l63.4-58.4z" fill="#00FFA3" />
          <path d="M64.6 3.8C67 1.4 70.3 0 73.8 0h317.4c5.7 0 8.6 6.9 4.5 11L337.3 69.4c-2.4 2.4-5.7 3.8-9.2 3.8H10.7c-5.7 0-8.6-6.9-4.5-11L64.6 3.8z" fill="#00FFA3" />
          <path d="M332.6 120.8c-2.4-2.4-5.7-3.8-9.2-3.8H6c-5.7 0-8.6 6.9-4.5 11l58.4 58.4c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.7 0 8.6-6.9 4.5-11l-58.4-58.4z" fill="#DC1FFF" />
        </svg>
      );
    case "Sui":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M12 2C9 7 6 11 6 15a6 6 0 0012 0c0-4-3-8-6-13z" fill="#4CA2FF" />
          <circle cx="12" cy="14" r="2.5" fill="#FFFFFF" opacity="0.6" />
        </svg>
      );
    case "Aptos":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#14171C" />
          <path d="M12 5l-5 13h2.2l1.2-3.2h3.2l1.2 3.2H17L12 5zm0 4.2l1.1 3h-2.2l1.1-3z" fill="#2DD8A7" />
        </svg>
      );
    case "Near Protocol":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#000000" />
          <path d="M8 16V8l5.5 8h2.5V8h-2.5v5.5L8 8z" fill="#00EC97" />
        </svg>
      );
    case "Cosmos Hub":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#2E3148" />
          <ellipse cx="12" cy="12" rx="7" ry="2.5" stroke="#FFFFFF" strokeWidth="1" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="7" ry="2.5" stroke="#FFFFFF" strokeWidth="1" transform="rotate(90 12 12)" />
          <ellipse cx="12" cy="12" rx="7" ry="2.5" stroke="#FFFFFF" strokeWidth="1" transform="rotate(150 12 12)" />
          <circle cx="12" cy="12" r="1.5" fill="#5EC8FF" />
        </svg>
      );
    case "Injective":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#00182E" />
          <path d="M12 6a6 6 0 104.2 10.2l-1.8-1.8A3.5 3.5 0 1112 8.5V6z" fill="#00F2FE" />
          <circle cx="15" cy="9" r="1.5" fill="#00F2FE" />
        </svg>
      );
    case "Celestia":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#7B2BF9" />
          <path d="M12 6v12m-6-6h12m-9.5-4.5l7 7m0-7l-7 7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "Mantle":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#000000" />
          <circle cx="12" cy="12" r="5" stroke="#00FFA3" strokeWidth="2" strokeDasharray="3 2" />
        </svg>
      );
    case "Sei Network":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#9B1C2E" />
          <path d="M8 14c0-2 2-3 4-3s4 1 4 3-2 3-4 3-4-1-4-3zm0-4c0-2 2-3 4-3s4 1 4 3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "Fantom":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#1969FF" />
          <path d="M12 6l4 3.5L12 13 8 9.5 12 6zm0 5l4 3.5-4 3.5-4-3.5 4-3.5z" fill="#FFFFFF" />
        </svg>
      );
    case "Polkadot":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#E6007A" />
          <circle cx="12" cy="8" r="2.5" fill="#FFFFFF" />
          <circle cx="12" cy="16" r="2.5" fill="#FFFFFF" />
          <circle cx="8" cy="12" r="1.5" fill="#FFFFFF" />
          <circle cx="16" cy="12" r="1.5" fill="#FFFFFF" />
        </svg>
      );
    case "Tron":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#FF0013" />
          <path d="M7 8l10-1-6 10-4-9z" fill="#FFFFFF" />
          <path d="M7 8l4 3 6-4-10 1z" fill="#FFE5E5" />
        </svg>
      );
    case "Berachain":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#8A4315" />
          <circle cx="9" cy="9" r="2" fill="#E6A15C" />
          <circle cx="15" cy="9" r="2" fill="#E6A15C" />
          <ellipse cx="12" cy="13" rx="4" ry="3" fill="#E6A15C" />
          <circle cx="12" cy="13" r="1.2" fill="#8A4315" />
        </svg>
      );
    case "Monad":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#836EF9" />
          <path d="M7 16V8l5 4 5-4v8l-5-4-5 4z" fill="#FFFFFF" />
        </svg>
      );
    case "Starknet":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#0C0C4F" />
          <path d="M12 6l1.8 3.8L18 11.5l-3.2 3.2.8 4.3L12 16.8l-3.6 2.2.8-4.3L6 11.5l4.2-1.7L12 6z" fill="#EC796B" />
        </svg>
      );
    case "Taiko":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#E81899" />
          <circle cx="12" cy="12" r="5" fill="#FFFFFF" />
          <circle cx="12" cy="12" r="2.5" fill="#E81899" />
        </svg>
      );
    case "Gnosis":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#04795B" />
          <path d="M8 12a4 4 0 108 0 4 4 0 00-8 0zm2 0a2 2 0 114 0 2 2 0 01-4 0z" fill="#FFFFFF" />
        </svg>
      );
    case "Ronin":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#1273EA" />
          <path d="M8 8h5a3 3 0 010 6H8V8zm3 2.5v1h2a.5.5 0 000-1h-2z" fill="#FFFFFF" />
          <path d="M11 14l3.5 3.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "Flow":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#00EF8B" />
          <path d="M8 9h8M8 12h5M8 15h3" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "Moonbeam":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#53CBC8" />
          <circle cx="9" cy="12" r="1.5" fill="#0B0D10" />
          <circle cx="12" cy="12" r="1.5" fill="#0B0D10" />
          <circle cx="15" cy="12" r="1.5" fill="#0B0D10" />
        </svg>
      );
    case "Celo":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#FCFF52" />
          <circle cx="10" cy="10" r="3" stroke="#000000" strokeWidth="1.5" />
          <circle cx="14" cy="14" r="3" stroke="#000000" strokeWidth="1.5" />
        </svg>
      );
    case "Kava":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#FF564F" />
          <path d="M8 7v10h2.5V7H8zm4 0l4.5 5L12 17h3l3.5-5L15 7h-3z" fill="#FFFFFF" />
        </svg>
      );
    case "Fraxtal":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#000000" />
          <path d="M8 8h8v2H8V8zm0 3h5v2H8v-2zm0 3h3v2H8v-2z" fill="#FFFFFF" />
        </svg>
      );
    case "Metis":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#00D2FF" />
          <path d="M8 16V8l4 4 4-4v8h-2V11l-2 2-2-2v5H8z" fill="#000000" />
        </svg>
      );
    case "Robinhood":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M2.84 24h.53c.096 0 .192-.048.224-.128C7.591 13.696 11.94 8.656 14.67 5.638c.112-.128.064-.225-.096-.225h-4.88a.55.55 0 0 0-.45.225L5.746 9.972c-.514.642-.642 1.236-.642 2.086v4.43c-1.14 3.194-1.862 5.361-2.392 7.32-.032.125.016.192.129.192M20.447.646c-.754-.802-4.157-.834-5.73-.224a3 3 0 0 0-.786.465 41 41 0 0 0-3.323 3.178c-.112.113-.064.225.097.225h5.409c.497 0 .786.289.786.786v6.1c0 .16.128.208.225.064l3.258-4.254c.53-.69.69-.898.835-1.861.192-1.413.08-3.58-.77-4.479m-6.982 16.18 2.231-3.676a.7.7 0 0 0 .064-.29V6.73c0-.16-.112-.225-.224-.097-3.355 3.74-5.971 7.672-8.395 12.407-.06.12.016.225.16.177l5.009-1.54c.565-.174.882-.402 1.155-.852"
            fill="#00C805"
          />
        </svg>
      );
    default:
      return (
        <div className="w-5 h-5 rounded-full bg-accent-scan/20 text-accent-scan font-mono text-[10px] flex items-center justify-center font-bold">
          {name.charAt(0)}
        </div>
      );
  }
}
