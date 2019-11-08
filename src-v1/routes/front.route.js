"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var authenticate_1 = require("../helpers/authenticate");
var frontModel = __importStar(require("../models/front.model"));
var router = express_1.default.Router();
router.route('/albums')
    .post(authenticate_1.isAuthed, function (req, res) {
    frontModel.getList(req, res);
});
exports.default = router;
