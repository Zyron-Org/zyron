const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

function getChromeExecutablePath() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe') : null,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'Chrome / Chromium executable not found! Set CHROME_PATH or PUPPETEER_EXECUTABLE_PATH.'
  );
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const BACKEND_API = process.env.BACKEND_API || 'http://localhost:4000/api/v1';

async function launchBrowser(headless = 'new') {
  const executablePath = getChromeExecutablePath();
  return await puppeteer.launch({
    executablePath,
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
}

async function createRoleSession(browser, email, roleDestPrefix) {
  console.log(`\n  🔐 Opening fresh isolated session for ${email}...`);
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(60000);
  page.setDefaultTimeout(60000);
  await page.setViewport({ width: 1440, height: 900 });

  page.on('response', (res) => {
    if (res.url().includes('/api/v1')) {
      const u = res.url().split('/api/v1')[1] || '';
      if (!u.includes('profile')) {
        console.log(`    [API ${res.request().method()}] ${res.status()} ${u}`);
      }
    }
  });

  await page.goto(`${FRONTEND_URL}/auth/login`, { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForFunction(
    (dest) => window.location.pathname.startsWith(dest),
    { timeout: 20000 },
    roleDestPrefix
  );
  console.log(`  ✓ Logged in as ${email}. Destination URL: ${page.url()}`);
  return { context, page };
}

async function clickButtonWithText(page, textSubstr) {
  return await page.evaluate((text) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find((b) => b.textContent && b.textContent.toLowerCase().includes(text.toLowerCase()));
    if (target) {
      target.click();
      return true;
    }
    return false;
  }, textSubstr);
}

module.exports = {
  FRONTEND_URL,
  BACKEND_API,
  launchBrowser,
  createRoleSession,
  clickButtonWithText,
  getChromeExecutablePath,
};
