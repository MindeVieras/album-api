
import {
  create, moveToTrash,
  getList, getListDates,
  getOne,
  rename, changeDate,
  setLocation, updateLocation, removeLocation
} from '../models/albums'

import { isAuthed } from '../helpers/authenticate'

export default function albumsRoutes(app) {

  app.post('/api/albums/create', isAuthed, create)
  app.delete('/api/albums/move-to-trash/:id', isAuthed, moveToTrash)

  app.post('/api/albums/get-list', isAuthed, getList)
  app.get('/api/albums/get-list-dates', isAuthed, getListDates)
  app.get('/api/albums/get-one/:id', isAuthed, getOne)
  
  app.post('/api/albums/rename', isAuthed, rename)
  app.post('/api/albums/change-date', isAuthed, changeDate)
  
  app.post('/api/albums/set-location', isAuthed, setLocation)
  app.post('/api/albums/update-location', isAuthed, updateLocation)
  app.get('/api/albums/remove-location/:id', isAuthed, removeLocation)

}
