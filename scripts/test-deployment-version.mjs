import assert from 'node:assert/strict'
import {
  shouldReloadForVersion,
  versionedReloadUrl,
  VERSION_CHECK_INTERVAL_MS,
} from '../src/utils/deploymentVersion.ts'

const installed = 'a'.repeat(40) + '-123-1'
const published = 'b'.repeat(40) + '-124-1'
const currentUrl = 'https://operacionalcredvix.github.io/credvix-radar-v2/relatorio?loja=123#resumo'

assert.equal(VERSION_CHECK_INTERVAL_MS, 900_000)
assert.equal(shouldReloadForVersion(installed, installed, currentUrl), false)
assert.equal(shouldReloadForVersion(installed, published, currentUrl), true)
assert.equal(shouldReloadForVersion(installed, null, currentUrl), false)
assert.equal(shouldReloadForVersion(installed, '<script>', currentUrl), false)

const redirected = new URL(versionedReloadUrl(currentUrl, published))
assert.equal(redirected.pathname, '/credvix-radar-v2/relatorio')
assert.equal(redirected.searchParams.get('loja'), '123')
assert.equal(redirected.searchParams.get('__radar_build'), published)
assert.equal(redirected.hash, '#resumo')

// Depois de atualizar o bundle, não deve recarregar novamente.
assert.equal(shouldReloadForVersion(published, published, redirected.href), false)
// Se a TV ainda entregar HTML antigo, o parâmetro impede recarga infinita.
assert.equal(shouldReloadForVersion(installed, published, redirected.href), false)
// Uma publicação posterior deve permitir nova atualização.
const newer = 'c'.repeat(40) + '-125-1'
assert.equal(shouldReloadForVersion(published, newer, redirected.href), true)

console.log('Version check: atualização, mesma versão, rota e proteção contra loop: OK')
