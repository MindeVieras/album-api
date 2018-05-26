
export const bucket = process.env.S3_BUCKET
export const aws_region = process.env.AWS_REGION

export const faces_collection = process.env.FACES_COLLECTION || 'album_faces_local'
export const transcoder_pipeline = process.env.TRANSCODER_PIPELINE || '1508692593579-7zkwqr'

export const client_secret_key = process.env.CLIENT_SECRET_KEY || 'tmpciwvK07JglVVpsOkiVv11dGWpmXUK'
export const secret_key = process.env.SECRET_KEY || 'pQDkZonecIPAHdWHnW1OJmMFmSamnfsM'

// DarkSky wheather API
export const darksky_key = process.env.DARKSKY_KEY || 'c930281d59d489723714922f510d8482'
