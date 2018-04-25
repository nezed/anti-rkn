const aggregateSubnets = require('./aggregateSubnets')

const { IPSET_NAME = 'antirkn' } = process.env

process.stderr.write(`
   To block optputing ipset run this:
$> iptables -v -I INPUT -m set --match-set ${IPSET_NAME} src -j DROP
   Ensure that you have ipset in your system!
`)

aggregateSubnets()
  .then(subnets => {
    process.stdout.write(`ipset -F ${IPSET_NAME}\n`)
    process.stdout.write(`ipset -N ${IPSET_NAME} nethash\n`)
    subnets.forEach(subnet => process.stdout.write(`ipset -A ${IPSET_NAME} ${subnet}\n`))
  })
  .catch(console.error)
