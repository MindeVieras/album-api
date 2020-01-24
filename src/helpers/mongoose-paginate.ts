import Promise from 'bluebird'

/**
 * @param {Object}              [query={}]
 * @param {Object}              [options={}]
 * @param {Object|String}         [options.select]
 * @param {Object|String}         [options.sort]
 * @param {Array|Object|String}   [options.populate]
 * @param {Boolean}               [options.lean=false]
 * @param {Boolean}               [options.leanWithId=true]
 * @param {Number}                [options.offset=0] - Use offset or page to set skip position
 * @param {Number}                [options.page=1]
 * @param {Number}                [options.limit=10]
 * @param {Function}            [callback]
 *
 * @returns {Promise}
 */
// @ts-ignore
function paginate(query, options, callback) {
  query = query || {}
  // @ts-ignore
  options = Object.assign({}, paginate.options, options)

  var select = options.select
  var sort = options.sort
  var populate = options.populate
  var lean = options.lean || false
  var leanWithId = options.hasOwnProperty('leanWithId') ? options.leanWithId : true

  var limit = options.hasOwnProperty('limit') ? options.limit : 10
  // @ts-ignore
  var skip, offset, page

  if (options.hasOwnProperty('offset')) {
    offset = options.offset
    skip = offset
  } else if (options.hasOwnProperty('page')) {
    page = options.page
    skip = (page - 1) * limit
  } else {
    offset = 0
    page = 1
    skip = offset
  }

  var promises = {
    docs: Promise.resolve([]),
    // @ts-ignore
    count: this.count(query).exec(),
  }

  if (limit) {
    // @ts-ignore
    var query = this.find(query)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(lean)

    if (populate) {
      ;[].concat(populate).forEach(function(item) {
        query.populate(item)
      })
    }

    promises.docs = query.exec()

    if (lean && leanWithId) {
      promises.docs = promises.docs.then(function(docs) {
        docs.forEach(function(doc) {
          // @ts-ignore
          doc.id = String(doc._id)
        })

        return docs
      })
    }
  }
  // @ts-ignore
  return (
    Promise.props(promises)
      // @ts-ignore
      .then(function(data) {
        var result = {
          docs: data.docs,
          total: data.count,
          limit: limit,
        }
        // @ts-ignore
        if (offset !== undefined) {
          // @ts-ignore
          result.offset = offset
        }
        // @ts-ignore
        if (page !== undefined) {
          // @ts-ignore
          result.page = page
          // @ts-ignore
          result.pages = Math.ceil(data.count / limit) || 1
        }

        return result
      })
      .asCallback(callback)
  )
}

/**
 * @param {Schema} schema
 */
module.exports = function(schema: any) {
  schema.statics.paginate = paginate
}

module.exports.paginate = paginate
