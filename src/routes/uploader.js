
import {
  getSignature,
  onSuccess
} from '../models/uploader'

// import { isAuthed } from '../helpers/authenticate'

export default function uploaderRoutes(app) {
  app.post('/api/uploader/sign', getSignature)
  app.post('/api/uploader/success', onSuccess)
}
