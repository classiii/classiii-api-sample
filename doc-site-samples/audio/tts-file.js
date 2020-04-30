'use strict';

/**
 * Demo program of TTS API (synthesize speech from transcript).
 */

const fs = require('fs');
const http = require('http');
const https = require('https');
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
const data = {
  text: 'こんにちは、いい天気ですね。',
  targetLang: 'ja'
};
const speechFile = 'speech.wav';


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
 * Gets translation result as speech.
 *
 * @param {object} serverConfig Server configurations.
 * @param {string} serverConfig.protocol Server protocol.
 * @param {string} serverConfig.hostname Server hostname.
 * @param {number} serverConfig.port Server listening port.
 * @param {object} authConfig Authentication configurations.
 * @param {string} authConfig.accessKey Access key.
 * @param {string} authConfig.secretKey Secret key.
 * @param {string} authConfig.nonce Nonce.
 * @param {object} data Speech synthesis data.
 * @param {string} data.text Speech transcript.
 * @param {string} data.targetLang Language code of language of synthesized
 *                                 speech.
 *
 * @returns {Promise<void>} Resolves without a value.
 */
const getSpeechResult = (serverConfig, authConfig, data) => {
  const path = '/api/v1/translate/tts';
  const signature = generateSignature(
    path,
    authConfig.secretKey,
    authConfig.nonce
  );
  const requestOptions = {
    protocol: serverConfig.protocol,
    host: serverConfig.hostname,
    port: serverConfig.port,
    method: 'POST',
    path,
    headers: {
      accessKey: authConfig.accessKey,
      signature,
      nonce: authConfig.nonce,
      'Content-Type': 'application/json'
    }
  };
  let client = null;
  if (serverConfig.protocol === 'https:') {
    client = https;
  } else {
    client = http;
  }
  return new Promise((resolve, reject) => {
    const request = client.request(requestOptions, (response) => {
      const writeStream = fs.createWriteStream(speechFile);
      response.pipe(writeStream);
      response.on('close', () => {
        resolve();
      });
    });
    request.on('error', (error) => {
      reject(error);
    });
    request.write(JSON.stringify(data));
    request.end();
  });
};

const main = async () => {
  try {
    await getSpeechResult(serverConfig, authConfig, data);
    console.log('Speech file downloaded to:');
    console.log(speechFile);
  } catch (error) {
    console.error(error);
  }
};

main();