const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER EXCEPTION:', err.message, err.stack));

  try {
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 10000 });
    
    // Fill login
    await page.fill('input[type="email"]', 'test@teste.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);
    
    await page.goto('http://localhost:8080/admin', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'admin-screenshot.png' });
    console.log("Screenshot saved as admin-screenshot.png");
    const html = await page.content();
    console.log("ROOT HTML LENGTH:", html.length);
    if (html.includes('id="root"')) {
      const rootHtml = await page.locator('#root').innerHTML();
      console.log("ROOT CONTENT LENGTH:", rootHtml.length);
      console.log("ROOT EXTRACT:", rootHtml.substring(0, 200));
    }
  } catch (e) {
    console.error("SCRIPT ERROR:", e.message);
  } finally {
    await browser.close();
  }
})();
