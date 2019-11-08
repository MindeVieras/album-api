"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var db_1 = require("../../../db");
var config_1 = require("../../../config");
var conn = new db_1.Database();
var elastictranscoder = new aws_sdk_1.default.ElasticTranscoder();
function generate(s3_key, width, height) {
    return new Promise(function (resolve, reject) {
        var hdPerimeter = 1280 + 720;
        var fullhdPerimeter = 1920 + 1080;
        var videoPerimeter = width + height;
        var presets, jobsDone;
        // @ts-ignore
        conn.query("SELECT * FROM video_presets")
            .then(function (rows) {
            if (rows.length) {
                presets = rows;
                if (videoPerimeter < hdPerimeter) {
                    return createJobs(['medium'], s3_key, presets);
                }
                else if (videoPerimeter < fullhdPerimeter) {
                    return createJobs(['medium', 'hd'], s3_key, presets);
                }
                else {
                    return createJobs(['medium', 'hd', 'fullhd'], s3_key, presets);
                }
            }
            else {
                throw 'No video presets found';
            }
        })
            .then(function (jobs) {
            return readJobs(jobs);
        })
            .then(function (jobCompleted) {
            jobsDone = jobCompleted;
            var response = {
                medium: require('../../../helpers/media').video(s3_key, 'medium'),
                hd: require('../../../helpers/media').video(s3_key, 'hd'),
                thumbs: {
                    medium: require('../../../helpers/media').videoThumb(s3_key, 'medium')
                }
            };
            resolve(response);
        })
            .catch(function (err) {
            reject(err);
        });
    });
}
exports.generate = generate;
// Create jobs async loop function
function createJobs(jobs, s3_key, presets) {
    return __awaiter(this, void 0, void 0, function () {
        var responseList, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    responseList = [];
                    _loop_1 = function (i) {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, new Promise(function (resolve) {
                                        var name = jobs[i];
                                        var preset = findPreset(name, presets);
                                        var params = createJobParam(s3_key, name, preset.preset_id);
                                        elastictranscoder.createJob(params, function (err, tsData) {
                                            if (err)
                                                console.log(err.stack);
                                            else {
                                                responseList.push(tsData);
                                                resolve();
                                            }
                                        });
                                    })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < jobs.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, responseList];
            }
        });
    });
}
// Create jobs async loop function
function readJobs(jobs) {
    return __awaiter(this, void 0, void 0, function () {
        var responseList, _loop_2, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    responseList = [];
                    _loop_2 = function (i) {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, new Promise(function (resolve) {
                                        var Id = jobs[i].Job.Id;
                                        // Status values: Submitted, Progressing, Complete, Canceled, or Error.
                                        var params = { Id: Id };
                                        var readJobInterval = setInterval(function () {
                                            elastictranscoder.readJob(params, function (err, jobData) {
                                                if (err) {
                                                    clearInterval(readJobInterval);
                                                    console.log(err.stack);
                                                }
                                                else {
                                                    var Status = jobData.Job.Status;
                                                    if (Status === 'Complete' || Status === 'Canceled' || Status === 'Error') {
                                                        clearInterval(readJobInterval);
                                                        responseList.push(jobData);
                                                        resolve();
                                                    }
                                                }
                                            });
                                        }, 500);
                                    })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < jobs.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_2(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, responseList];
            }
        });
    });
}
// Find preset in presets array
function findPreset(name, presets) {
    var param;
    presets.map(function (p) {
        if (p.name === name) {
            param = p;
        }
    });
    return param;
}
// Creates parameter object for TS
function createJobParam(s3_key, name, preset_id) {
    var ext = path_1.default.extname(s3_key);
    var thumbPath = 'videos/thumbs/' + name + '/' + path_1.default.basename(s3_key, ext) + '-';
    var params = {
        PipelineId: config_1.config.aws.transcoderPipeline,
        Input: {
            AspectRatio: 'auto',
            Container: 'auto',
            FrameRate: 'auto',
            Interlaced: 'auto',
            Key: s3_key,
            Resolution: 'auto',
        },
        Output: {
            Key: 'videos/' + name + '/' + path_1.default.basename(s3_key),
            PresetId: preset_id,
            Rotate: 'auto',
            ThumbnailPattern: thumbPath + '{count}'
        }
    };
    return params;
}
