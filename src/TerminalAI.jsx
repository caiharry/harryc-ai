// harryc.ai — terminal-agent CV.
// Inspired by agentic CLI tools; visually distinct (magenta-accented, IBM Plex).
// Renders as a conversation: visitor prompts → agent tool calls → rendered output.
//
// 7 prompts: whoami · /skills · gcloud run · mcp__bigquery · kubectl · Read(pub) · how-to-work
// Final prompt: AskUserQuestion with three live branches (the payoff).
//
// This file: palette, atoms, chrome, model-card hero, root.
// Sections 2-6 live in TerminalAISeq.jsx, section 7 in TerminalAIAsk.jsx.

const { useState: useStateAI, useEffect: useEffectAI, useRef: useRefAI, useMemo: useMemoAI } = React;

const TAI = {
  bg: "#0E0D10",
  paper: "#16151A",
  card: "#1A1820",
  cardAlt: "#221F29",
  ink: "#ECE9DF",
  inkSoft: "#A6A192",
  mute: "#6D6957",
  rule: "#2A2731",
  ruleSoft: "#211F26",
  accent: "#FF7BAA", // magenta — agent / tool prefixes (distinct from any CLI brand)
  cyan: "#69D2E8", // user prompts / SQL keywords
  amber: "#F2B441", // thinking / pending
  green: "#86D17A", // tool ok / approved / serving
  lilac: "#B58FE7", // thinking text
  red: "#FF6B6B",
  font: "'IBM Plex Mono', monospace",
  sans: "'IBM Plex Sans', sans-serif"
};

// ── Atoms ─────────────────────────────────────────────────────────────────

// Visitor's question, rendered as a chat prompt with the `harry@harryc.ai` user.
function UserPrompt({ text, ts }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", gap: 12,
      padding: "20px 0 14px", borderTop: `1px solid ${TAI.ruleSoft}`,
      marginTop: 22,
      fontFamily: TAI.font, fontSize: 14.5
    }}>
      <span style={{ color: TAI.accent, fontWeight: 600 }}>›</span>
      <span style={{ color: TAI.mute, fontSize: 12 }}>visitor@harryc.ai:~$</span>
      <span style={{ color: TAI.ink, flex: 1 }}>{text}</span>
      {ts && <span style={{ color: TAI.mute, fontSize: 11 }}>{ts}</span>}
    </div>);

}

// "✻ Thinking…" preamble with cycling dots.
function Thinking({ text }) {
  const [dots, setDots] = useStateAI("");
  useEffectAI(() => {
    let n = 0;
    const t = setInterval(() => {n = (n + 1) % 4;setDots(".".repeat(n));}, 320);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      fontFamily: TAI.font, fontSize: 13, color: TAI.lilac,
      padding: "4px 0", fontStyle: "italic", letterSpacing: "0.01em"
    }}>
      <span style={{ color: TAI.amber, marginRight: 8 }}>✻</span>
      {text}{dots}
    </div>);

}

// Tool call block: ⏺ Name(args)  /  ⎿ result. Args render as a coloured token stream.
function ToolCall({ name, args, result, status = "ok" }) {
  const color = status === "ok" ? TAI.green : status === "warn" ? TAI.amber : TAI.red;
  return (
    <div style={{ fontFamily: TAI.font, fontSize: 13, lineHeight: 1.7, margin: "6px 0" }}>
      <div>
        <span style={{ color: TAI.accent }}>⏺</span>{" "}
        <span style={{ color: TAI.ink }}>{name}</span>
        <span style={{ color: TAI.mute }}>(</span>
        <span style={{ color: TAI.amber }}>{args}</span>
        <span style={{ color: TAI.mute }}>)</span>
      </div>
      {result &&
      <div style={{ paddingLeft: 18, color: TAI.inkSoft }}>
          <span style={{ color: TAI.mute, marginRight: 8 }}>⎿</span>
          <span style={{ color }}>{result}</span>
        </div>
      }
    </div>);

}

// Realistic shell output card.
function CodeBlock({ content, lang, prompt, dim }) {
  return (
    <div style={{
      margin: "10px 0 8px", padding: "12px 14px",
      background: "#0A0910", border: `1px solid ${TAI.rule}`,
      fontFamily: TAI.font, fontSize: 12.5, lineHeight: 1.55,
      color: TAI.inkSoft, overflowX: "auto", borderRadius: 2
    }}>
      {prompt &&
      <div style={{
        color: TAI.mute, fontSize: 11, letterSpacing: "0.02em",
        marginBottom: 8,
        display: "flex", justifyContent: "space-between", gap: 12,
        borderBottom: `1px dashed ${TAI.rule}`, paddingBottom: 6
      }}>
          <span><span style={{ color: TAI.accent }}>$</span> <span style={{ color: TAI.inkSoft }}>{prompt}</span></span>
          {lang && <span style={{ color: TAI.mute, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>{lang}</span>}
        </div>
      }
      <pre style={{
        margin: 0, whiteSpace: "pre",
        color: dim ? TAI.inkSoft : TAI.ink,
        fontFamily: TAI.font, fontSize: 12.5, lineHeight: 1.6
      }}>{content}</pre>
    </div>);

}

// Per-section footer. Token / time / cache stats — flavour.
function UsageFooter({ tokens, time, tools = 1, cached = true }) {
  return (
    <div style={{
      fontFamily: TAI.font, fontSize: 11, color: TAI.mute,
      padding: "12px 0 0", display: "flex", gap: 16, flexWrap: "wrap"
    }}>
      <span><span style={{ color: TAI.inkSoft }}>~</span> {tokens.toLocaleString()} tok</span>
      <span style={{ color: TAI.ruleSoft }}>·</span>
      <span>{time.toFixed(1)}s</span>
      <span style={{ color: TAI.ruleSoft }}>·</span>
      <span>{tools} tool{tools === 1 ? "" : "s"}</span>
      <span style={{ color: TAI.ruleSoft }}>·</span>
      <span style={{ color: cached ? TAI.green : TAI.amber }}>{cached ? "cached" : "fresh"}</span>
    </div>);

}

// Section header — small rule and label, separates the 7 prompts visually.
function Rule({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "32px 0 0" }}>
      <span style={{
        fontFamily: TAI.font, fontSize: 10.5, color: TAI.mute,
        letterSpacing: "0.18em", textTransform: "uppercase"
      }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: TAI.rule }} />
    </div>);

}

// ── Chrome ────────────────────────────────────────────────────────────────

function WindowChrome() {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center",
      padding: "10px 18px", borderBottom: `1px solid ${TAI.rule}`,
      background: TAI.paper, gap: 16
    }}>
      <div style={{ display: "flex", gap: 8 }}>
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F57" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEBC2E" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840" }} />
      </div>
      <div style={{
        fontFamily: TAI.font, fontSize: 12, color: TAI.inkSoft,
        textAlign: "center", letterSpacing: "0.04em"
      }}>
        ✻ <span style={{ color: TAI.ink }}>visitor@harryc.ai</span>
        <span style={{ color: TAI.mute }}> — </span>
        <span>~</span>
        <span style={{ color: TAI.mute }}> — </span>
        <span>main</span>
      </div>
    </div>);

}

function StatusBar({ branch }) {
  return (
    <div style={{
      padding: "8px 18px", borderTop: `1px solid ${TAI.rule}`,
      background: TAI.paper,
      fontFamily: TAI.font, fontSize: 11, color: TAI.inkSoft,
      display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap"
    }}>
      <div style={{ display: "flex", gap: 16 }}>
        <span><span style={{ color: TAI.accent }}>●</span> harryc-1.0</span>
        <span style={{ color: TAI.rule }}>│</span>
        <span>mode: <span style={{ color: TAI.cyan }}>cv</span></span>
        <span style={{ color: TAI.rule }}>│</span>
        <span>ctx: <span style={{ color: TAI.ink }}>{(12.3 + (branch?.length || 0) * 1.2).toFixed(1)}k</span><span style={{ color: TAI.mute }}>/200k</span></span>
        <span style={{ color: TAI.rule }}>│</span>
        <span style={{ color: TAI.green }}>● ready</span>
      </div>
      <div style={{ display: "flex", gap: 14, color: TAI.mute }}>
        <span>{branch ? <><span style={{ color: TAI.accent }}>↳ </span>{branch}</> : "type a question above (visual only — see live branches at bottom)"}</span>
      </div>
    </div>);

}

// ── Welcome banner ────────────────────────────────────────────────────────

function Banner() {
  // Tight ASCII glyph — distinct, magenta gradient.
  const art = String.raw`
   ██╗  ██╗  █████╗  ██████╗  ██████╗  ██╗   ██╗  ██████╗     █████╗  ██╗
   ██║  ██║ ██╔══██╗ ██╔══██╗ ██╔══██╗ ╚██╗ ██╔╝ ██╔════╝    ██╔══██╗ ██║
   ███████║ ███████║ ██████╔╝ ██████╔╝  ╚████╔╝  ██║         ███████║ ██║
   ██╔══██║ ██╔══██║ ██╔══██╗ ██╔══██╗   ╚██╔╝   ██║         ██╔══██║ ██║
   ██║  ██║ ██║  ██║ ██║  ██║ ██║  ██║    ██║    ╚██████╗    ██║  ██║ ██║
   ╚═╝  ╚═╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝    ╚═╝     ╚═════╝    ╚═╝  ╚═╝ ╚═╝`;

  return (
    <div style={{ padding: "30px 26px 4px" }}>
      <pre style={{
        margin: 0,
        fontFamily: TAI.font,
        fontSize: 11,
        lineHeight: 1.05,
        fontWeight: 600,
        background: `linear-gradient(95deg, ${TAI.accent} 0%, ${TAI.amber} 28%, ${TAI.green} 56%, ${TAI.cyan} 80%, ${TAI.lilac} 100%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        overflowX: "auto",
        whiteSpace: "pre"
      }}>{art}</pre>

      <div style={{
        marginTop: 18,
        padding: "14px 16px",
        border: `1px solid ${TAI.rule}`,
        background: TAI.paper,
        fontFamily: TAI.font, fontSize: 12.5, color: TAI.inkSoft, lineHeight: 1.7,
        maxWidth: 680
      }}>
        <div>
          <span style={{ color: TAI.accent, marginRight: 8 }}>✻</span>
          Welcome. This is <span style={{ color: TAI.ink }}>Harry Cai</span>'s CV — running as a Claude Code session.
        </div>
        <div style={{ color: TAI.mute, marginTop: 8, fontSize: 11.5 }}>This is a static webpage, not a live chat. I've shipped enough production agents to know better.


        </div>
      </div>
    </div>);

}

// ── Prompt 1 · Who is Harry Cai? — HuggingFace-style model card hero ──────

function HFModelCard() {
  const cv = window.CV;
  // Pre-built rows for the YAML/HF-card frontmatter.
  // Format: [key, value, valueColor]
  const rows = [
  { k: "model", v: "harrycai/cloud-architect-3.5", c: TAI.amber },
  { k: "pipeline_tag", v: "enterprise-agentic-ai-delivery", c: TAI.green },
  { k: "tags", v: "[agentic, adk, mcp, a2a, rag, llm-prod, evals, genops]", c: TAI.lilac },
  { k: "license", v: "proprietary", c: TAI.accent },
  { k: "location", v: "London, UK", c: TAI.ink },
  { k: "since", v: "2022-11-30  # ChatGPT public release", c: TAI.amber },
  { k: "context_len", v: "200000", c: TAI.cyan }];


  return (
    <div style={{
      marginTop: 14,
      border: `1px solid ${TAI.rule}`,
      background: `linear-gradient(180deg, ${TAI.cardAlt} 0%, ${TAI.card} 100%)`,
      position: "relative",
      overflow: "hidden"
    }}>
      {/* HF-style header strip */}
      <div style={{
        padding: "10px 14px", borderBottom: `1px solid ${TAI.rule}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#0A0910",
        fontFamily: TAI.font, fontSize: 11.5, color: TAI.mute
      }}>
        <span>
          <span style={{ color: TAI.amber }}>🤗</span>{" "}
          <span style={{ color: TAI.inkSoft }}>huggingface.co</span>
          <span style={{ color: TAI.mute }}> / </span>
          <span style={{ color: TAI.ink }}>harrycai</span>
          <span style={{ color: TAI.mute }}> / </span>
          <span style={{ color: TAI.accent }}>cloud-architect-3.5</span>
        </span>
        <span style={{ display: "flex", gap: 12 }}>
          <span><span style={{ color: TAI.amber }}>♥</span> 8.3B</span>
          <span><span style={{ color: TAI.cyan }}>↓</span> 5</span>
          <span style={{ color: TAI.rule }}>│</span>
          <span style={{
            color: TAI.green, border: `1px solid ${TAI.green}`,
            padding: "1px 6px", fontSize: 10, letterSpacing: "0.1em"
          }}>● HOSTED</span>
        </span>
      </div>

      {/* card body — avatar left, frontmatter right */}
      <div style={{
        display: "grid", gridTemplateColumns: "180px 1fr", gap: 24,
        padding: "20px 22px"
      }}>
        {/* avatar column — pixel-art HC monogram */}
        <div>
          {(() => {
            const H = ["X...X", "X...X", "XXXXX", "X...X", "X...X"];
            const C = [".XXXX", "X....", "X....", "X....", ".XXXX"];
            const px = 14; // pixel size
            const Letter = ({ rows, color }) =>
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(5, ${px}px)`,
                gridTemplateRows: `repeat(5, ${px}px)`,
                gap: 2
              }}>
                {rows.flatMap((row, r) => row.split("").map((c, i) =>
                  <div key={`${r}-${i}`} style={{
                    width: px, height: px,
                    background: c === "X" ? color : "transparent"
                  }}></div>
                ))}
              </div>;

            return (
              <div
                aria-label="hc monogram"
                style={{
                  position: "relative",
                  width: "180px", height: "180px",
                  border: `1px solid ${TAI.rule}`,
                  borderRadius: 6,
                  background: TAI.bg,
                  overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 14
                }}>
                <Letter rows={H} color={TAI.ink} />
                <Letter rows={C} color={TAI.accent} />
              </div>
            );
          })()}
        </div>

        {/* frontmatter column */}
        <div>
          {/* YAML frontmatter delimiter */}
          <div style={{
            fontFamily: TAI.font, fontSize: 12, color: TAI.mute,
            paddingBottom: 8, borderBottom: `1px dashed ${TAI.rule}`,
            marginBottom: 10
          }}>---</div>

          {rows.map((r) =>
          <div key={r.k} style={{
            fontFamily: TAI.font, fontSize: 13.5, lineHeight: 1.85,
            display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "baseline"
          }}>
              <span style={{ color: TAI.cyan }}>{r.k}<span style={{ color: TAI.mute }}>:</span></span>
              <span style={{ color: r.c }}>
                {r.q && <span style={{ color: TAI.mute }}>"</span>}
                {r.v}
                {r.q && <span style={{ color: TAI.mute }}>"</span>}
              </span>
            </div>
          )}

          <div style={{
            fontFamily: TAI.font, fontSize: 12, color: TAI.mute,
            paddingTop: 8, marginTop: 4, borderTop: `1px dashed ${TAI.rule}`
          }}>---</div>

          {/* model description (after frontmatter, in HF card style) */}
          <div style={{
            marginTop: 14,
            fontFamily: TAI.font, fontSize: 12, color: TAI.lilac,
            letterSpacing: "0.04em", textTransform: "uppercase"
          }}># MODEL CARD FOR HARRYCAI/CLOUD-ARCHITECT-3.5</div>
          <p style={{
            fontFamily: TAI.sans, fontSize: 14, lineHeight: 1.6,
            color: TAI.ink, marginTop: 10, marginBottom: 0
          }}>
            A carbon-based LLM agent fine-tuned for Google Cloud, Agentic AI, and eight years of enterprise delivery. Optimized for ADK / A2A / MCP and zero-to-production pipelines.
            

            <span style={{ color: TAI.mute }}> · No known jailbreaks. Will not hallucinate references.</span>
          </p>
        </div>
      </div>
    </div>);

}

function WhoamiSection() {
  const cv = window.CV;
  return (
    <div style={{ padding: "0 26px", marginTop: 22 }}>
      <UserPrompt text="Who is Harry Cai?" />
      <ToolCall name="Bash" args='"whoami && cat ./model-card.md"' result="1 card" />

      <HFModelCard />

      {/* Claude Code's prose reply — summarising the card */}
      <div style={{
        marginTop: 18,
        fontFamily: TAI.font, fontSize: 13, lineHeight: 1.75
      }}>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ color: TAI.accent, flexShrink: 0 }}>⏺</span>
          <div style={{ flex: 1 }}>
            <p style={{
              margin: 0,
              fontFamily: TAI.sans, fontSize: 15, lineHeight: 1.65, color: TAI.ink
            }}>
              {cv.bioParagraphs[0]}
            </p>
            <p style={{
              margin: "10px 0 0",
              fontFamily: TAI.sans, fontSize: 15, lineHeight: 1.65, color: TAI.ink
            }}>
              {cv.bioParagraphs[1]}
            </p>
          </div>
        </div>
      </div>
    </div>);

}

// ── Root ──────────────────────────────────────────────────────────────────

function TerminalAI() {
  // Track which branch the user activated in prompt 7 (for status-bar flavour).
  const [activeBranch, setActiveBranch] = useStateAI(null);

  const { SkillsSection, RecentProjectsSection, CareerSection, QualificationsSection, PublicationsSection } =
  window.TAI_seq;
  const { WorkWithMeSection } = window.TAI_ask;

  return (
    <div style={{
      width: "100%", minHeight: "100%", background: TAI.bg, color: TAI.ink,
      fontFamily: TAI.font, position: "relative"
    }}>
      <WindowChrome />

      <Banner />

      <WhoamiSection />
      <SkillsSection />
      <RecentProjectsSection />
      <CareerSection />
      <QualificationsSection />
      <PublicationsSection />
      <WorkWithMeSection onBranch={setActiveBranch} />
    </div>);

}

window.TAI = TAI;
window.TAI_atoms = { UserPrompt, Thinking, ToolCall, CodeBlock, UsageFooter, Rule };
window.TerminalAI = TerminalAI;