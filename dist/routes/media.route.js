'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _authenticate = require('../helpers/authenticate');

var _media = require('../models/media.model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.post('/set-location', _authenticate.isAuthed, _media.setLocation);
router.post('/update-location', _authenticate.isAuthed, _media.updateLocation);
router.get('/remove-location/:id', _authenticate.isAuthed, _media.removeLocation);

router.get('/get-all', _authenticate.isAuthed, _media.getAll);
router.post('/put-to-trash', _authenticate.isAuthed, _media.putToTrash);
router.post('/move', _authenticate.isAuthed, _media.moveMedia);
router.post('/save-metadata', _authenticate.isAuthed, _media.saveMetadata);
router.post('/save-rekognition-labels', _authenticate.isAuthed, _media.saveRekognitionLabels);
router.post('/generate-image-thumbs', _authenticate.isAuthed, _media.generateImageThumbs);
router.post('/generate-videos', _authenticate.isAuthed, _media.generateVideos);

router.post('/get-image-meta', _authenticate.isAuthed, _media.getImageMeta);

exports.default = router;
//# sourceMappingURL=media.route.js.map