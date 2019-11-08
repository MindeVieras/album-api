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
var utilsModel = __importStar(require("../models/utils.model"));
var router = express_1.default.Router();
router.route('/ip-location/:ip')
    .get(authenticate_1.isAuthed, function (req, res) {
    utilsModel.ipLocation(req, res);
});
router.route('/app-settings')
    .get(function (req, res) {
    utilsModel.getAppSettings(req, res);
});
router.route('/admin-settings')
    .get(authenticate_1.isAuthed, function (req, res) {
    utilsModel.getAdminSettings(req, res);
})
    .post(authenticate_1.isAuthed, function (req, res) {
    utilsModel.saveAdminSetting(req, res);
});
router.route('/front-settings')
    .get(authenticate_1.isAuthed, function (req, res) {
    utilsModel.getFrontSettings(req, res);
})
    .post(authenticate_1.isAuthed, function (req, res) {
    utilsModel.saveFrontSetting(req, res);
});
exports.default = router;
