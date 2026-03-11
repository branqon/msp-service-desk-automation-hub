"""
Generate a system architecture diagram for the MSP Service Desk Automation Hub.
Uses HTML/CSS rendered via Playwright screenshot. Light editorial style.
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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    width: 900px;
    height: 680px;
    background: #f1f0ec;
    font-family: 'Inter', -apple-system, system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  .header {
    width: 100%;
    background: #fff;
    border-bottom: 1px solid #dfdcd5;
    padding: 20px 0 16px;
    text-align: center;
  }
  .header h1 {
    font-size: 13px;
    font-weight: 600;
    color: #141414;
    letter-spacing: 0;
  }
  .header .subtitle {
    font-size: 10.5px;
    font-weight: 400;
    color: #999;
    margin-top: 3px;
  }

  .flow {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 0 20px;
    gap: 0;
    flex: 1;
  }

  .node {
    width: 440px;
    background: #fff;
    border: 1px solid #dfdcd5;
    border-radius: 6px;
    padding: 12px 18px;
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .node .icon-box {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #141414;
  }

  .node .text { text-align: left; }

  .node .label {
    font-size: 13px;
    font-weight: 600;
    color: #141414;
    line-height: 1.25;
  }

  .node .desc {
    font-size: 10.5px;
    font-weight: 400;
    color: #717171;
    margin-top: 1px;
    line-height: 1.35;
  }

  .node .step {
    position: absolute;
    top: 8px;
    right: 12px;
    font-size: 9px;
    font-weight: 500;
    color: #999;
    letter-spacing: 0.03em;
  }

  .arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 24px;
    justify-content: center;
  }
  .arrow svg { display: block; }

  .watermark {
    position: absolute;
    bottom: 10px;
    right: 18px;
    font-size: 9px;
    color: #bbb;
    letter-spacing: 0.02em;
  }
</style>
</head>
<body>

<div class="header">
  <h1>System Architecture</h1>
  <div class="subtitle">Request lifecycle &middot; MSP Service Desk Automation Hub</div>
</div>

<div class="flow">

  <div class="node">
    <div class="icon-box">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    </div>
    <div class="text">
      <div class="label">Ticket Intake UI</div>
      <div class="desc">Inbound requests, triage queue, priority tagging</div>
    </div>
    <div class="step">1</div>
  </div>

  <div class="arrow">
    <svg width="12" height="24" viewBox="0 0 12 24">
      <line x1="6" y1="0" x2="6" y2="17" stroke="#bbb" stroke-width="1" stroke-dasharray="3 2.5"/>
      <polygon points="3,16 6,23 9,16" fill="#999"/>
    </svg>
  </div>

  <div class="node">
    <div class="icon-box">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22"/>
        <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93"/>
        <circle cx="12" cy="6" r="1" fill="#fff"/>
        <path d="M5 17h14"/>
        <path d="M7 21h10"/>
      </svg>
    </div>
    <div class="text">
      <div class="label">Automation Layer</div>
      <div class="desc">Rule engine + AI-assisted recommendation engine</div>
    </div>
    <div class="step">2</div>
  </div>

  <div class="arrow">
    <svg width="12" height="24" viewBox="0 0 12 24">
      <line x1="6" y1="0" x2="6" y2="17" stroke="#bbb" stroke-width="1" stroke-dasharray="3 2.5"/>
      <polygon points="3,16 6,23 9,16" fill="#999"/>
    </svg>
  </div>

  <div class="node">
    <div class="icon-box">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>
    </div>
    <div class="text">
      <div class="label">SLA Router</div>
      <div class="desc">Priority-based routing, escalation timers, SLA enforcement</div>
    </div>
    <div class="step">3</div>
  </div>

  <div class="arrow">
    <svg width="12" height="24" viewBox="0 0 12 24">
      <line x1="6" y1="0" x2="6" y2="17" stroke="#bbb" stroke-width="1" stroke-dasharray="3 2.5"/>
      <polygon points="3,16 6,23 9,16" fill="#999"/>
    </svg>
  </div>

  <div class="node">
    <div class="icon-box">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9,12 11,14 15,10"/>
      </svg>
    </div>
    <div class="text">
      <div class="label">Approval Gate</div>
      <div class="desc">Manager review, policy checks, change approval workflow</div>
    </div>
    <div class="step">4</div>
  </div>

  <div class="arrow">
    <svg width="12" height="24" viewBox="0 0 12 24">
      <line x1="6" y1="0" x2="6" y2="17" stroke="#bbb" stroke-width="1" stroke-dasharray="3 2.5"/>
      <polygon points="3,16 6,23 9,16" fill="#999"/>
    </svg>
  </div>

  <div class="node">
    <div class="icon-box">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
    <div class="step">5</div>
  </div>

  <div class="arrow">
    <svg width="12" height="24" viewBox="0 0 12 24">
      <line x1="6" y1="0" x2="6" y2="17" stroke="#bbb" stroke-width="1" stroke-dasharray="3 2.5"/>
      <polygon points="3,16 6,23 9,16" fill="#999"/>
    </svg>
  </div>

  <div class="node">
    <div class="icon-box">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
    <div class="step">6</div>
  </div>

</div>

<div class="watermark">MSP Automation Hub</div>

</body>
</html>"""


def main():
    tmp = tempfile.NamedTemporaryFile(suffix=".html", delete=False, mode="w", encoding="utf-8")
    tmp.write(HTML_CONTENT)
    tmp.close()
    tmp_path = tmp.name

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(
                viewport={"width": 900, "height": 680},
                device_scale_factor=2,
            )
            page.goto(f"file:///{tmp_path.replace(os.sep, '/')}")
            page.wait_for_load_state("networkidle")

            OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(OUTPUT_PATH), full_page=False)
            browser.close()

        print(f"Diagram saved to {OUTPUT_PATH}  ({OUTPUT_PATH.stat().st_size:,} bytes)")
    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    main()
