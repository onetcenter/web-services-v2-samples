"use strict"
const axios = require('axios')
const querystring = require('querystring')

class OnetWebService {
  constructor(api_key) {
    this._config = {
      method: 'get',
      headers: {
        'User-Agent': 'nodejs-OnetWebService/2.00 (bot)',
        'X-API-Key': api_key,
        'Accept': 'application/json'
      },
      timeout: 10000,
      maxRedirects: 0
    }
    this.set_version()
  }
  
  set_version(version) {
    if (version === undefined) {
      this._config.baseURL = 'https://api-v2.onetcenter.org/'
    } else {
      this._config.baseURL = 'https://api-v' + version + '.onetcenter.org/'
    }
  }
  
  async call(path, query) {
    const config = Object.assign({}, this._config)
    if (query === undefined) {
      config.url = path
    } else {
      config.url = path + '?' + querystring.stringify(query)
    }
    
    let result = { error: 'Call to ' + config.baseURL + config.url + ' failed with unknown reason' }
    try {
      const response = await axios(config)
      if (response.status == 200) {
        result = response.data
      } else {
        result = { error: 'Call to ' + config.baseURL + config.url + ' failed with error code ' + response.status }
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status == 422) {
          result = error.response.data
        } else {
          result = { error: 'Call to ' + config.baseURL + config.url + ' failed with error code ' + error.response.status }
        }
      } else if (error.request) {
        result = { error: 'Call to ' + config.baseURL + config.url + ' failed with no response from server' }
      } else if (error.message) {
        result = { error: 'Call to ' + config.baseURL + config.url + 'failed with reason: ' + error.message }
      }
    }
    return result
  }
}

module.exports = OnetWebService
