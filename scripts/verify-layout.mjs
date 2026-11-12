import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const BASE = 'http://127.0.0.1:4173/credvix-radar-v2/'
// 1666x923 reproduz a proporção da foto enviada da TV.
const SIZES = [[1366, 768], [1440, 900], [1666, 923], [1920, 1080], [3840, 2160], [390, 844]]
const version = JSON.parse(await readFile('dist/version.json', 'utf8'))
const fixtureNames = [
  'Colatina Centro', 'Brasília Ceilândia Sul', 'Teixeira De Freitas Centro',
  'Várzea Grande Cristo Rei II', 'Cuiabá Centro-Norte', 'Cachoeiro De Itapemirim Centro',
  'São Mateus Centro', 'Vila Velha Centro', 'Porto Seguro Centro',
  'Eunápolis Centro', 'Nova Venécia Centro',
]
const coordinatorNames = ['Daielly', 'Maria Fernanda', 'Marielen']
const mockPayload = {
  ok: true,
  date: '12/11/2026',
  updatedAt: '16h46',
  snapshot: { ok: true, operationalDate: '2026-11-12' },
  responsiblePerformance: coordinatorNames.map((name, index) => ({
    name,
    dailyGoal: 34000 + index * 1000,
    paidToday: 22000 + index * 1500,
    soldToday: 25000 + index * 1500,
    monthGoal: 550000 + index * 70000,
    monthRealized: 170000 + index * 25000,
    monthProjectionPercent: 73 + index * 13,
    monthProjectionAmount: (550000 + index * 70000) * (73 + index * 13) / 100,
    monthProjectionGap: -40000 + index * 60000,
    recoveryToday: 37000 + index * 8500,
    monthRealizedClosed: 160000 + index * 25000,
    cumulativeTargetToday: 180000 + index * 30000,
  })),
  operationalStores: Array.from({ length: 32 }, (_, index) => ({
    name: fixtureNames[index % fixtureNames.length] + ' ' + String(index + 1).padStart(2, '0'),
    responsible: coordinatorNames[index % 3],
    dailyGoal: 4500 + index * 35,
    paidToday: index % 8 === 0 ? 0 : 2500 + index * 40,
    soldToday: index % 6 === 0 ? 0 : 6000 - index * 95,
    monthGoal: 50000,
    monthRealized: 18000,
    monthProjectionPercent: 48 + index * 2.6,
    monthProjectionAmount: 25000 + index * 1400,
    monthProjectionGap: -25000 + index * 1400,
    recoveryToday: 8400 + index * 60,
    monthRealizedClosed: 15000,
    cumulativeTargetToday: 20000,
  })),
}

async function waitFor(check, timeout = 15000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    try {
      if (await check()) return
    } catch { /* Chrome may still be navigating */ }
    await sleep(120)
  }
  throw new Error('Timeout waiting for browser / layout')
}

function connect(url) {
  const socket = new WebSocket(url)
  const requests = new Map()
  const listeners = new Map()
  let id = 0

  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data)
    if (message.id) {
      const pending = requests.get(message.id)
      if (pending) {
        clearTimeout(pending.timer)
        requests.delete(message.id)
        message.error ? pending.reject(new Error(JSON.stringify(message.error))) : pending.resolve(message.result)
      }
      return
    }
    for (const listener of listeners.get(message.method) || []) listener(message.params)
  })

  return {
    socket,
    ready: new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true })
      socket.addEventListener('error', reject, { once: true })
    }),
    on(method, callback) {
      if (!listeners.has(method)) listeners.set(method, [])
      listeners.get(method).push(callback)
    },
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const currentId = ++id
        const timer = setTimeout(() => {
          requests.delete(currentId)
          reject(new Error('CDP timeout: ' + method))
        }, 12000)
        requests.set(currentId, { resolve, reject, timer })
        socket.send(JSON.stringify({ id: currentId, method, params }))
      })
    },
  }
}

const chromeBin = [
  process.env.CHROME_BIN,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
].find((path) => path && existsSync(path))
assert.ok(chromeBin, 'Chrome / Chromium is required for viewport tests')

const profileBase = join(tmpdir(), 'credvix-layout-' + process.pid)
let profile = profileBase
const screenshotsDir = 'layout-screenshots'
let preview
let browser
let cdp

try {
  preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: 'ignore' })
  await waitFor(async () => {
    const response = await fetch(BASE + 'version.json')
    return response.ok
  })

  let debugPort
  for (let attempt = 1; attempt <= 2; attempt++) {
    profile = profileBase + '-' + attempt
    let startupError = ''
    browser = spawn(chromeBin, [
      '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
      '--disable-background-networking', '--disable-extensions',
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
      '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0',
      '--user-data-dir=' + profile, 'about:blank',
    ], { stdio: ['ignore', 'ignore', 'pipe'] })
    browser.stderr?.on('data', (chunk) => {
      startupError = (startupError + String(chunk)).slice(-1500)
    })

    try {
      await waitFor(async () => {
        const ports = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')
        debugPort = Number(ports[0])
        return debugPort > 0
      }, 25000)
      break
    } catch (error) {
      browser.kill('SIGTERM')
      await rm(profile, { recursive: true, force: true }).catch(() => {})
      if (attempt === 2) {
        throw new Error('Chrome failed to start twice: ' +
          String(error) + ' / ' + startupError)
      }
      console.warn('Chrome startup retry after transient runner failure')
      await sleep(750)
    }
  }
  const targets = await fetch('http://127.0.0.1:' + debugPort + '/json/list').then((response) => response.json())
  const target = targets.find((item) => item.type === 'page')
  assert.ok(target, 'Chrome did not create a page')
  cdp = connect(target.webSocketDebuggerUrl)
  await cdp.ready

  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  let publishedBuildId = version.buildId
  let navigationCount = 0
  cdp.on('Page.frameNavigated', (event) => {
    if (!event.frame.parentId) navigationCount++
  })
  cdp.on('Fetch.requestPaused', (event) => {
    const requestUrl = event.request.url
    let reply
    if (requestUrl.includes('/api/producao')) reply = mockPayload
    else if (requestUrl.includes('/version.json')) reply = { buildId: publishedBuildId }
    if (!reply) {
      void cdp.send('Fetch.continueRequest', { requestId: event.requestId })
      return
    }
    void cdp.send('Fetch.fulfillRequest', {
      requestId: event.requestId,
      responseCode: 200,
      responseHeaders: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Access-Control-Allow-Origin', value: '*' },
        { name: 'Cache-Control', value: 'no-store' },
      ],
      body: Buffer.from(JSON.stringify(reply)).toString('base64'),
    })
  })
  await cdp.send('Fetch.enable', {
    patterns: [
      { urlPattern: '*api/producao*', requestStage: 'Request' },
      { urlPattern: '*version.json*', requestStage: 'Request' },
    ],
  })

  async function evaluate(expression) {
    const result = await cdp.send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true,
    })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1366, height: 768, deviceScaleFactor: 1, mobile: false,
  })
  const navigate = await cdp.send('Page.navigate', { url: BASE })
  if (navigate.errorText) throw new Error('Chrome navigation failed: ' + navigate.errorText)

  await waitFor(async () => (await evaluate("document.querySelectorAll('.credvix-store-row').length")) === 96)
  await mkdir(screenshotsDir, { recursive: true })

  const measure = `(() => {
    const rect = (element) => {
      if (!element) return null
      const b = element.getBoundingClientRect()
      return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height }
    }
    const cards = document.querySelectorAll('.radar-screen-bottom > section')
    const left = cards[0]
    const right = cards[1]
    const header = right?.querySelector('header')
    const footer = right?.querySelector('footer')
    const viewport = right?.querySelector('.credvix-store-viewport')
    const loop = viewport?.querySelector('.credvix-store-loop')
    const copies = loop ? Array.from(loop.querySelectorAll(':scope > ol')) : []
    const firstRow = copies[0]?.querySelector('.credvix-store-row')
    const name = firstRow?.children[1]
    const badge = firstRow?.querySelector('.credvix-store-projection')
    const values = firstRow?.querySelector('.credvix-store-values')
    const animation = loop ? getComputedStyle(loop) : null
    return {
      width: innerWidth, height: innerHeight,
      docWidth: document.documentElement.scrollWidth,
      left: rect(left), right: rect(right), header: rect(header),
      footer: rect(footer), viewport: rect(viewport),
      firstRow: rect(firstRow), name: rect(name), badge: rect(badge), values: rect(values),
      copyCount: copies.length, copyHeights: copies.map((item) => rect(item).height),
      animation: animation?.animationName,
      duration: animation?.animationDuration,
      repeat: animation?.animationIterationCount,
      viewportOverflow: viewport ? getComputedStyle(viewport).overflowY : null,
    }
  })()`

  for (const [width, height] of SIZES) {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width, height, deviceScaleFactor: 1, mobile: width < 600,
    })
    await sleep(450)
    const m = await evaluate(measure)
    assert.equal(m.width, width, 'Incorrect viewport width')
    assert.ok(m.right && m.left && m.header && m.footer && m.viewport, 'Missing ranking cards')
    assert.ok(m.docWidth <= width + 2, 'Horizontal page overflow: ' + width + ' => ' + m.docWidth)
    assert.ok(m.right.left >= -1 && m.right.right <= width + 2, 'Ranking escapes horizontal viewport')
    assert.ok(m.header.bottom <= m.viewport.top + 2, 'Header overlaps scrolling list')
    assert.ok(m.viewport.bottom <= m.footer.top + 2, 'Footer overlaps scrolling list')
    assert.ok(m.viewport.height > 100, 'List has no usable scrolling area')
    assert.ok(m.copyCount === 3, 'Continuous loop needs three equal copies')
    assert.ok(Math.max(...m.copyHeights) - Math.min(...m.copyHeights) < 1, 'Animated copies differ in height')
    assert.ok(m.animation === 'credvixStoreScroll' && m.repeat === 'infinite', 'Scroll animation disabled')
    assert.ok(m.duration === '121.6s', 'Ranking scroll speed changed')
    assert.equal(m.viewportOverflow, 'hidden', 'Only the inner list can scroll')
    if (width > 1100) {
      assert.ok(Math.abs(m.left.top - m.right.top) < 2, 'Cards have different top edges')
      assert.ok(Math.abs(m.left.bottom - m.right.bottom) < 2, 'Cards have different bottom edges')
      assert.ok(m.right.bottom <= height + 1, 'Ranking is taller than the screen')
    } else {
      assert.ok(m.right.top >= m.left.bottom - 2, 'Mobile ranking overlaps coordinators')
    }
    if (width >= 1280) {
      // A correção anterior passava em overflow, mas tinha linhas de 110px
      // porque o breakpoint de 650px separava os valores em uma terceira linha.
      assert.ok(
        m.firstRow.height <= (width >= 2600 ? 110 : 70),
        'TV ranking rows became too tall: ' + width + 'px / ' +
          Math.round(m.firstRow.height) + 'px'
      )
      assert.ok(
        Math.abs(
          (m.name.top + m.name.bottom) / 2 -
          (m.values.top + m.values.bottom) / 2
        ) < 10,
        'TV amounts must stay beside the name instead of dropping to a new row'
      )
      assert.ok(
        Math.abs(
          (m.name.top + m.name.bottom) / 2 -
          (m.badge.top + m.badge.bottom) / 2
        ) < 10,
        'TV projection badge must remain centered beside the name'
      )
      assert.ok(m.viewport.height / m.firstRow.height > 3.5,
        'TV shows too few stores at a time')
    }
    assert.ok(m.values.right <= m.right.right + 1, 'Amounts clipped on the right')
    assert.ok(m.badge.right <= m.right.right + 1, 'Badge clipped on the right')
    const screenshot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    await writeFile(join(screenshotsDir, width + 'x' + height + '.png'), Buffer.from(screenshot.data, 'base64'))
    console.log('Layout OK: ' + width + 'x' + height +
      ' | card=' + Math.round(m.right.height) + 'px' +
      ' | viewport=' + Math.round(m.viewport.height) + 'px')
  }

  // O mesmo manifesto não pode recarregar a página.
  const stableNavigations = navigationCount
  await evaluate("window.dispatchEvent(new Event('online')); true")
  await sleep(900)
  assert.equal(navigationCount, stableNavigations, 'Page reloaded without a new build')

  // Simula um novo artefato publicado; o browser deve preservar a rota.
  publishedBuildId = 'f'.repeat(40) + '-999999-1'
  await evaluate("window.dispatchEvent(new Event('online')); true")
  await waitFor(async () => {
    const href = await evaluate('location.href')
    return new URL(href).searchParams.get('__radar_build') === publishedBuildId
  })
  const afterReload = navigationCount
  await sleep(1500)
  assert.equal(navigationCount, afterReload, 'Reload loop after a new build')
  const finalHref = new URL(await evaluate('location.href'))
  assert.equal(finalHref.pathname, '/credvix-radar-v2/')
  assert.equal(finalHref.searchParams.get('__radar_build'), publishedBuildId)
  console.log('Version checks OK: same build, new deploy, route and reload-loop prevention')

  assert.equal((await readdir(screenshotsDir)).length, SIZES.length)
} finally {
  try { cdp?.socket.close() } catch { /* ignore */ }
  browser?.kill('SIGTERM')
  preview?.kill('SIGTERM')
  await rm(profile, { recursive: true, force: true }).catch(() => {})
}
