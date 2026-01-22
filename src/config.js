const path = require('path');
const fs = require('fs');
const os = require('os');
const RammerheadJSMemCache = require('./classes/RammerheadJSMemCache.js');
const RammerheadJSFileCache = require('./classes/RammerheadJSFileCache.js');

const enableWorkers = os.cpus().length !== 1;

module.exports = {
    //// HOSTING CONFIGURATION ////
    
    // Bind to Koyeb-assigned port or all interfaces
    bindingAddress: process.env.BINDING_ADDRESS || '0.0.0.0',
    port: parseInt(process.env.PORT || 8080),
    crossDomainPort: parseInt(process.env.CROSS_DOMAIN_PORT || 8081),
    publicDir: path.join(__dirname, '../public'), // set to null to disable
    hostname: process.env.HOSTNAME || 'localhost',

    // enable or disable multithreading
    enableWorkers,
    workers: os.cpus().length,

    // ssl object is either null or { key: fs.readFileSync('path/to/key'), cert: fs.readFileSync('path/to/cert') }
    ssl: null,

    // return object determines client URL rewriting
    getServerInfo: (req) => {
        return {
            hostname: req ? req.headers.host.split(':')[0] : 'sharky.koyeb.app',
            port: null, 
            crossDomainPort: null, // Forces everything through the single allowed port
            protocol: 'https:'
        };
    },    

    // enforce a password for creating new sessions
    password: null,

    // localStorage sync
    disableLocalStorageSync: false,

    // restrict sessions per IP
    restrictSessionToIP: false,

    // caching options for JS rewrites
    jsCache: new RammerheadJSFileCache(path.join(__dirname, '../cache-js'), 5 * 1024 * 1024 * 1024, 50000, enableWorkers),

    // HTTP/2 support
    disableHttp2: false,

    //// REWRITE HEADER CONFIGURATION ////
    stripClientHeaders: [],
    rewriteServerHeaders: {},

    //// SESSION STORE CONFIG ////
    fileCacheSessionConfig: {
        saveDirectory: path.join(__dirname, '../sessions'),
        cacheTimeout: 1000 * 60 * 20, // 20 minutes
        cacheCheckInterval: 1000 * 60 * 10, // 10 minutes
        deleteUnused: true,
        staleCleanupOptions: {
            staleTimeout: 1000 * 60 * 60 * 24 * 3, // 3 days
            maxToLive: null,
            staleCheckInterval: 1000 * 60 * 60 * 6 // 6 hours
        },
        deleteCorruptedSessions: true,
    },

    //// LOGGING CONFIGURATION ////
    logLevel: process.env.DEVELOPMENT ? 'debug' : 'info',
    generatePrefix: (level) => `[${new Date().toISOString()}] [${level.toUpperCase()}] `,
    getIP: (req) => req.socket.remoteAddress
};

// Merge with custom config if exists
if (fs.existsSync(path.join(__dirname, '../config.js'))) Object.assign(module.exports, require('../config'));
