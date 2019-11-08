"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var authenticate_1 = require("../helpers/authenticate");
var trash_model_1 = require("../models/trash.model");
var router = express_1.default.Router();
router.get('/get-list', authenticate_1.isAdmin, trash_model_1.getList);
router.post('/restore/:id', authenticate_1.isAdmin, trash_model_1.restore);
router.delete('/delete/:id', authenticate_1.isAdmin, trash_model_1._delete);
exports.default = router;
