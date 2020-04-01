import 'mocha'
import chalk from 'chalk'

// import { databaseSetup } from '../../src/config'
import Server from '../../src/Server'
import { config } from '../../src/config'

/**
 * Tests entry file.
 * All tests will run in order.
 */
describe(chalk.green('Running integration tests...\n'), () => {
  /**
   * Runs before all tests in this block.
   */
  before(async () => {
    // await databaseSetup()

    // Run express server.
    new Server().listen(config.port + 1)
    // process.env.NODE_ENV = 'test'
  })

  /**
   * Require all integration tests.
   */
  describe(chalk.green('Start integration tests\n'), () => {
    require('./users.spec')
  })
})
