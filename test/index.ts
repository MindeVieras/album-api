import 'mocha'
import chalk from 'chalk'

console.clear()

/**
 * Tests entry file.
 * All tests will run in order.
 */
describe(chalk.green('Running full test suite...\n'), () => {
  /**
   * Require all unit tests.
   */
  describe(chalk.green('\nStart unit tests\n'), () => {
    require('./unit')
  })

  /**
   * Require all integration tests.
   */
  describe(chalk.green('\nStart integration tests\n'), () => {
    require('./integration')
  })
})
