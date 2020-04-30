/**
* Demo program of send async translation request.
* Command line: node ./async-translation-request.js
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
* Sends request for speech-to-speech translation.
*
* @param {object} serverConfig Server configurations.
* @param {string} serverConfig.protocol Server protocol.
* @param {string} serverConfig.hostname Server hostname.
* @param {number} serverConfig.port Server listening port.
* @param {object} authConfig Authentication configurations.
* @param {string} authConfig.accessKey Access key.
* @param {string} authConfig.secretKey Secret key.
* @param {string} authConfig.nonce Nonce.
* @param {object} payload Dictionary payload
* @param {string} payload.sourceLang Language to be translated.
* @param {string} payload.targetLang Language translate to.
* @param {string} payload.fieldId Field id, 1 for all.
* @param {Array}  payload.text Text to be transalted.
*
* @returns {Promise<string>} Server response.
*
* @throws {Error} When unable to complete the request.
*/
const sendRequest = (serverConfig, authConfig, payload) => {
    const url = '/api/v1/translate/async';
    const signature = generateSignature(url, authConfig.secretKey, authConfig.nonce);

    const headers = {
        accessKey: authConfig.accessKey,
        signature,
        nonce: authConfig.nonce,
    }
    return superagent.post(`${serverConfig.protocol}//${serverConfig.hostname}${url}`)
        .set(headers)
        .send(payload)
        .then((res) => {
            return JSON.stringify(res.body);
        }).catch((err) => {
            return err.message;
        })
        
};

const main = async () => {
    const payload = {
        'fieldId': '1',
        'text': [
            'This is a pen.',
            'I like apple.'
        ],
        'targetLang': 'ja',
        'sourceLang': 'en'
    }
    try {
        const response = await sendRequest(
            serverConfig,
            authConfig,
            payload
        );
        console.log('Server response:');
        console.log(response);
    } catch (error) {
        console.error(error);
    }
};

main();