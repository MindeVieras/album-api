"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var body_parser_1 = __importDefault(require("body-parser"));
var cors_1 = __importDefault(require("cors"));
var express_1 = __importDefault(require("express"));
var morgan_1 = __importDefault(require("morgan"));
var path_1 = __importDefault(require("path"));
var config_1 = require("./config");
var index_route_1 = __importDefault(require("./routes/index.route"));
/**
 * Server class.
 *
 * @class
 */
var Server = /** @class */ (function () {
    function Server() {
        /**
         * Setup express app.
         */
        this.app = express_1.default();
        // Disable useless header.
        this.app.disable('x-powered-by');
        // CORS.
        this.app.use(cors_1.default());
        // Body parser.
        this.app.use(body_parser_1.default.urlencoded({
            extended: true,
            limit: '50mb',
        }));
        this.app.use(body_parser_1.default.json({
            limit: '50mb',
        }));
        // Middleware only for dev environment.
        if (config_1.config.env === 'development') {
            // Logger
            this.app.use(morgan_1.default('dev'));
        }
        // Home route
        this.app.get('/', function (req, res) {
            res.sendFile(path_1.default.join(__dirname, './index.html'));
        });
        // API routes.
        this.app.use('/api', index_route_1.default);
    }
    /**
     * Start HTTP server.
     */
    Server.prototype.listen = function () {
        this.app.listen(config_1.config.port, function () {
            if (config_1.config.env === 'development') {
                console.log("Server running at http://" + config_1.config.host + ":" + config_1.config.port);
            }
        });
    };
    return Server;
}());
exports.default = Server;
