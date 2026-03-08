"""Capture a demo GIF walkthrough of the MSP Service Desk Automation Hub."""

import os
from playwright.sync_api import sync_playwright
from PIL import Image

BASE_URL = "http://127.0.0.1:3000"
VIEWPORT = {"width": 1280, "height": 720}
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "docs")
GIF_PATH = os.path.join(OUTPUT_DIR, "demo.gif")
MAX_GIF_SIZE_MB = 10


def capture(page, frames: list[Image.Image], label: str):
    """Take a screenshot and append it as a PIL Image frame."""
    raw = page.screenshot(type="png")
    img = Image.open(__import__("io").BytesIO(raw)).convert("RGB")
    frames.append(img)
    print(f"  frame {len(frames):>2}: {label}")


def wait_ready(page):
    """Wait until the page is fully loaded and styled."""
    page.wait_for_load_state("domcontentloaded")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1500)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    frames: list[Image.Image] = []
    # durations in ms per frame - will be built alongside frames
    durations: list[int] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport=VIEWPORT,
            device_scale_factor=1,
        )
        page = context.new_page()

        # Suppress noisy console output
        page.on("pageerror", lambda err: None)

        # ---- 1. Dashboard overview (pause 2s) ----
        print("Step 1: Dashboard")
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        wait_ready(page)

        capture(page, frames, "dashboard - initial")
        durations.append(2000)

        # Extra hold frame on dashboard
        capture(page, frames, "dashboard - hold")
        durations.append(2000)

        # ---- 2. Navigate to tickets page ----
        print("Step 2: Tickets page")
        # Click the Tickets nav link in the sidebar
        page.click('a:has-text("Tickets"):not(:has-text("Submit"))')
        wait_ready(page)

        capture(page, frames, "tickets list")
        durations.append(1500)

        # Click first ticket to show detail
        print("Step 2b: Click a ticket")
        ticket_link = page.locator('a[href^="/tickets/c"]').first
        ticket_link.wait_for(state="visible", timeout=5000)
        ticket_link.click()
        wait_ready(page)

        capture(page, frames, "ticket detail - top")
        durations.append(2000)

        # Extra hold
        capture(page, frames, "ticket detail - hold")
        durations.append(1500)

        # ---- 3. Scroll down to show triage engine and SLA sections ----
        print("Step 3: Scroll ticket detail")

        # First scroll
        page.evaluate("window.scrollBy(0, 400)")
        page.wait_for_timeout(600)
        capture(page, frames, "ticket detail - scroll 1")
        durations.append(500)

        # Second scroll
        page.evaluate("window.scrollBy(0, 400)")
        page.wait_for_timeout(600)
        capture(page, frames, "ticket detail - scroll 2")
        durations.append(500)

        # Third scroll
        page.evaluate("window.scrollBy(0, 400)")
        page.wait_for_timeout(600)
        capture(page, frames, "ticket detail - scroll 3")
        durations.append(2000)

        # Hold on scrolled view
        capture(page, frames, "ticket detail - scrolled hold")
        durations.append(2000)

        # ---- 4. Navigate to approvals page ----
        print("Step 4: Approvals page")
        page.click('a:has-text("Approvals"):not(:has-text("Review"))')
        wait_ready(page)

        capture(page, frames, "approvals - top")
        durations.append(2000)

        # Scroll down a bit to show more approvals content
        page.evaluate("window.scrollBy(0, 350)")
        page.wait_for_timeout(600)
        capture(page, frames, "approvals - scrolled")
        durations.append(2000)

        # ---- 5. Navigate back to dashboard ----
        print("Step 5: Back to dashboard")
        page.click('a:has-text("Dashboard")')
        wait_ready(page)

        capture(page, frames, "dashboard - return")
        durations.append(1500)

        browser.close()

    print(f"\nTotal frames captured: {len(frames)}")

    # ---- Assemble GIF ----
    print("Assembling GIF...")

    # Check if we need to downscale to stay under size limit
    # First try at full resolution
    first_pass = frames[0].copy()
    first_pass.save(
        GIF_PATH,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        optimize=True,
    )

    file_size_mb = os.path.getsize(GIF_PATH) / (1024 * 1024)
    print(f"  GIF size (full res): {file_size_mb:.1f} MB")

    if file_size_mb > MAX_GIF_SIZE_MB:
        print("  Resizing frames to reduce file size...")
        # Calculate scale factor needed
        scale = (MAX_GIF_SIZE_MB / file_size_mb) ** 0.5
        new_w = int(VIEWPORT["width"] * scale)
        new_h = int(VIEWPORT["height"] * scale)
        print(f"  New dimensions: {new_w}x{new_h}")

        resized = [f.resize((new_w, new_h), Image.LANCZOS) for f in frames]
        resized[0].save(
            GIF_PATH,
            save_all=True,
            append_images=resized[1:],
            duration=durations,
            loop=0,
            optimize=True,
        )
        file_size_mb = os.path.getsize(GIF_PATH) / (1024 * 1024)
        print(f"  GIF size (resized): {file_size_mb:.1f} MB")

    # If still too large, quantize colors more aggressively
    if file_size_mb > MAX_GIF_SIZE_MB:
        print("  Applying aggressive color quantization...")
        quantized = [f.quantize(colors=128, method=Image.Quantize.MEDIANCUT).convert("RGB") for f in frames]
        quantized[0].save(
            GIF_PATH,
            save_all=True,
            append_images=quantized[1:],
            duration=durations,
            loop=0,
            optimize=True,
        )
        file_size_mb = os.path.getsize(GIF_PATH) / (1024 * 1024)
        print(f"  GIF size (quantized): {file_size_mb:.1f} MB")

    print(f"\nDemo GIF saved to: {os.path.abspath(GIF_PATH)}")
    print(f"Final size: {file_size_mb:.2f} MB, {len(frames)} frames")


if __name__ == "__main__":
    main()
