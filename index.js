const aggregateSubnets = require('./aggregateSubnets')

aggregateSubnets()
  .then(subnets => subnets.forEach(subnet => process.stdout.write(`${subnet}\n`)))
  .catch(console.error)
