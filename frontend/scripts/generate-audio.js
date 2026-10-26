const fs = require('fs');
const path = require('path');

// 12 Pitch Deck Slide Scripts
const SLIDES = [
  { id: 1, text: "Welcome to Zairon. We are building the AI security infrastructure for Web3 protocols. Rather than relying on speculative linters or four-week manual reviews, Zairon combines static A-S-T semantic reasoning with an Autonomous Red-Team E-V-M Sandbox agent that proves exploit viability before human sign-off." },
  { id: 2, text: "Smart contracts secure over one hundred billion dollars, yet security is a bottleneck. Generic AI linters flood teams with eighty percent false positives, while manual audits take four to eight weeks and cost up to one hundred fifty thousand dollars. Speculative bug finding fails Web3." },
  { id: 3, text: "Zairon replaces speculative bug finding with automated mathematical proof. Our Dual-Engine AI combines static A-S-T invariant analysis with an autonomous red-team agent that forks E-V-M mainnet state, synthesizes executable attack vectors, and generates reproducible Foundry proof of concepts." },
  { id: 4, text: "Layer one parses Solidity into Abstract Syntax Trees and opcode flow graphs. Unlike generic LLMs that guess syntax errors, our model reasons against protocol invariants—such as collateral solvency, share dilution, reentrancy guards, and oracle staleness—across complex multi-file storage layouts." },
  { id: 5, text: "Layer two is our autonomous red-team microservice. It spins up an ephemeral virtual E-V-M fork, orchestrates multi-step transactions with flash loans, and executes attacks. If an invariant breaks, it generates an executable Foundry test suite dot-t-dot-sol. Unverified candidate bugs are eliminated." },
  { id: 6, text: "The AI emits a step-by-step transaction trace detailing opcodes, gas, and balance drains. In our Dual-Pane Workbench, senior auditors replay live proofs, write remediation guidance, and verify patches in real time—reducing audit turnaround from weeks to days." },
  { id: 7, text: "Our audit lifecycle is completely transparent: Stage one, scope ingestion. Stage two, A-S-T invariant analysis. Stage three, red-team E-V-M sandbox attack synthesis. Stage four, trace replay auditor triage. Stage five, final cryptographic on-chain attestation." },
  { id: 8, text: "Demand for verifiable AI security is booming. Thousands of smart contracts deploy daily across Layer-2 rollups like Arbitrum, Base, and Optimism. Institutional real-world asset protocols demand continuous cryptographic proof over speculative P-D-F compliance checks." },
  { id: 9, text: "We operate a high-margin hybrid model: charging fixed engagement fees for complete AI audits with on-chain attestations, alongside continuous subscriptions for pull-request scanning and priority sandbox triage—creating predictable annual recurring revenue." },
  { id: 10, text: "Static linters flood teams with false positives and cannot execute code. Legacy audit firms are slow, expensive, and deliver unlinked reports. Zairon delivers compiler speed, mathematical E-V-M exploit proofs, and on-chain verification that no legacy firm provides." },
  { id: 11, text: "Our core A-S-T engine, auditor workbench, and Arbitrum Sepolia attestation registry are live. We are now expanding multi-file inheritance analysis, client dashboards, decentralized auditor identity on E-R-C eight thousand and four, and continuous active monitoring." },
  { id: 12, text: "Zairon is building the trust layer for smart contract security. We are onboarding design partner protocols, security researchers, and strategic supporters who share our vision for verifiable AI security. Join us in making Web3 security genuinely trusted onchain." }
];

async function generateAudioWithOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("❌ OPENAI_API_KEY env variable not found!");
    console.log("Usage: OPENAI_API_KEY=sk-... node scripts/generate-audio.js");
    process.exit(1);
  }

  const outputDir = path.join(__dirname, '../public/audio/pitchdeck');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("🚀 Generating studio MP3 files for all 12 pitch deck slides using OpenAI TTS (Onyx Voice)...");

  for (const slide of SLIDES) {
    const filePath = path.join(outputDir, `slide-${slide.id}.mp3`);
    console.log(`🎙️ Generating Slide ${slide.id}...`);

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        input: slide.text,
        voice: "onyx",
        speed: 1.05
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`❌ Failed to generate slide ${slide.id}:`, err);
      continue;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Saved ${filePath}`);
  }

  console.log("🎉 All 12 studio audio files generated successfully in public/audio/pitchdeck/!");
}

generateAudioWithOpenAI().catch(console.error);
