"use strict";

class OnetWebService {
  constructor(api_key) {
    this._config = {
      api_key: api_key
    };
    this.set_version();
  }

  set_version(version) {
    if (version === undefined) {
      this._config.baseURL = 'https://api-v2.onetcenter.org/';
    } else {
      this._config.baseURL = 'https://api-v' + version + '.onetcenter.org/';
    }
  }

  _encode_query(query) {
    let params = new URLSearchParams();
    for (const key of Object.keys(query)) {
      const val = query[key];
      if (Array.isArray(val)) {
        for (const v of val) {
          params.append(key, v);
        }
      } else {
        params.append(key, val);
      }
    }
    return params.toString();
  }

  call(path, query) {
    let url = this._config.baseURL + path;
    if (query !== null && query !== undefined) {
      url += '?' + this._encode_query(query);
    }
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': this._config.api_key,
          'User-Agent': 'nodejs-OnetWebService/2.10 (bot)'
        }
      })
      .then((response) => {
        if (response.status == 200 || response.status == 422) {
          response.json()
            .then((data) => Object.hasOwn(data, 'error') ? reject(data.error) : resolve(data))
            .catch((error) => reject(`Call to ${url} failed on JSON parse`));
        } else {
          reject(`Call to ${url} failed with error code ${response.status}`);
        }
      })
      .catch((error) => {
        if (error.message) {
          reject(`Call to ${url} failed with reason: ${error.message}`);
        } else {
          reject(`Call to ${url} failed with unknown reason`);
        }
      });
    });
  }
}

module.exports = OnetWebService
