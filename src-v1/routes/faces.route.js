"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var authenticate_1 = require("../helpers/authenticate");
var faces_model_1 = require("../models/faces.model");
var router = express_1.default.Router();
router.get('/detect/:id', authenticate_1.isAuthed, faces_model_1.detectImageFaces);
router.get('/collection', authenticate_1.isAuthed, faces_model_1.getCollectionFaces);
router.delete('/collection/:id', authenticate_1.isAuthed, faces_model_1.deleteCollectionFace);
exports.default = router;
