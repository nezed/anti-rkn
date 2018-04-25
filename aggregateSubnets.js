const subnetCalculator = require('ip-subnet-calculator')
const getSubnets = require('./getSubnets')
const _flatten = require('lodash.flatten')

module.exports = async function aggregateSubnets() {
  const subnets = _flatten([
    ...await getSubnets('https://rest.db.ripe.net/search.json?query-string=MAIL-RU&inverse-attribute=admin-c&type-filter=inetnum&flags=no-filtering&source=RIPE'),
    ...await getSubnets('https://rest.db.ripe.net/search.json?query-string=ROSNIIROS-MNT&inverse-attribute=mnt-by&type-filter=inetnum&flags=no-filtering&source=RIPE'),
    ...await getSubnets('https://rest.db.ripe.net/search.json?query-string=MAX-MNT&inverse-attribute=mnt-by&type-filter=inetnum&flags=no-filtering&source=RIPE'),
  ])

  subnets
    .sort((a, b) => (
      a.decStart !== b.decStart
        ? a.decStart - b.decStart
        : a.netmask - b.netmask
    ))

  const netmasks = []
  for(let i = 0; i < subnets.length; i++) {
    const rangeStart = subnets[i]
    while(i + 1 < subnets.length && subnets[i].decEnd >= subnets[i + 1].decStart) {
      ++i
    }

    netmasks.push(
      ...subnetCalculator.calculate(rangeStart.start, subnets[i].end).map(mask => `${mask.ipLowStr}/${mask.prefixSize}`)
    )
  }

  process.stderr.write(`Records found: ${subnets.length}\n`)
  process.stderr.write(`Merged netmasks count: ${netmasks.length}\n`)

  // return netmasks
  return subnets.map(net => net.toString())
}
