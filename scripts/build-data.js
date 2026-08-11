/**
 * Builds the production `data/data.json` (the Sanity export):
 *  1. strips all pretty-printing/indentation
 *  2. removes `_key` fields — ~3,200 random 10-char strings per export that
 *     compress terribly; the frontend always falls back to array indexes for
 *     React keys and search record ids
 *
 * The frontend still fetches this one monolithic file, so there are no extra
 * requests and no risk of missing files.
 *
 * Run: `npm run build:data` (or `node scripts/build-data.js`)
 */

'use strict'

const fs = require('fs')
const path = require('path')

const INPUT = path.join(__dirname, '..', 'data', 'data.json')

/** Recursively delete `_key` fields (Sanity-generated array keys). */
function stripKeys(node) {
  if (Array.isArray(node)) {
    for (const item of node) stripKeys(item)
  } else if (node && typeof node === 'object') {
    for (const key of Object.keys(node)) {
      if (key === '_key') {
        delete node[key]
      } else {
        stripKeys(node[key])
      }
    }
  }
}

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`Input file not found: ${INPUT}`)
    process.exit(1)
  }

  const docs = JSON.parse(fs.readFileSync(INPUT, 'utf8'))
  if (!Array.isArray(docs)) {
    console.error('data.json must be a JSON array of documents')
    process.exit(1)
  }

  const docCount = docs.length
  stripKeys(docs)

  const minified = JSON.stringify(docs)
  fs.writeFileSync(INPUT, minified)

  const size = fs.statSync(INPUT).size
  console.log(`data.json → ${(size / 1024).toFixed(1)}KB, ${docCount} documents, minified & _key-stripped`)
}

main()
