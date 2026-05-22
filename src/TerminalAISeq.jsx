// Sections 2-6 of harryc.ai.
// /skills · gcloud run services list · mcp__bigquery · kubectl get certificates · Read(publications)
//
// Each section: visitor prompt → thinking → tool call → rendered output → usage footer.

const { useState: useStateS, useEffect: useEffectS } = React;
const TAI_S = window.TAI;
const { UserPrompt, Thinking, ToolCall, CodeBlock, UsageFooter, Rule } = window.TAI_atoms;

// Per-company logo-mark — small distinct shape + literal brand hex, used as
// a tiny "logo" beside the company name and as the dot on the timeline.
// Within each role the bullet list itself stays uniform (single accent).
const COMPANY_BRAND = {
  "Datatonic":      { color: "#3D8BFF", glyph: "+" },
  "Digital Genius": { color: "#A66EFC", glyph: "◗" },
  "Vodafone":       { color: "#E60000", glyph: "●" },
  "Autodesk":       { color: "#3CC3F0", glyph: "▲" },
};
const brandOf = (company) => COMPANY_BRAND[company] || { color: TAI_S.cyan, glyph: "▸" };

// ── Prompt 2 · /skills ────────────────────────────────────────────────────

function SkillsSection() {
  const cv = window.CV;
  const total = cv.skills.reduce((a, g) => a + g.items.length, 0);

  // Tiny icons per group — single ASCII glyph each, deliberately restrained.
  const glyph = (label) => {
    if (label.startsWith("AI")) return "✻";
    if (label.startsWith("Models")) return "◆";
    if (label.startsWith("ML")) return "▲";
    if (label.startsWith("Cloud")) return "◇";
    return "•";
  };

  return (
    <div className="hc-sec" style={{ padding: "0 26px", marginTop: 22 }}>
      <UserPrompt text="What are his skills?" />
      <ToolCall name="SlashCommand" args='"/skills --grouped"' result={`${cv.skills.length} groups`} />

      <div style={{ marginTop: 14,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 12
      }}>
        {cv.skills.map((g, i) =>
        <div key={i} style={{
          border: `1px solid ${TAI_S.rule}`,
          background: TAI_S.card,
          padding: "14px 16px"
        }}>
            <div style={{
            display: "flex", alignItems: "baseline", gap: 8,
            marginBottom: 12, paddingBottom: 8,
            borderBottom: `1px dashed ${TAI_S.rule}`
          }}>
              <span style={{ color: TAI_S.accent, fontSize: 14 }}>{glyph(g.label)}</span>
              <span style={{
              fontFamily: TAI_S.font, fontSize: 12, color: TAI_S.ink,
              textTransform: "uppercase", letterSpacing: "0.14em"
            }}>{g.label}</span>
              <span style={{ flex: 1 }} />
              <span style={{
              fontFamily: TAI_S.font, fontSize: 10.5, color: TAI_S.mute
            }}>{g.items.length}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {g.items.map((it, j) => {
              // Highlight marquee tags across groups with the magenta border.
              const MARQUEE = new Set([
                "Agentic AI", "ADK", "MCP", "A2A", "AI Safety",
                "Agent Platform", "Gemini",
                "Google Cloud",
                "Python",
              ]);
              const star = MARQUEE.has(it);
              return (
                <span key={j} style={{
                  fontFamily: TAI_S.font, fontSize: 12,
                  color: star ? TAI_S.accent : TAI_S.ink,
                  border: `1px solid ${star ? TAI_S.accent : TAI_S.rule}`,
                  padding: "3px 9px",
                  background: star ? "rgba(255,123,170,0.05)" : TAI_S.paper,
                  borderRadius: 2
                }}>{it}</span>);

            })}
            </div>
          </div>
        )}
      </div>
    </div>);

}

// ── Prompt 3 · $ gcloud run services list ─────────────────────────────────

function RecentProjectsSection() {
  const cv = window.CV;
  const projects = cv.recentProjects;

  // Faux gcloud table output. Realistic columns.
  const tableHeader = `SERVICE              REGION         URL                          SERVING`;
  const tableRows = projects.map((p) => {
    const parts = p.region.split("-");
    const code = (parts[0][0] + (parts[1] ? parts[1][0] : "")).toLowerCase();
    const url = `https://***-${code}.a.run.app`;
    return `${p.service.padEnd(20)} ${p.region.padEnd(14)} ${url.padEnd(28)} ✓`;
  }).join("\n");

  return (
    <div className="hc-sec" style={{ padding: "0 26px", marginTop: 22 }}>
      <UserPrompt text="What has he been working on recently?" />
      <ToolCall name="Bash" args='"gcloud run services list"' result={`${projects.length} services`} />

      <CodeBlock prompt="gcloud run services list" content={`${tableHeader}\n${"─".repeat(tableHeader.length)}\n${tableRows}`} />

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {projects.map((p, i) =>
        <div key={i} style={{
          background: TAI_S.card, border: `1px solid ${TAI_S.rule}`,
          display: "grid", gridTemplateColumns: "1fr"
        }}>
            {/* header strip */}
            <div style={{
            padding: "10px 16px", borderBottom: `1px solid ${TAI_S.rule}`,
            background: TAI_S.paper,
            display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center",
            fontFamily: TAI_S.font, fontSize: 12
          }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <span style={{ color: TAI_S.green, fontSize: 11 }}>●</span>
                <span style={{ color: TAI_S.accent, fontWeight: 600 }}>{p.service}</span>
                <span style={{ color: TAI_S.mute }}>·</span>
                <span style={{ color: TAI_S.inkSoft }}>{p.project}</span>
                <span style={{ color: TAI_S.mute }}>·</span>
                <span style={{ color: TAI_S.cyan }}>{p.region}</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", color: TAI_S.mute, fontSize: 11 }}>
                <span style={{ color: TAI_S.green }}>{p.traffic} traffic</span>
              </div>
            </div>

            {/* body */}
            <div style={{ padding: "16px 18px" }}>
              <div style={{
              fontFamily: TAI_S.sans, fontSize: 18, color: TAI_S.ink, fontWeight: 600,
              marginBottom: 8
            }}>{p.headline}</div>
              <p style={{
              margin: "0 0 12px",
              fontFamily: TAI_S.sans, fontSize: 14, lineHeight: 1.6,
              color: TAI_S.inkSoft
            }}>{p.blurb}</p>

              <div style={{
              display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center"
            }}>
                <span style={{
                fontFamily: TAI_S.font, fontSize: 10.5, color: TAI_S.mute,
                textTransform: "uppercase", letterSpacing: "0.14em",
                marginRight: 4
              }}>stack</span>
                {p.stack.map((t, j) =>
              <span key={j} style={{
                fontFamily: TAI_S.font, fontSize: 11.5,
                color: TAI_S.ink,
                border: `1px solid ${TAI_S.rule}`, padding: "2px 8px",
                background: TAI_S.paper
              }}>{t}</span>
              )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>);

}

// ── Prompt 4 · mcp__bigquery__query ───────────────────────────────────────

function CareerSection() {
  const cv = window.CV;
  const rows = cv.careerRows;

  // SQL output — like BigQuery CLI / `bq query` output.
  const sqlQuery = `SELECT * FROM \`harry-cai-careers.career.experience\`\nORDER BY start_date DESC\nLIMIT 5;`;
  const bqHeader = `+------------+------------+------------------+-----------------------------------+-------------+`;
  const bqColumns = `| start_date | end_date   | company          | role                              | location    |`;
  const fmtDate = (d) => d || "NULL      ";
  const bqRows = rows.slice().reverse().map((r) =>
  `| ${fmtDate(r.start_date)} | ${fmtDate(r.end_date)} | ${r.company.padEnd(16)} | ${r.role.padEnd(33)} | ${r.location.padEnd(11)} |`
  ).join("\n");
  const bqTable = `${bqHeader}\n${bqColumns}\n${bqHeader}\n${bqRows}\n${bqHeader}`;

  // Compute a normalized timeline from start_date to NOW for the timeline visual.
  const parse = (d) => d ? new Date(d).getTime() : Date.now();
  const minT = parse(rows[0].start_date);
  const maxT = Date.now();
  const span = maxT - minT;
  const pct = (t) => (t - minT) / span * 100;

  return (
    <div className="hc-sec" style={{ padding: "0 26px", marginTop: 22 }}>
      <UserPrompt text="What's his full career history?" />

      {/* MCP connection banner — distinct visual treatment */}
      <div className="hc-mcp" style={{
        margin: "8px 0",
        padding: "8px 14px",
        background: "rgba(105, 210, 232, 0.06)",
        border: `1px solid ${TAI_S.cyan}40`,
        fontFamily: TAI_S.font, fontSize: 12, color: TAI_S.inkSoft,
        display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center"
      }}>
        <span style={{ color: TAI_S.cyan }}>◊ MCP</span>
        <span style={{ color: TAI_S.mute }}>│</span>
        <span>Connected to <span style={{ color: TAI_S.ink }}>harry-cai-career-experience.bigquery</span></span>
        <span style={{ color: TAI_S.mute }}>·</span>
        <span><span style={{ color: TAI_S.amber }}>1</span> table</span>
        <span style={{ color: TAI_S.mute }}>·</span>
        <span><span style={{ color: TAI_S.amber }}>1.2 TB</span> indexed</span>
        <span style={{ color: TAI_S.mute }}>·</span>
        <span style={{ color: TAI_S.green }}>● ready</span>
      </div>

      <ToolCall
        name="mcp__bigquery__query"
        args={`query="SELECT * FROM \\\`harry.experience\\\` ORDER BY start_date DESC LIMIT 5"`}
        result={`${rows.length} rows`} />
      

      {/* SQL block with syntax-coloured keywords */}
      <div style={{
        margin: "10px 0 8px", padding: "12px 14px",
        background: "#0A0910", border: `1px solid ${TAI_S.rule}`,
        fontFamily: TAI_S.font, fontSize: 12.5, lineHeight: 1.6
      }}>
        <div style={{
          color: TAI_S.mute, fontSize: 11, letterSpacing: "0.02em",
          marginBottom: 6, paddingBottom: 6,
          borderBottom: `1px dashed ${TAI_S.rule}`,
          display: "flex", justifyContent: "space-between"
        }}>
          <span><span style={{ color: TAI_S.accent }}>$</span> bq query --use_legacy_sql=false</span>
        </div>
        <pre style={{ margin: 0, whiteSpace: "pre", fontFamily: TAI_S.font, fontSize: 12.5, color: TAI_S.ink }}>
          <span style={{ color: TAI_S.lilac }}>SELECT</span>{" "}
          <span style={{ color: TAI_S.amber }}>*</span>{"\n"}
          <span style={{ color: TAI_S.lilac }}>FROM</span>{" "}
          <span style={{ color: TAI_S.green }}>{"`harry-cai-careers.career.experience`"}</span>{"\n"}
          <span style={{ color: TAI_S.lilac }}>ORDER BY</span>{" "}
          <span style={{ color: TAI_S.cyan }}>start_date</span>{" "}
          <span style={{ color: TAI_S.lilac }}>DESC</span>{"\n"}
          <span style={{ color: TAI_S.lilac }}>LIMIT</span>{" "}
          <span style={{ color: TAI_S.amber }}>5</span>
          <span style={{ color: TAI_S.mute }}>;</span>
        </pre>
        <pre style={{ margin: "10px 0 0", whiteSpace: "pre", fontFamily: TAI_S.font, fontSize: 11.5, lineHeight: 1.5, color: TAI_S.inkSoft }}>{bqTable}</pre>
      </div>

      {/* Pretty rendered timeline */}
      <div style={{
        marginTop: 14,
        padding: "24px 22px 20px",
        background: TAI_S.card,
        border: `1px solid ${TAI_S.rule}`
      }}>
        {/* horizontal axis */}
        <div style={{ position: "relative", marginBottom: 26 }}>
          <div style={{
            height: 2, background: TAI_S.rule, position: "relative"
          }}>
            {rows.map((r, i) => {
              const x = pct(parse(r.start_date));
              const brand = brandOf(r.company);
              return (
                <span key={i} style={{
                  position: "absolute", left: `${x}%`, top: "50%",
                  transform: "translate(-50%, -50%)",
                  color: brand.color,
                  fontFamily: TAI_S.font,
                  fontSize: 16, lineHeight: 1,
                  // Tiny halo so the glyph sits cleanly over the axis line
                  textShadow: `0 0 0 ${TAI_S.bg}, 2px 0 0 ${TAI_S.bg}, -2px 0 0 ${TAI_S.bg}`,
                  background: TAI_S.card,
                  padding: "0 3px"
                }}>{brand.glyph}</span>);

            })}
            {/* current position marker (right edge) */}
            <span style={{
              position: "absolute", right: 0, top: -6,
              width: 14, height: 14, borderRadius: "50%",
              background: TAI_S.accent, opacity: 0.25,
              transform: "translateX(50%)"
            }} />
          </div>
          {/* year ticks */}
          <div style={{ position: "relative", marginTop: 8 }}>
            {["2018", "2020", "2022", "2024", "now"].map((y, i) =>
            <span key={y} style={{
              position: "absolute", left: `${[0, 28, 56, 80, 100][i]}%`,
              top: 0, transform: "translateX(-50%)",
              fontFamily: TAI_S.font, fontSize: 10, color: TAI_S.mute,
              letterSpacing: "0.1em"
            }}>{y}</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
          {cv.experience.map((r, i) => {
          const brand = brandOf(r.company);
          return (
          <div key={i} className="hc-career-row" style={{
            display: "grid", gridTemplateColumns: "180px 1fr",
            gap: 18, padding: "12px 0",
            borderTop: i > 0 ? `1px dashed ${TAI_S.rule}` : "none"
          }}>
              <div>
                <div style={{
                fontFamily: TAI_S.font, fontSize: 11, color: TAI_S.amber,
                letterSpacing: "0.04em"
              }}>{r.dates}</div>
                <div style={{
                fontFamily: TAI_S.font, fontSize: 10.5, color: TAI_S.mute,
                marginTop: 2
              }}>{r.location}</div>
              </div>
              <div>
                <div style={{
                display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap",
                marginBottom: r.blurb ? 6 : 8
              }}>
                  {/* Company logo-mark — brand glyph in brand colour, sits where a logo would */}
                  <span aria-hidden="true" style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 18, minWidth: 18,
                  color: brand.color,
                  fontFamily: TAI_S.font, fontSize: 16, lineHeight: 1,
                  transform: "translateY(2px)"
                }}>{brand.glyph}</span>
                  <span style={{ fontFamily: TAI_S.font, fontSize: 17, color: brand.color, fontWeight: 600 }}>{r.company}</span>
                  <span style={{ color: TAI_S.mute }}>—</span>
                  <span style={{ fontFamily: TAI_S.font, fontSize: 13.5, color: TAI_S.inkSoft }}>{r.role}</span>
                </div>
                {r.blurb &&
              <p style={{
                margin: "0 0 8px",
                fontFamily: TAI_S.sans, fontSize: 13.5, lineHeight: 1.55,
                color: TAI_S.inkSoft
              }}>{r.blurb}</p>
              }
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {r.bullets.map((b, j) =>
                <li key={j} style={{
                  fontFamily: TAI_S.sans, fontSize: 13, lineHeight: 1.5,
                  color: TAI_S.ink, padding: "2px 0 2px 18px",
                  position: "relative"
                }}>
                      <span style={{
                    position: "absolute", left: 0, top: 2,
                    color: TAI_S.ink, fontFamily: TAI_S.font, fontSize: 12,
                    lineHeight: 1.5
                  }}>▸</span>
                      {b}
                    </li>
                )}
                </ul>
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </div>);

}

// ── Prompt 5 · $ kubectl get certificates -n credentials ──────────────────

function QualificationsSection() {
  const cv = window.CV;

  // Sort certs by date most-recent first.
  const sortedCerts = cv.certifications.slice().sort((a, b) => certDate(b.date) - certDate(a.date));
  // Education already most-recent-first in data.js.
  const sortedEdu = cv.education;

  // Merge degrees + certs into kubectl-style resources.
  // Each gets a grade where one exists (degrees, mostly); certs are pass/fail.
  const parseGrade = (degree) => {
    // "MSc Computing (AI & ML), Distinction" → "Distinction"
    const idx = degree.lastIndexOf(",");
    return idx > -1 ? degree.slice(idx + 1).trim() : "";
  };
  const resources = [
  ...sortedEdu.map((e) => ({
    name: e.institution.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    kind: "Degree",
    issuer: e.institution,
    grade: e.degree,
    gradeShort: parseGrade(e.degree) || "—",
    awarded: gradYear(e.dates),
    ts: e.dates,
    note: e.note
  })).slice(0, 2),
  ...sortedCerts.map((c) => ({
    name: certSlug(c.name),
    kind: "Certificate",
    issuer: c.issuer,
    grade: c.name,
    gradeShort: "Pass",
    awarded: c.date,
    ts: c.date,
    note: null
  }))];


  // kubectl-style table: GRADE + AWARDED columns replace READY/STATUS/AGE.
  const kubeHeader = `NAME                              GRADE         AWARDED    ISSUER`;
  const kubeBody = resources.map((r) =>
  `${r.name.padEnd(33)} ${r.gradeShort.padEnd(13)} ${r.awarded.padEnd(10)} ${r.issuer}`
  ).join("\n");

  return (
    <div className="hc-sec" style={{ padding: "0 26px", marginTop: 22 }}>
      <UserPrompt text="What are his qualifications?" />
      <ToolCall name="Bash" args='"kubectl get certificates"' result={`${resources.length} resources`} />

      <CodeBlock prompt="kubectl get certificates" content={`${kubeHeader}\n${kubeBody}`} />

      <div className="hc-qual-grid" style={{
        marginTop: 14,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12
      }}>
        {resources.map((r, i) =>
        <div key={i} style={{
          background: TAI_S.card, border: `1px solid ${TAI_S.rule}`,
          padding: "14px 16px",
          display: "flex", flexDirection: "column", gap: 8
        }}>
            <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontFamily: TAI_S.font, fontSize: 10.5,
            color: TAI_S.mute, letterSpacing: "0.14em", textTransform: "uppercase"
          }}>
              <span>{r.kind}</span>
              {(() => {
              const g = r.gradeShort;
              const isTop = /distinction|1st|first/i.test(g);
              const isNone = g === "—";
              const c = isTop ? "#2FB36B" : isNone ? TAI_S.mute : TAI_S.green;
              return (
                <span style={{
                  color: c, border: `1px solid ${c}`,
                  padding: "1px 6px", fontSize: 10, letterSpacing: "0.16em"
                }}>● {g}</span>);

            })()}
            </div>
            <div style={{
            fontFamily: TAI_S.sans, fontSize: 15, color: TAI_S.ink, fontWeight: 600,
            lineHeight: 1.35
          }}>{r.grade}</div>
            <div style={{
            fontFamily: TAI_S.font, fontSize: 12, color: TAI_S.inkSoft
          }}>
              <span style={{ color: TAI_S.cyan }}>issuer:</span> {r.issuer}
              <span style={{ color: TAI_S.mute }}> · </span>
              <span style={{ color: TAI_S.cyan }}>awarded:</span> {r.awarded}
            </div>
          </div>
        )}
      </div>
    </div>);

}

function certDate(d) {
  // "Oct 2025" → ms
  const m = d.match(/(\w{3})\s*(\d{4})/);
  if (!m) return 0;
  const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  return new Date(parseInt(m[2]), months[m[1]] || 0).getTime();
}

function certSlug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function yearsSince(dates) {
  // "2019 — 2020" or "2015 — 2018" → "Xy"
  const m = dates.match(/(\d{4})\s*[—-]\s*(\d{4})/);
  if (!m) return "—";
  const yrs = new Date().getFullYear() - parseInt(m[2]);
  return `${yrs}y`;
}

function gradYear(dates) {
  // Degrees end in September. "2019 — 2020" → "Sep 2020".
  const m = dates.match(/(\d{4})\s*[—-]\s*(\d{4})/);
  if (m) return `Sep ${m[2]}`;
  return dates;
}

function monthsSince(date) {
  // "Oct 2025"
  const m = date.match(/(\w{3})\s*(\d{4})/);
  if (!m) return "—";
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const then = new Date(parseInt(m[2]), months[m[1]] || 0);
  const diff = (new Date().getFullYear() - then.getFullYear()) * 12 + (new Date().getMonth() - then.getMonth());
  if (diff >= 12) return `${Math.floor(diff / 12)}y`;
  return `${Math.max(diff, 0)}mo`;
}

// ── Prompt 6 · Read(publications/ieee-2020.md) ────────────────────────────

function PublicationsSection() {
  const cv = window.CV;
  const p = cv.publications[0];
  const key = `cai${p.year}`;

  return (
    <div className="hc-sec" style={{ padding: "0 26px", marginTop: 22 }}>
      <UserPrompt text="Does he have any published research?" />
      <ToolCall name="Read" args='"publications.bib"' result={`1 paper`} />

      {/* Citation card */}
      <div style={{
        marginTop: 14,
        border: `1px solid ${TAI_S.rule}`,
        background: TAI_S.card,
        display: "grid", gridTemplateColumns: "auto 1fr", gap: 0
      }}>
        {/* Venue ribbon */}
        <div className="hc-pub-spine" style={{
          padding: "0 8px",
          background: "#0A0910",
          borderRight: `1px solid ${TAI_S.rule}`,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            transform: "rotate(-90deg)",
            fontFamily: TAI_S.font, fontSize: 11,
            color: TAI_S.amber, letterSpacing: "0.3em",
            whiteSpace: "nowrap",
            textTransform: "uppercase"
          }}>IEEE · {p.year}</div>
        </div>

        {/* body */}
        <div className="hc-pub-body" style={{ padding: "18px 22px" }}>
          <div style={{
            fontFamily: TAI_S.sans, fontSize: 18, lineHeight: 1.35,
            color: TAI_S.ink, fontWeight: 600,
            marginBottom: 10
          }}>{p.title}</div>

          <div style={{
            fontFamily: TAI_S.sans, fontSize: 13.5, color: TAI_S.inkSoft,
            marginBottom: 10, lineHeight: 1.55
          }}>
            <span style={{ color: TAI_S.cyan }}>Cai, H.</span>, et&nbsp;al.{" "}
            <span style={{ color: TAI_S.mute }}>·</span>{" "}
            <span style={{ color: TAI_S.ink }}>{p.venue}</span>{" "}
            <span style={{ color: TAI_S.mute }}>·</span>{" "}
            {p.year}
          </div>

          <div style={{
            display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14
          }}>
            <Pill label="DOI" value={p.doi} color={TAI_S.cyan} />
            <Pill label="arXiv" value={p.arxiv} color={TAI_S.amber} />
            <Pill label="Affil." value={p.affiliation} color={TAI_S.lilac} long />
          </div>

          {/* BibTeX excerpt */}
          <pre style={{
            margin: 0,
            background: TAI_S.bg, border: `1px dashed ${TAI_S.rule}`,
            padding: "10px 12px",
            fontFamily: TAI_S.font, fontSize: 11.5, lineHeight: 1.55,
            color: TAI_S.inkSoft,
            overflowX: "auto", whiteSpace: "pre"
          }}>
            <span style={{ color: TAI_S.lilac }}>@inproceedings</span>{"{"}<span style={{ color: TAI_S.amber }}>{key}</span>,{"\n"}
            {"  "}<span style={{ color: TAI_S.cyan }}>title</span>     = {`{${p.title}}`},{"\n"}
            {"  "}<span style={{ color: TAI_S.cyan }}>author</span>    = {`{Cai, Harry and Rueckert, Daniel and Passerat-Palmbach, Jonathan}`},{"\n"}
            {"  "}<span style={{ color: TAI_S.cyan }}>booktitle</span> = {`{${p.venue}}`},{"\n"}
            {"  "}<span style={{ color: TAI_S.cyan }}>year</span>      = {`{${p.year}}`},{"\n"}
            {"  "}<span style={{ color: TAI_S.cyan }}>publisher</span> = {`{IEEE}`},{"\n"}
            {"  "}<span style={{ color: TAI_S.cyan }}>doi</span>       = {`{${p.doi}}`},{"\n"}
            {"}"}
          </pre>
        </div>
      </div>
    </div>);

}

function Pill({ label, value, color, long }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "baseline", gap: 6,
      fontFamily: TAI_S.font, fontSize: 11.5,
      border: `1px solid ${TAI_S.rule}`,
      padding: "3px 9px",
      background: TAI_S.paper,
      maxWidth: long ? 320 : "none"
    }}>
      <span style={{ color: TAI_S.mute, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 10 }}>{label}</span>
      <span style={{ color }}>{value}</span>
    </span>);

}

window.TAI_seq = { SkillsSection, RecentProjectsSection, CareerSection, QualificationsSection, PublicationsSection };