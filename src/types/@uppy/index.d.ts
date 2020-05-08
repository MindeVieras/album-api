// Type definitions for @uppy/companion

declare module '@uppy/companion' {
  import { Request, Response, NextFunction } from 'express'

  /**
   * Make the errors available publicly for custom providers.
   */
  namespace errors {
    /**
     * Provider API error.
     */
    interface ProviderApiError {
      new (message: string, statusCode: number): ProviderApiError
    }

    /**
     * Provider Auth error.
     */
    interface ProviderAuthError {
      new (): ProviderAuthError
    }
  }

  export interface IUppyCompanionOptions {
    providerOptions: {
      s3: {
        getKey: (req: Request, filename: string, metadata: any) => string
        key: string
        secret: string
        bucket: string
        region: string
        useAccelerateEndpoint?: boolean
        expires?: number
        acl?: 'private'
      }
    }
    server: {
      host: string
      protocol: 'http' | 'https'
    }
    filePath: string
    secret: string
    debug?: boolean
  }

  /**
   * Entry point into initializing the Companion app.
   *
   * @param {IUppyCompanionOptions} options
   *
   * @return
   */
  function app(
    options: IUppyCompanionOptions,
  ): (req: Request, res: Response, next: NextFunction) => void

  /**
   * Entry point into initializing the Companion app.
   *
   * @param {object} options
   */
  function app(): (req: Request, res: Response, next: NextFunction) => void

  /**
   * The socket is used to send progress events during an upload.
   *
   * @param {object} server
   * @param server
   */
  function socket(server: any): void
}
