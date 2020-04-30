/**
* Demo program of update user dictionary.
* Command line: node ./update-user-dict.js entryId
* Required npm libs: superagent, crypto
*/
const superagent = require('superagent');
const crypto = require('crypto');

const serverConfig = {
    protocol: 'https:',
    hostname: 'staging1.classiii.info',
    port: 443
};

const authConfig = {
    accessKey: '87c1c7fae381341a5d33eaaf18628971676f74a1a14b95e2a2eb5b31e8e1b700',
    secretKey: '271412aa3643e8ecfc4d253db76c6affc23a1d58035fa3f0ad398cc63fbd41084a04cbf8f9e6fe815386d752337fd4f5',
    nonce: Date.now().toString()
};

const signatureHMACAlgo = 'sha256';
const signatureHMACEncoding = 'hex';
/**
 * Generates a request signature.
 *
 * @param {string} path Path.
 * @param {string} secretKey Secret key.
 * @param {string} nonce Nonce.
 *
 * @returns {string} The request signature.
 */
const generateSignature = (path, secretKey, nonce) => {
    const hmac = crypto.createHmac(signatureHMACAlgo, secretKey);
    hmac.update(nonce);
    hmac.update(path);
    return hmac.digest(signatureHMACEncoding);
};

/**
* @param {object} serverConfig Server configurations.
* @param {string} serverConfig.protocol Server protocol.
* @param {string} serverConfig.hostname Server hostname.
* @param {number} serverConfig.port Server listening port.
* @param {object} authConfig Authentication configurations.
* @param {string} authConfig.accessKey Access key.
* @param {string} authConfig.secretKey Secret key.
* @param {string} authConfig.nonce Nonce.
* @param {object} payload Dictionary payload
* @param {string} payload.fromLang Language to be translated.
* @param {string} payload.fromText Text to be translated.
* @param {string} payload.toLang Language translate to.
* @param {string} payload.toText Text translate to.
* @param {string} entryId Dictionary id, can be obtained by get request.
*
* @returns {Promise<string>} Server response.
*
* @throws {Error} When unable to complete the request.
*/
const sendRequest = (serverConfig, authConfig, payload, entryId) => {
    const url = `/api/v1/dictionary/${entryId}`;
    const signature = generateSignature(url, authConfig.secretKey, authConfig.nonce);

    const headers = {
        accessKey: authConfig.accessKey,
        signature,
        nonce: authConfig.nonce,
    }
    return superagent.put(`${serverConfig.protocol}//${serverConfig.hostname}${url}`)
        .set(headers)
        .send(payload)
        .then((res) => {
            return res.body;
        }).catch((err) => {
            return err.message;
        })
};

const main = async () => {
    const payload = {
        'fromLang': 'ja',
        'fromText': '金曜日',
        'toLang': 'en',
        'toText': 'FRIDAY'
    }
    if (process.argv.length < 3) {
        console.error('Please input dictionary entry id!');
        return;
    }
    const entryId = process.argv[2];
    try {
        const response = await sendRequest(serverConfig, authConfig, payload, entryId);
        console.log('Server response:');
        console.log(response);
    } catch (error) {
        console.error(error);
    }
};

main();