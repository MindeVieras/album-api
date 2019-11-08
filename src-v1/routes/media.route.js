"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var authenticate_1 = require("../helpers/authenticate");
var media_model_1 = require("../models/media.model");
// @ts-ignore
var media_model_2 = require("../models/media.model");
var router = express_1.default.Router();
router.post('/set-location', authenticate_1.isAuthed, media_model_1.setLocation);
router.post('/update-location', authenticate_1.isAuthed, media_model_1.updateLocation);
router.get('/remove-location/:id', authenticate_1.isAuthed, media_model_1.removeLocation);
router.post('/put-to-trash', authenticate_1.isAuthed, media_model_1.putToTrash);
router.post('/move', authenticate_1.isAuthed, media_model_1.moveMedia);
router.post('/save-metadata', authenticate_1.isAuthed, media_model_1.saveMetadata);
router.post('/save-rekognition-labels', authenticate_1.isAuthed, media_model_1.saveRekognitionLabels);
router.post('/save-rekognition-text', authenticate_1.isAuthed, media_model_1.saveRekognitionText);
router.post('/generate-image-thumbs', authenticate_1.isAuthed, media_model_2.generateImageThumbs);
router.post('/generate-videos', authenticate_1.isAuthed, media_model_1.generateVideos);
router.post('/get-image-meta', authenticate_1.isAuthed, media_model_1.getImageMeta);
exports.default = router;
