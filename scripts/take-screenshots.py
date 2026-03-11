"""Capture portfolio screenshots for docs/screenshots/."""

from playwright.sync_api import sync_playwright
import os

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "..", "docs", "screenshots")
BASE_URL = "http://127.0.0.1:3000"
VIEWPORT = {"width": 1440, "height": 900}


def wait_for_styled(page):
    """Wait until CSS is loaded and the page has styled content."""
    page.wait_for_load_state("domcontentloaded")
    page.wait_for_load_state("networkidle")
    # Wait for Tailwind styles to be applied - check for a styled element
    page.wait_for_timeout(2000)


def main():
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport=VIEWPORT,
            device_scale_factor=2,
        )
        page = context.new_page()

        # Skip console logging — Unicode arrows in Next.js output crash cp1252 on Windows

        # Dashboard - first load may be slow
        response = page.goto(f"{BASE_URL}/", wait_until="networkidle")
        print(f"  dashboard status: {response.status}")
        wait_for_styled(page)

        # Check if CSS loaded by inspecting computed style
        bg = page.evaluate("window.getComputedStyle(document.body).backgroundColor")
        print(f"  body background: {bg}")

        page.screenshot(
            path=os.path.join(SCREENSHOTS_DIR, "dashboard.png"),
            full_page=False,
        )
        print("  captured dashboard")

        # Tickets workbench - navigate to first ticket detail
        page.goto(f"{BASE_URL}/tickets", wait_until="networkidle")
        wait_for_styled(page)
        # Match ticket detail links (numeric IDs) but not /tickets/new
        first_ticket = page.locator('main a[href^="/tickets/"]').first
        ticket_href = first_ticket.get_attribute("href") if first_ticket.count() > 0 else None
        if ticket_href and ticket_href != "/tickets/new":
            page.goto(f"{BASE_URL}{ticket_href}", wait_until="networkidle")
            wait_for_styled(page)
        page.screenshot(
            path=os.path.join(SCREENSHOTS_DIR, "tickets-workbench.png"),
            full_page=False,
        )
        print("  captured tickets-workbench")

        # Automation opportunities
        page.goto(f"{BASE_URL}/automation-opportunities", wait_until="networkidle")
        wait_for_styled(page)
        page.screenshot(
            path=os.path.join(SCREENSHOTS_DIR, "automation-opportunities.png"),
            full_page=False,
        )
        print("  captured automation-opportunities")

        # Approvals center
        page.goto(f"{BASE_URL}/approvals", wait_until="networkidle")
        wait_for_styled(page)
        page.screenshot(
            path=os.path.join(SCREENSHOTS_DIR, "approvals-center.png"),
            full_page=False,
        )
        print("  captured approvals-center")

        browser.close()
    print("done")


if __name__ == "__main__":
    main()
