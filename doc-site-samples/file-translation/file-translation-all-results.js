/**
* Demo program of getting all file results.
* Command line: node ./file-translation-all-results.js
* Required npm libs: superagent, crypto
*/
const superagent = require('superagent');
const crypto = require('crypto');

const authConfig = {
  accessKey: '87c1c7fae381341a5d33eaaf18628971676f74a1a14b95e2a2eb5b31e8e1b700',
  secretKey: '271412aa3643e8ecfc4d253db76c6affc23a1d58035fa3f0ad398cc63fbd41084a04cbf8f9e6fe815386d752337fd4f5',
  nonce: Date.now().toString()
};

const serverConfig = {
  protocol: 'https:',
  hostname: 'staging-file.classiii.info',
  port: 443
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
*
* @returns {Promise<string>} Server response.
*
* @throws {Error} When unable to complete the request.
*/
const sendRequest = (serverConfig, authConfig) => {
  const url = '/api/v1/translate-result/all';
  const signature = generateSignature(url, authConfig.secretKey, authConfig.nonce);

  superagent.get(`${serverConfig.protocol}//${serverConfig.hostname}${url}`)
  .set({
    accessKey: authConfig.accessKey,
    signature,
    nonce: authConfig.nonce,
  }).end(function(req, resp) {
    console.log(resp.text);
  });
};

const main = async () => {
  try {
    await sendRequest(serverConfig, authConfig);
  } catch (error) {
    console.error(error);
  }
};

main();