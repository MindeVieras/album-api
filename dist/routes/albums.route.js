'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _authenticate = require('../helpers/authenticate');

var _albums = require('../models/albums.model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.post('/list', _authenticate.isAuthed, _albums.getList);
router.get('/list-dates', _authenticate.isAuthed, _albums.getListDates);
router.get('/one/:id', _authenticate.isAuthed, _albums.getOne);
router.post('/create', _authenticate.isAuthed, _albums.create);
router.post('/rename', _authenticate.isAuthed, _albums.rename);
router.post('/change-date', _authenticate.isAuthed, _albums.changeDate);
router.post('/set-location', _authenticate.isAuthed, _albums.setLocation);
router.post('/update-location', _authenticate.isAuthed, _albums.updateLocation);
router.get('/remove-location/:id', _authenticate.isAuthed, _albums.removeLocation);
router.delete('/move-to-trash/:id', _authenticate.isAuthed, _albums.moveToTrash);

exports.default = router;
//# sourceMappingURL=albums.route.js.map