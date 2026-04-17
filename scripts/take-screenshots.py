"""Capture portfolio screenshots for docs/screenshots/.

Set BASE_URL env var to override the default target (http://127.0.0.1:3000).
"""

from playwright.sync_api import sync_playwright
import os

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "..", "docs", "screenshots")
BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000")
VIEWPORT = {"width": 1440, "height": 900}


def wait_for_styled(page):
    """Wait until CSS is loaded and the page has styled content."""
    page.wait_for_load_state("domcontentloaded")
    page.wait_for_load_state("networkidle")
    # Wait for Tailwind styles to be applied - check for a styled element
    page.wait_for_timeout(2000)


def new_context(p):
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        viewport=VIEWPORT,
        device_scale_factor=2,
    )
    context.add_init_script(
        "try { window.localStorage.setItem('msp-theme', 'light'); } catch (e) {}"
    )
    return browser, context


def capture_light(page):
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
    first_ticket = page.locator('main ul li a[href^="/tickets/"]').first
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


def main():
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

    with sync_playwright() as p:
        browser, context = new_context(p)
        capture_light(context.new_page())
        browser.close()
    print("done")


if __name__ == "__main__":
    main()
