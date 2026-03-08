"""
Generate a polished system architecture diagram for the MSP Service Desk Automation Hub.
Uses HTML/CSS rendered via Playwright screenshot.
"""

import os
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

DOCS_DIR = Path(__file__).resolve().parent.parent / "docs"
OUTPUT_PATH = DOCS_DIR / "system-architecture.png"

HTML_CONTENT = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=900">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    width: 900px;
    height: 700px;
    background: #eef4f7;
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ── header band ── */
  .header {
    width: 100%;
    background: linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%);
    padding: 22px 0 18px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 15% 50%, rgba(255,255,255,0.08) 0%, transparent 50%),
      radial-gradient(circle at 85% 40%, rgba(255,255,255,0.06) 0%, transparent 45%);
  }
  .header h1 {
    font-size: 19px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.5px;
    position: relative;
    text-shadow: 0 1px 2px rgba(0,0,0,0.15);
  }
  .header .subtitle {
    font-size: 11.5px;
    font-weight: 400;
    color: rgba(255,255,255,0.82);
    margin-top: 3px;
    letter-spacing: 0.3px;
    position: relative;
  }

  /* ── flow container ── */
  .flow {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 0 20px;
    gap: 0;
    flex: 1;
  }

  /* ── node card ── */
  .node {
    width: 380px;
    background: #fff;
    border: 1px solid rgba(15,118,110,0.13);
    border-radius: 12px;
    padding: 15px 24px;
    text-align: center;
    position: relative;
    box-shadow:
      0 1px 3px rgba(15,118,110,0.06),
      0 4px 12px rgba(15,118,110,0.04);
    transition: box-shadow 0.2s;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .node .icon-box {
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #fff;
  }

  .node .text {
    text-align: left;
  }

  .node .label {
    font-size: 14.5px;
    font-weight: 650;
    color: #1e293b;
    line-height: 1.25;
  }

  .node .desc {
    font-size: 10.5px;
    font-weight: 400;
    color: #64748b;
    margin-top: 2px;
    line-height: 1.35;
  }

  /* icon‑box colours per node */
  .node:nth-child(1)  .icon-box { background: linear-gradient(135deg, #0f766e, #14b8a6); }
  .node:nth-child(3)  .icon-box { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
  .node:nth-child(5)  .icon-box { background: linear-gradient(135deg, #2563eb, #60a5fa); }
  .node:nth-child(7)  .icon-box { background: linear-gradient(135deg, #ea580c, #fb923c); }
  .node:nth-child(9)  .icon-box { background: linear-gradient(135deg, #0369a1, #38bdf8); }
  .node:nth-child(11) .icon-box { background: linear-gradient(135deg, #16a34a, #4ade80); }

  /* ── arrow connector ── */
  .arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 32px;
    justify-content: center;
    position: relative;
  }
  .arrow svg {
    display: block;
  }

  /* ── subtle watermark ── */
  .watermark {
    position: absolute;
    bottom: 10px;
    right: 18px;
    font-size: 9px;
    color: rgba(100,116,139,0.45);
    letter-spacing: 0.3px;
  }
</style>
</head>
<body>

<div class="header">
  <h1>MSP Service Desk Automation Hub</h1>
  <div class="subtitle">System Architecture &middot; Request Lifecycle</div>
</div>

<div class="flow">

  <!-- 1 ─ Ticket Intake UI -->
  <div class="node">
    <div class="icon-box">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    </div>
    <div class="text">
      <div class="label">Ticket Intake UI</div>
      <div class="desc">Inbound requests, triage queue, priority tagging</div>
    </div>
  </div>

  <!-- arrow -->
  <div class="arrow">
    <svg width="16" height="32" viewBox="0 0 16 32">
      <line x1="8" y1="0" x2="8" y2="24" stroke="#0f766e" stroke-width="2" stroke-dasharray="4 3" opacity="0.45"/>
      <polygon points="3,22 8,30 13,22" fill="#0f766e" opacity="0.55"/>
    </svg>
  </div>

  <!-- 2 ─ Automation Layer -->
  <div class="node">
    <div class="icon-box">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22"/>
        <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93"/>
        <circle cx="12" cy="6" r="1" fill="#fff"/>
        <path d="M5 17h14" />
        <path d="M7 21h10" />
      </svg>
    </div>
    <div class="text">
      <div class="label">Automation Layer</div>
      <div class="desc">Rule engine + AI-powered recommendation engine</div>
    </div>
  </div>

  <!-- arrow -->
  <div class="arrow">
    <svg width="16" height="32" viewBox="0 0 16 32">
      <line x1="8" y1="0" x2="8" y2="24" stroke="#0f766e" stroke-width="2" stroke-dasharray="4 3" opacity="0.45"/>
      <polygon points="3,22 8,30 13,22" fill="#0f766e" opacity="0.55"/>
    </svg>
  </div>

  <!-- 3 ─ SLA Router -->
  <div class="node">
    <div class="icon-box">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>
    </div>
    <div class="text">
      <div class="label">SLA Router</div>
      <div class="desc">Priority-based routing, escalation timers, SLA enforcement</div>
    </div>
  </div>

  <!-- arrow -->
  <div class="arrow">
    <svg width="16" height="32" viewBox="0 0 16 32">
      <line x1="8" y1="0" x2="8" y2="24" stroke="#0f766e" stroke-width="2" stroke-dasharray="4 3" opacity="0.45"/>
      <polygon points="3,22 8,30 13,22" fill="#0f766e" opacity="0.55"/>
    </svg>
  </div>

  <!-- 4 ─ Approval Gate -->
  <div class="node">
    <div class="icon-box">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9,12 11,14 15,10"/>
      </svg>
    </div>
    <div class="text">
      <div class="label">Approval Gate</div>
      <div class="desc">Manager review, policy checks, change approval workflow</div>
    </div>
  </div>

  <!-- arrow -->
  <div class="arrow">
    <svg width="16" height="32" viewBox="0 0 16 32">
      <line x1="8" y1="0" x2="8" y2="24" stroke="#0f766e" stroke-width="2" stroke-dasharray="4 3" opacity="0.45"/>
      <polygon points="3,22 8,30 13,22" fill="#0f766e" opacity="0.55"/>
    </svg>
  </div>

  <!-- 5 ─ Workflow History -->
  <div class="node">
    <div class="icon-box">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    </div>
    <div class="text">
      <div class="label">Workflow History</div>
      <div class="desc">Audit trail, execution logs, status tracking</div>
    </div>
  </div>

  <!-- arrow -->
  <div class="arrow">
    <svg width="16" height="32" viewBox="0 0 16 32">
      <line x1="8" y1="0" x2="8" y2="24" stroke="#0f766e" stroke-width="2" stroke-dasharray="4 3" opacity="0.45"/>
      <polygon points="3,22 8,30 13,22" fill="#0f766e" opacity="0.55"/>
    </svg>
  </div>

  <!-- 6 ─ Metrics + Reporting -->
  <div class="node">
    <div class="icon-box">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    </div>
    <div class="text">
      <div class="label">Metrics + Reporting</div>
      <div class="desc">KPI dashboards, SLA compliance, automation ROI</div>
    </div>
  </div>

</div>

<div class="watermark">MSP Automation Hub &middot; Architecture v1.0</div>

</body>
</html>"""


def main():
    # Write HTML to a temp file
    tmp = tempfile.NamedTemporaryFile(suffix=".html", delete=False, mode="w", encoding="utf-8")
    tmp.write(HTML_CONTENT)
    tmp.close()
    tmp_path = tmp.name

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(
                viewport={"width": 900, "height": 700},
                device_scale_factor=2,
            )
            page.goto(f"file:///{tmp_path.replace(os.sep, '/')}")
            page.wait_for_load_state("networkidle")

            # Ensure output directory exists
            OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

            page.screenshot(path=str(OUTPUT_PATH), full_page=False)
            browser.close()

        print(f"Diagram saved to {OUTPUT_PATH}  ({OUTPUT_PATH.stat().st_size:,} bytes)")
    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    main()
