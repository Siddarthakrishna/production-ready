from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:3510/financial/swing_center.html")
    page.wait_for_load_state('networkidle')
    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()
