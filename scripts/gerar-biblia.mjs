/**
 * Gera os JSONs da Bíblia COMPLETA (Almeida, João Ferreira de — domínio
 * público) a partir do arquivo USFX do projeto open-bibles:
 *   https://github.com/seven1m/open-bibles (arquivo por-almeida.usfx.xml)
 *
 * Uso:
 *   curl -L -o /tmp/por-almeida.usfx.xml \
 *     https://raw.githubusercontent.com/seven1m/open-bibles/master/por-almeida.usfx.xml
 *   node scripts/gerar-biblia.mjs /tmp/por-almeida.usfx.xml
 *
 * Saída (committed no git):
 *   public/biblia/livros.json          — índice dos 66 livros (com testamento)
 *   public/biblia/<slug>/<cap>.json    — array de versículos do capítulo
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const ORIGEM = process.argv[2]
if (!ORIGEM) {
  console.error('Uso: node scripts/gerar-biblia.mjs <caminho do usfx.xml>')
  process.exit(1)
}

// USFX id → [slug, nome em pt-BR, testamento ('antigo' | 'novo')]
const BIBLIA = {
  GEN: ['genesis', 'Gênesis', 'antigo'],
  EXO: ['exodo', 'Êxodo', 'antigo'],
  LEV: ['levitico', 'Levítico', 'antigo'],
  NUM: ['numeros', 'Números', 'antigo'],
  DEU: ['deuteronomio', 'Deuteronômio', 'antigo'],
  JOS: ['josue', 'Josué', 'antigo'],
  JDG: ['juizes', 'Juízes', 'antigo'],
  RUT: ['rute', 'Rute', 'antigo'],
  '1SA': ['1samuel', '1º Samuel', 'antigo'],
  '2SA': ['2samuel', '2º Samuel', 'antigo'],
  '1KI': ['1reis', '1º Reis', 'antigo'],
  '2KI': ['2reis', '2º Reis', 'antigo'],
  '1CH': ['1cronicas', '1º Crônicas', 'antigo'],
  '2CH': ['2cronicas', '2º Crônicas', 'antigo'],
  EZR: ['esdras', 'Esdras', 'antigo'],
  NEH: ['neemias', 'Neemias', 'antigo'],
  EST: ['ester', 'Ester', 'antigo'],
  JOB: ['jo', 'Jó', 'antigo'],
  PSA: ['salmos', 'Salmos', 'antigo'],
  PRO: ['proverbios', 'Provérbios', 'antigo'],
  ECC: ['eclesiastes', 'Eclesiastes', 'antigo'],
  SNG: ['cantares', 'Cantares', 'antigo'],
  ISA: ['isaias', 'Isaías', 'antigo'],
  JER: ['jeremias', 'Jeremias', 'antigo'],
  LAM: ['lamentacoes', 'Lamentações', 'antigo'],
  EZK: ['ezequiel', 'Ezequiel', 'antigo'],
  DAN: ['daniel', 'Daniel', 'antigo'],
  HOS: ['oseias', 'Oséias', 'antigo'],
  JOL: ['joel', 'Joel', 'antigo'],
  AMO: ['amos', 'Amós', 'antigo'],
  OBA: ['obadias', 'Obadias', 'antigo'],
  JON: ['jonas', 'Jonas', 'antigo'],
  MIC: ['miqueias', 'Miquéias', 'antigo'],
  NAM: ['naum', 'Naum', 'antigo'],
  HAB: ['habacuque', 'Habacuque', 'antigo'],
  ZEP: ['sofonias', 'Sofonias', 'antigo'],
  HAG: ['ageu', 'Ageu', 'antigo'],
  ZEC: ['zacarias', 'Zacarias', 'antigo'],
  MAL: ['malaquias', 'Malaquias', 'antigo'],
  MAT: ['mateus', 'Mateus', 'novo'],
  MRK: ['marcos', 'Marcos', 'novo'],
  LUK: ['lucas', 'Lucas', 'novo'],
  JHN: ['joao', 'João', 'novo'],
  ACT: ['atos', 'Atos dos Apóstolos', 'novo'],
  ROM: ['romanos', 'Romanos', 'novo'],
  '1CO': ['1corintios', '1ª Coríntios', 'novo'],
  '2CO': ['2corintios', '2ª Coríntios', 'novo'],
  GAL: ['galatas', 'Gálatas', 'novo'],
  EPH: ['efesios', 'Efésios', 'novo'],
  PHP: ['filipenses', 'Filipenses', 'novo'],
  COL: ['colossenses', 'Colossenses', 'novo'],
  '1TH': ['1tessalonicenses', '1ª Tessalonicenses', 'novo'],
  '2TH': ['2tessalonicenses', '2ª Tessalonicenses', 'novo'],
  '1TI': ['1timoteo', '1ª Timóteo', 'novo'],
  '2TI': ['2timoteo', '2ª Timóteo', 'novo'],
  TIT: ['tito', 'Tito', 'novo'],
  PHM: ['filemon', 'Filémon', 'novo'],
  HEB: ['hebreus', 'Hebreus', 'novo'],
  JAS: ['tiago', 'Tiago', 'novo'],
  '1PE': ['1pedro', '1ª Pedro', 'novo'],
  '2PE': ['2pedro', '2ª Pedro', 'novo'],
  '1JN': ['1joao', '1ª João', 'novo'],
  '2JN': ['2joao', '2ª João', 'novo'],
  '3JN': ['3joao', '3ª João', 'novo'],
  JUD: ['judas', 'Judas', 'novo'],
  REV: ['apocalipse', 'Apocalipse', 'novo'],
}

const xml = readFileSync(ORIGEM, 'utf-8')
const saida = resolve(process.cwd(), 'public/biblia')

const livros = []
let totalCaps = 0
let totalVersos = 0

for (const match of xml.matchAll(/<book id="([^"]+)">(.*?)<\/book>/gs)) {
  const [, id, corpo] = match
  const info = BIBLIA[id]
  if (!info) {
    console.warn(`⚠ livro sem tradução de id: ${id} — ignorado`)
    continue
  }
  const [slug, nome, testamento] = info

  const caps = []
  // Cada capítulo: blocos <v id="n"/>texto<ve/>, separados por <c id="c"/>
  const partes = corpo.split(/<c id="(\d+)"\s*\/>/).slice(1)
  for (let i = 0; i < partes.length; i += 2) {
    const numCap = Number(partes[i])
    const conteudo = partes[i + 1] ?? ''
    const versos = []
    for (const v of conteudo.matchAll(
      /<v id="(\d+)"\s*\/>(.*?)(?=<v id="\d+"|<c id="\d+"|<\/book>|<h[ >])/gs,
    )) {
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

  livros.push({ slug, nome, caps: caps.length, testamento, _ordem: id })
  totalCaps += caps.length
  totalVersos += caps.reduce((n, c) => n + c.versos.length, 0)
}

const ordem = Object.keys(BIBLIA)
livros.sort((a, b) => ordem.indexOf(a._ordem) - ordem.indexOf(b._ordem))
mkdirSync(saida, { recursive: true })
writeFileSync(
  resolve(saida, 'livros.json'),
  JSON.stringify(
    livros.map(({ slug, nome, caps, testamento }) => ({ slug, nome, caps, testamento })),
    null,
    2,
  ),
)

if (livros.length !== 66) throw new Error(`Esperava 66 livros, achei ${livros.length}`)
console.log(
  `✓ Bíblia completa: ${livros.length} livros, ${totalCaps} capítulos, ${totalVersos} versículos → public/biblia/`,
)

function limpar(t) {
  return t
    .replace(/<ve\s*\/>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}