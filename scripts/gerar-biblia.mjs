/**
 * Gera os JSONs do Novo Testamento (Almeida, João Ferreira de — domínio
 * público) a partir do arquivo USFX do projeto open-bibles:
 *   https://github.com/seven1m/open-bibles (arquivo por-almeida.usfx.xml)
 *
 * Uso:
 *   curl -L -o /tmp/por-almeida.usfx.xml \
 *     https://raw.githubusercontent.com/seven1m/open-bibles/master/por-almeida.usfx.xml
 *   node scripts/gerar-biblia.mjs /tmp/por-almeida.usfx.xml
 *
 * Saída (committed no git):
 *   public/biblia/livros.json          — índice dos 27 livros do NT
 *   public/biblia/<slug>/<cap>.json    — array de versículos do capítulo
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const ORIGEM = process.argv[2]
if (!ORIGEM) {
  console.error('Uso: node scripts/gerar-biblia.mjs <caminho do usfx.xml>')
  process.exit(1)
}

// USFX id → [slug, nome em pt-BR]
const NT = {
  MAT: ['mateus', 'Mateus'],
  MRK: ['marcos', 'Marcos'],
  LUK: ['lucas', 'Lucas'],
  JHN: ['joao', 'João'],
  ACT: ['atos', 'Atos dos Apóstolos'],
  ROM: ['romanos', 'Romanos'],
  '1CO': ['1corintios', '1ª Coríntios'],
  '2CO': ['2corintios', '2ª Coríntios'],
  GAL: ['galatas', 'Gálatas'],
  EPH: ['efesios', 'Efésios'],
  PHP: ['filipenses', 'Filipenses'],
  COL: ['colossenses', 'Colossenses'],
  '1TH': ['1tessalonicenses', '1ª Tessalonicenses'],
  '2TH': ['2tessalonicenses', '2ª Tessalonicenses'],
  '1TI': ['1timoteo', '1ª Timóteo'],
  '2TI': ['2timoteo', '2ª Timóteo'],
  TIT: ['tito', 'Tito'],
  PHM: ['filemon', 'Filémon'],
  HEB: ['hebreus', 'Hebreus'],
  JAS: ['tiago', 'Tiago'],
  '1PE': ['1pedro', '1ª Pedro'],
  '2PE': ['2pedro', '2ª Pedro'],
  '1JN': ['1joao', '1ª João'],
  '2JN': ['2joao', '2ª João'],
  '3JN': ['3joao', '3ª João'],
  JUD: ['judas', 'Judas'],
  REV: ['apocalipse', 'Apocalipse'],
}

const xml = readFileSync(ORIGEM, 'utf-8')
const saida = resolve(process.cwd(), 'public/biblia')

const livros = []
let totalCaps = 0
let totalVersos = 0

for (const match of xml.matchAll(
  /<book id="([^"]+)">(.*?)<\/book>/gs,
)) {
  const [, id, corpo] = match
  const info = NT[id]
  if (!info) continue // Antigo Testamento: ignorado
  const [slug, nome] = info

  const caps = []
  // Cada capítulo: blocos <v id="n"/>texto<ve/>, separados por <c id="c"/>
  const partes = corpo.split(/<c id="(\d+)"\s*\/>/).slice(1)
  for (let i = 0; i < partes.length; i += 2) {
    const numCap = Number(partes[i])
    const conteudo = partes[i + 1] ?? ''
    const versos = []
    for (const v of conteudo.matchAll(/<v id="(\d+)"\s*\/>(.*?)(?=<v id="\d+"|<c id="\d+"|<\/book>|<h[ >])/gs)) {
      // tira <ve/> e qualquer tag residual, normaliza espaços
      const texto = limpar(v[2])
      if (!texto) continue
      if (Number(v[1]) !== versos.length + 1) {
        console.warn(`⚠ ${slug} ${numCap}: versículo ${v[1]} após ${versos.length}`)
      }
      versos.push(texto)
    }
    caps.push({ capitulo: numCap, versos })
  }

  caps.sort((a, b) => a.capitulo - b.capitulo)
  if (caps.some((c, i) => c.capitulo !== i + 1)) {
    throw new Error(`Capítulos fora de sequência em ${slug}`)
  }

  const pasta = resolve(saida, slug)
  mkdirSync(pasta, { recursive: true })
  for (const c of caps) {
    writeFileSync(
      resolve(pasta, `${String(c.capitulo).padStart(3, '0')}.json`),
      JSON.stringify(c.versos),
    )
  }

  livros.push({ slug, nome, caps: caps.length, slug_key: id })
  totalCaps += caps.length
  totalVersos += caps.reduce((n, c) => n + c.versos.length, 0)
}

const ordemNT = Object.keys(NT)
livros.sort((a, b) => ordemNT.indexOf(a.slug_key) - ordemNT.indexOf(b.slug_key))
mkdirSync(saida, { recursive: true })
// livros.json levou só o que interessa à app (ordem, slug, nome, nº de caps)
writeFileSync(
  resolve(saida, 'livros.json'),
  JSON.stringify(
    livros.map(l => ({ slug: l.slug, nome: l.nome, caps: l.caps })),
    null,
    2,
  ),
)

if (livros.length !== 27) throw new Error(`Esperava 27 livros, achei ${livros.length}`)
console.log(
  `✓ Novo Testamento: ${livros.length} livros, ${totalCaps} capítulos, ${totalVersos} versículos → data/biblia/`,
)

function limpar(t) {
  return t
    .replace(/<ve\s*\/>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}