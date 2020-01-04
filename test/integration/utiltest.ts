import util from 'util'

export function checkResponse(response: any) {
  if (
    response.error !== null &&
    typeof response.error !== 'undefined' &&
    response.error !== false
  ) {
    console.log(util.inspect(response.error))
  }
  return response
}
