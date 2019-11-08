"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var crypto_js_1 = __importDefault(require("crypto-js"));
var config_1 = require("../config");
var db_1 = require("../db");
var getMediaDimensions = require('./aws/lambda/get_media_dimensions');
var conn = new db_1.Database();
var clientSecretKey = config_1.config.aws.secretKey;
// Set these two values to match your environment
var expectedBucket = config_1.config.aws.bucket;
var expectedHostname = config_1.config.aws.bucket + ".s3.eu-west-1.amazonaws.com";
// CHANGE TO INTEGERS TO ENABLE POLICY DOCUMENT VERIFICATION ON FILE SIZE
// (recommended)
var expectedMinSize = null;
var expectedMaxSize = null;
var s3 = new aws_sdk_1.default.S3();
// get AWS signature for client fineuploader
function getSignature(req, res) {
    if (typeof req.query.success !== 'undefined') {
        verifyFileInS3(req, res);
    }
    else {
        signRequest(req, res);
    }
}
exports.getSignature = getSignature;
// Signs any requests.  Delegate to a more specific signer based on type of request.
function signRequest(req, res) {
    if (req.body.headers) {
        signRestRequest(req, res);
    }
    else {
        signPolicy(req, res);
    }
}
// Signs multipart (chunked) requests.  Omit if you don't want to support chunking.
function signRestRequest(req, res) {
    var version = req.query.v4 ? 4 : 2, stringToSign = req.body.headers, signature = version === 4 ? signV4RestRequest(stringToSign) : signV2RestRequest(stringToSign);
    var jsonResponse = {
        signature: signature
    };
    res.setHeader('Content-Type', 'application/json');
    if (isValidRestRequest(stringToSign, version)) {
        res.end(JSON.stringify(jsonResponse));
    }
    else {
        res.status(400);
        res.end(JSON.stringify({ invalid: true }));
    }
}
function signV2RestRequest(headersStr) {
    return getV2SignatureKey(clientSecretKey, headersStr);
}
function signV4RestRequest(headersStr) {
    var matches = /.+\n.+\n(\d+)\/(.+)\/s3\/aws4_request\n([\s\S]+)/.exec(headersStr), hashedCanonicalRequest = crypto_js_1.default.SHA256(matches[3]), stringToSign = headersStr.replace(/(.+s3\/aws4_request\n)[\s\S]+/, '$1' + hashedCanonicalRequest);
    return getV4SignatureKey(clientSecretKey, matches[1], matches[2], 's3', stringToSign);
}
// Signs "simple" (non-chunked) upload requests.
function signPolicy(req, res) {
    var policy = req.body, base64Policy = new Buffer(JSON.stringify(policy)).toString('base64'), signature = req.query.v4 ? signV4Policy(policy, base64Policy) : signV2Policy(base64Policy);
    var jsonResponse = {
        policy: base64Policy,
        signature: signature
    };
    // console.log(jsonResponse)
    res.setHeader('Content-Type', 'application/json');
    if (isPolicyValid(req.body)) {
        res.end(JSON.stringify(jsonResponse));
    }
    else {
        res.status(400);
        res.end(JSON.stringify({ invalid: true }));
    }
}
function signV2Policy(base64Policy) {
    return getV2SignatureKey(clientSecretKey, base64Policy);
}
function signV4Policy(policy, base64Policy) {
    var conditions = policy.conditions, credentialCondition;
    for (var i = 0; i < conditions.length; i++) {
        credentialCondition = conditions[i]['x-amz-credential'];
        if (credentialCondition != null) {
            break;
        }
    }
    var matches = /.+\/(.+)\/(.+)\/s3\/aws4_request/.exec(credentialCondition);
    return getV4SignatureKey(clientSecretKey, matches[1], matches[2], 's3', base64Policy);
}
// Ensures the REST request is targeting the correct bucket.
// Omit if you don't want to support chunking.
function isValidRestRequest(headerStr, version) {
    if (version === 4) {
        return new RegExp('host:' + expectedHostname).exec(headerStr) != null;
    }
    return new RegExp('\/' + expectedBucket + '\/.+$').exec(headerStr) != null;
}
// Ensures the policy document associated with a "simple" (non-chunked) request is
// targeting the correct bucket and the min/max-size is as expected.
// Comment out the expectedMaxSize and expectedMinSize variables near
// the top of this file to disable size validation on the policy document.
function isPolicyValid(policy) {
    var bucket, parsedMaxSize, parsedMinSize, isValid;
    policy.conditions.forEach(function (condition) {
        if (condition.bucket) {
            bucket = condition.bucket;
        }
        else if (condition instanceof Array && condition[0] === 'content-length-range') {
            parsedMinSize = condition[1];
            parsedMaxSize = condition[2];
        }
    });
    isValid = bucket === expectedBucket;
    // If expectedMinSize and expectedMax size are not null (see above), then
    // ensure that the client and server have agreed upon the exact same
    // values.
    if (expectedMinSize != null && expectedMaxSize != null) {
        isValid = isValid && (parsedMinSize === expectedMinSize.toString())
            && (parsedMaxSize === expectedMaxSize.toString());
    }
    return isValid;
}
// After the file is in S3, make sure it isn't too big.
// Omit if you don't have a max file size, or add more logic as required.
function verifyFileInS3(req, res) {
    function headReceived(err, data) {
        if (err) {
            res.status(500);
            console.log(err);
            res.end(JSON.stringify({ error: 'Problem querying S3!' }));
        }
        else if (expectedMaxSize != null && data.ContentLength > expectedMaxSize) {
            res.status(400);
            res.write(JSON.stringify({ error: 'Too big!' }));
            deleteFile(req.body.bucket, req.body.key, function (err) {
                if (err) {
                    console.log('Couldn\'t delete invalid file!');
                }
                res.end();
            });
        }
        else {
            res.end();
        }
    }
    callS3('head', {
        bucket: req.body.bucket,
        key: req.body.key
    }, headReceived);
}
function getV2SignatureKey(key, stringToSign) {
    var words = crypto_js_1.default.HmacSHA1(stringToSign, key);
    return crypto_js_1.default.enc.Base64.stringify(words);
}
function getV4SignatureKey(key, dateStamp, regionName, serviceName, stringToSign) {
    var kDate = crypto_js_1.default.HmacSHA256(dateStamp, 'AWS4' + key), kRegion = crypto_js_1.default.HmacSHA256(regionName, kDate), kService = crypto_js_1.default.HmacSHA256(serviceName, kRegion), kSigning = crypto_js_1.default.HmacSHA256('aws4_request', kService);
    return crypto_js_1.default.HmacSHA256(stringToSign, kSigning).toString();
}
function deleteFile(bucket, key, callback) {
    callS3('delete', {
        bucket: bucket,
        key: key
    }, callback);
}
function callS3(type, spec, callback) {
    s3[type + 'Object']({
        Bucket: spec.bucket,
        Key: spec.key
    }, callback);
}
// on uploader success
function onSuccess(req, res) {
    var _a = req.body, key = _a.key, name = _a.name, filesize = _a.filesize, mime = _a.mime, entity = _a.entity, entity_id = _a.entity_id, status = _a.status;
    var uid = req.app.get('user').uid;
    if (key) {
        var fileData_1 = {};
        getMediaDimensions.get(key)
            .then(function (dimensions) {
            fileData_1 = {
                s3_key: key,
                mime: mime,
                filesize: parseInt(filesize),
                org_filename: name,
                entity: parseInt(entity),
                entity_id: parseInt(entity_id),
                status: parseInt(status),
                author: uid,
                width: dimensions.width,
                height: dimensions.height,
                weight: 0
            };
            return conn.query("INSERT INTO media set ?", fileData_1);
        })
            .then(function (row) {
            var fileCopy = __rest(fileData_1, []);
            fileData_1 = __assign(__assign({}, fileCopy), { media_id: row.insertId });
            res.json({ success: true, data: fileData_1 });
        })
            .catch(function (err) {
            var msg = err.sqlMessage ? err.sqlMessage : err;
            res.json({ ack: 'err', msg: msg });
        });
    }
    else {
        res.json({ ack: 'err', msg: 'No key' });
    }
}
exports.onSuccess = onSuccess;
