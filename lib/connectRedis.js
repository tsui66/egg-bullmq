'use strict';

const Redis = require('ioredis');

const redisInstances = new Map();

function createBullConnection(kind, bullRedisUri) {
  const existedClient = redisInstances.get(kind);
  if (existedClient) {
    return existedClient;
  }

  const client = connectRedis(bullRedisUri);
  if (!client) {
    throw new Error(`[egg-bullmq] No redisio connection provided to BULL (${bullRedisUri})!`);
  }

  redisInstances.set(kind, client);
  return client;
}

/**
 * Connect to Redis by URI.
 *
 * Returns tuple of 2 elements:
 *   [0] redisio instance
 *   [1] addBeforeShutdown function which will be called before redis shutdown
 *       this function is usefull when you want to await current Worker's jobs before disconnection redis.
 *
 * See https://github.com/lettuce-io/lettuce-core/wiki/Redis-URI-and-connection-details for URI formats
 * redis://localhost/0
 * rediss://localhost/0
 * redis-sentinel://:pass@localhost:26379,otherhost:26479/0?name=mymaster
 * @param {string} uri The connection string URI
 * @param {object} opts The connection Object OPTIONS
 */
function connectRedis(uri, opts) {
  // TODO: UnhandledPromiseRejectionWarning: MaxRetriesPerRequestError: Reached the max retries per request limit (which is 20). Refer to "maxRetriesPerRequest" option for details.
  let cfg = {
    retryStrategy: times => Math.min(times * 500, 10000),
    reconnectOnError: err => {
      const targetError = 'READONLY';
      if (err.message.slice(0, targetError.length) === targetError) {
        // Only reconnect when the error starts with "READONLY"
        // and resend the failed command after reconnecting
        return 2;
      }
      return false;
    },
  };

  const cs = connectionStringParse(uri);
  if (cs.scheme === 'redis' || cs.scheme === 'rediss') {
    cfg.host = cs.hosts[0].host || 'localhost';
    cfg.port = cs.hosts[0].port || 6379;
    if (cs.scheme === 'rediss') {
      cfg.tls = {};
    }
    if (cs.password) {
      cfg.password = cs.password;
    }
  } else if (
    cs.scheme === 'redis-sentinel' ||
    cs.scheme === 'redis+sentinel' ||
    cs.scheme === 'redis+santinel'
  ) {
    cfg.sentinels = cs.hosts;
    if (cs.password) {
      cfg.sentinelPassword = cs.password;
    }
    cfg.sentinelRetryStrategy = times => Math.min(times * 500, 10000);
  } else {
    throw new Error(`[egg-bullmq] Unsupported connection string provided to connectRedis() method: ${uri}`);
  }

  if (cs.path && cs.path[0]) {
    cfg.db = parseInt(cs.path[0]) || 0;
  }
  if (cs.options && cs.options.db) {
    // convert '0' -> 0
    cs.options.db = parseInt(cs.options.db) || 0;
  }

  cfg = { ...cfg, ...cs.options, ...opts };
  const redis = new Redis(cfg);
  return redis;
}

/**
 * Takes a connection string URI of form:
 *
 *   scheme://[username[:password]@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[path]][?options]
 *
 * and returns an object of form:
 *
 *   {
 *     scheme: string,
 *     username?: string,
 *     password?: string,
 *     hosts: [ { host: string, port?: number }, ... ],
 *     path?: string[],
 *     options?: object
 *   }
 *
 * Where scheme and hosts will always be present. Other fields will only be present in the result if they were
 * present in the input.
 * @param {string} uri  The connection string URI
 */
function connectionStringParse(uri) {
  const connectionStringParser = new RegExp(
    '^\\s*' + // Optional whitespace padding at the beginning of the line
    '([^:]+):\\/\\/' + // Scheme (Group 1)
    '(?:([^:@,/?=&]*)' + // User (Group 2)
    '(?::([^:@,/?=&]*))?@)?' + // Password (Group 3)
    '([^@/?=&]+)' + // Host address(es) (Group 4)
    '(?:\\/([^:@,?=&]+)?)?' + // Endpoint (Group 5)
    '(?:\\?([^:@,/?]+)?)?' + // Options (Group 6)
      '\\s*$', // Optional whitespace padding at the end of the line
    'gi'
  );
  const connectionStringObject = {};

  if (!uri.includes('://')) {
    throw new Error(`No scheme found in URI ${uri}`);
  }

  const tokens = connectionStringParser.exec(uri);

  if (Array.isArray(tokens)) {
    connectionStringObject.scheme = tokens[1];
    connectionStringObject.username = tokens[2] ? decodeURIComponent(tokens[2]) : tokens[2];
    connectionStringObject.password = tokens[3] ? decodeURIComponent(tokens[3]) : tokens[3];
    connectionStringObject.hosts = _parseAddress(tokens[4]);
    connectionStringObject.path = tokens[5]
      ? tokens[5].split('/').map(o => decodeURIComponent(o))
      : [];
    connectionStringObject.options = tokens[6] ? _parseOptions(tokens[6]) : tokens[6];
  }
  return connectionStringObject;
}

/**
 * Parses an address
 * @param {string} addresses The address(es) to process
 */
function _parseAddress(addresses) {
  return addresses.split(',').map(address => {
    const i = address.indexOf(':');

    return (i >= 0
      ? { host: decodeURIComponent(address.substring(0, i)), port: +address.substring(i + 1) }
      : { host: decodeURIComponent(address) });
  });
}

/**
 * Parses options
 * @param {object} options The options to process
 */
function _parseOptions(options) {
  const result = {};

  options.split('&').forEach(option => {
    const i = option.indexOf('=');

    if (i >= 0) {
      result[decodeURIComponent(option.substring(0, i))] = decodeURIComponent(
        option.substring(i + 1)
      );
    }
  });
  return result;
}

exports.connectionStringParse = connectionStringParse;
exports.createBullConnection = createBullConnection;
