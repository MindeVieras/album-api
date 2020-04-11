import { Request, Response } from 'express'
import CryptoJS from 'crypto-js'

import { config } from '../config'
import { ApiResponse, ApiErrorForbidden } from '../helpers'

// const getMediaDimensions = require('./aws/lambda/get_media_dimensions')

// Change to numbers to enable policy document verification
// on file size (recommended)
const expectedMinSize: number | null = null
const expectedMaxSize: number | null = null

export class UploaderController {
  /**
   * On uploader success callback.
   */
  public async onSuccess(req: Request, res: Response) {
    console.log(req.body)
    try {
      // const { authedUser, query } = req
      // if (!authedUser) {
      //   throw new ApiErrorForbidden()
      // }
      // const users = await new User().getList(authedUser, query)
      return new ApiResponse(res, req.body)
    } catch (err) {
      return new Error('Error!!!')
      // return next(err)
    }
    // res.json({ ack: 'OK!!!' })
    // const { key, name, filesize, mime, entity, entity_id, status } = req.body
    // const { uid } = req.app.get('user')
    // if (key) {
    //   let fileData = {}

    //   getMediaDimensions
    //     .get(key)
    //     .then((dimensions) => {
    //       fileData = {
    //         s3_key: key,
    //         mime,
    //         filesize: parseInt(filesize),
    //         org_filename: name,
    //         entity: parseInt(entity),
    //         entity_id: parseInt(entity_id),
    //         status: parseInt(status),
    //         author: uid,
    //         width: dimensions.width,
    //         height: dimensions.height,
    //         weight: 0,
    //       }

    //       return conn.query(`INSERT INTO media set ?`, fileData)
    //     })
    //     .then((row) => {
    //       const { ...fileCopy } = fileData
    //       fileData = {
    //         ...fileCopy,
    //         media_id: row.insertId,
    //       }
    //       res.json({ success: true, data: fileData })
    //     })
    //     .catch((err) => {
    //       let msg = err.sqlMessage ? err.sqlMessage : err
    //       res.json({ ack: 'err', msg })
    //     })
    // } else {
    //   res.json({ ack: 'err', msg: 'No key' })
    // }
  }

  /**
   * Get AWS signature for client fine-uploader.
   *
   * @param {Request} req
   *   Express request object.
   * @param {Response} res
   *   Express response object.
   */
  public getSignature(req: Request, res: Response): void {
    // Signs any requests.
    // Delegate to a more specific signer based on type of request.
    if (req.body.headers) {
      UploaderController.signRestRequest(req, res)
    } else {
      UploaderController.signPolicy(req, res)
    }
  }

  /**
   * Signs multi-part (chunked) requests.
   * Omit if you don't want to support chunking.
   *
   * @param {Request} req
   *   Express request object.
   * @param {Response} res
   *   Express response object.
   */
  private static signRestRequest(req: Request, res: Response): void {
    const stringToSign = req.body.headers
    const signature = UploaderController.signV4RestRequest(stringToSign)

    const jsonResponse = { signature }

    res.setHeader('Content-Type', 'application/json')

    if (UploaderController.isValidRestRequest(stringToSign)) {
      res.end(JSON.stringify(jsonResponse))
    } else {
      res.status(400)
      res.end(JSON.stringify({ invalid: true }))
    }
  }

  private static signV4RestRequest(headersStr: string): string {
    const matches = /.+\n.+\n(\d+)\/(.+)\/s3\/aws4_request\n([\s\S]+)/.exec(headersStr)!
    const hashedCanonicalRequest = CryptoJS.SHA256(matches[3])
    const stringToSign = headersStr.replace(
      /(.+s3\/aws4_request\n)[\s\S]+/,
      '$1' + hashedCanonicalRequest,
    )
    return UploaderController.getV4SignatureKey(
      config.aws.secretKey,
      matches[1],
      matches[2],
      's3',
      stringToSign,
    )
  }

  /**
   * Signs "simple" (non-chunked) upload requests.
   *
   * @param {Request} req
   *   Express request object.
   * @param {Response} res
   *   Express response object.
   */
  private static signPolicy(req: Request, res: Response): void {
    const policy = req.body
    const base64Policy = new Buffer(JSON.stringify(policy)).toString('base64')
    const signature = UploaderController.signV4Policy(policy, base64Policy)

    const jsonResponse = {
      policy: base64Policy,
      signature: signature,
    }

    res.setHeader('Content-Type', 'application/json')

    if (UploaderController.isPolicyValid(req.body)) {
      res.end(JSON.stringify(jsonResponse))
    } else {
      res.status(400)
      res.end(JSON.stringify({ invalid: true }))
    }
  }

  private static signV4Policy(policy: any, base64Policy: string): string {
    let conditions = policy.conditions,
      credentialCondition

    for (var i = 0; i < conditions.length; i++) {
      credentialCondition = conditions[i]['x-amz-credential']
      if (credentialCondition != null) {
        break
      }
    }

    const matches = /.+\/(.+)\/(.+)\/s3\/aws4_request/.exec(credentialCondition)!
    return UploaderController.getV4SignatureKey(
      config.aws.secretKey,
      matches[1],
      matches[2],
      's3',
      base64Policy,
    )
  }

  /**
   * Ensures the policy document associated with a "simple" (non-chunked) request is
   * targeting the correct bucket and the min/max-size is as expected.
   * Comment out the expectedMaxSize and expectedMinSize variables near
   * the top of this file to disable size validation on the policy document.
   *
   * @param {any} policy
   *   Policy to validate.
   */
  private static isPolicyValid(policy: any): boolean {
    let bucket, parsedMaxSize, parsedMinSize, isValid

    policy.conditions.forEach((condition: any) => {
      if (condition.bucket) {
        bucket = condition.bucket
      } else if (condition instanceof Array && condition[0] === 'content-length-range') {
        parsedMinSize = condition[1]
        parsedMaxSize = condition[2]
      }
    })

    isValid = bucket === config.aws.bucket

    // If expectedMinSize and expectedMax size are not null (see above), then
    // ensure that the client and server have agreed upon the exact same
    // values.
    if (expectedMinSize != null && expectedMaxSize != null) {
      isValid =
        isValid &&
        parsedMinSize === expectedMinSize.toString() &&
        parsedMaxSize === expectedMaxSize.toString()
    }
    return isValid
  }

  /**
   * Ensures the REST request is targeting the correct bucket.
   * Omit if you don't want to support chunking.
   *
   * @param headerStr
   */
  private static isValidRestRequest(headerStr: string): boolean {
    return (
      new RegExp(`host:${config.aws.bucket}.s3.eu-west-1.amazonaws.com`).exec(headerStr) != null
    )
  }

  private static getV4SignatureKey(
    key: string,
    dateStamp: string,
    regionName: any,
    serviceName: any,
    stringToSign: string,
  ) {
    const kDate = CryptoJS.HmacSHA256(dateStamp, `AWS4${key}`)
    const kRegion = CryptoJS.HmacSHA256(regionName, kDate)
    const kService = CryptoJS.HmacSHA256(serviceName, kRegion)
    const kSigning = CryptoJS.HmacSHA256('aws4_request', kService)

    return CryptoJS.HmacSHA256(stringToSign, kSigning).toString()
  }
}
