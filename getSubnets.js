const subnetCalculator = require('ip-subnet-calculator')
const crypto = require('crypto');
const fs = require('fs-extra')
const fetch = require('node-fetch')
const _get = require('lodash.get')

const CACHE_DIR = './cache'

async function getJson(url) {
  // const cacheKey = url.replace(/[^\w\.]/gi, '')
  const cacheName = _get(url.match(/query-string=([^&]+)/), '1')
  const cacheKey = crypto.createHash('md5').update(url).digest('hex').substr(0, 6)
  const cacheFile = `${CACHE_DIR}/${cacheName}.${cacheKey}.json`

  if (await fs.pathExists(cacheFile)) {
    return fs.readJson(cacheFile)
  }

  const response = await fetch(url)
  const json = await response.json()

  await fs.ensureDir(CACHE_DIR)
  await fs.writeJson(cacheFile, json)
  return json
}

module.exports = async function(url) {
  const json = await getJson(url)

  const subnets = json.objects.object
    .filter((record) => (
      record.type === 'inetnum' &&
      _get(record, 'primary-key.attribute.0.value')
    ))
    .map((record) => {
      const [start, end] = _get(record, 'primary-key.attribute.0.value').split(/\s?-\s?/)

      const masks = subnetCalculator.calculate(start, end)

      return masks.map((mask) => ({
        start: mask.ipLowStr,
        end: mask.ipHighStr,
        netmask: mask.prefixSize,
        decStart: mask.ipLow,
        decEnd: mask.ipHigh,
        toString: () => `${mask.ipLowStr}/${mask.prefixSize}`
      }))
    })

  return subnets
}
