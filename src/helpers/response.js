
import HttpStatus from 'http-status-codes'

export const jsonResponse = {
  success: jsonResponseSuccess,
  error: jsonResponseError
}

function jsonResponseSuccess(res, data = null) {

  let status = HttpStatus.OK

  return res.status(status).json({status: 'success', data})
}

function jsonResponseError(res, error) {

  let msg = error.sqlMessage ? HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR) : error

  return res.json({status: 'error', message: msg})
}
