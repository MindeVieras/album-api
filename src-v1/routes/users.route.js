"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var authenticate_1 = require("../helpers/authenticate");
var users_model_1 = require("../models/users.model");
var router = express_1.default.Router();
router.get('/', authenticate_1.isAdmin, users_model_1.getList);
router.get('/:username', authenticate_1.isAdmin, users_model_1.getUser);
router.post('/', authenticate_1.isAdmin, users_model_1.createUser);
router.delete('/:id', authenticate_1.isAdmin, users_model_1.deleteUser);
exports.default = router;
