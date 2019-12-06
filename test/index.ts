import 'mocha'
import chalk from 'chalk'

/**
 * Tests entry file.
 * All tests will run in order.
 */
describe(chalk.green('Running full test suite...\n'), () => {
  /**
   * Runs before all tests in this block.
   */
  before(() => {
    // process.env.NODE_ENV = 'test'
  })

  /**
   * Require all unit tests.
   */
  describe(chalk.green('Start unit tests\n'), () => {
    require('./unit')
  })
})
