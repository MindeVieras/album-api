import 'mocha'
import chalk from 'chalk'

// import { databaseSetup } from '../../src/config'
import Server from '../../src/Server'

/**
 * Tests entry file.
 * All tests will run in order.
 */
describe(chalk.green('Running full test suite...\n'), () => {
  /**
   * Runs before all tests in this block.
   */
  before(async () => {
    // await databaseSetup()

    // Run express server.
    new Server().listen()
    // process.env.NODE_ENV = 'test'
  })

  /**
   * Require all integration tests.
   */
  describe(chalk.green('Start integration tests\n'), () => {
    require('./users.spec')
  })
})
