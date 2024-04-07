"use strict";

function OnetWebService(api_key) {
  this._config = {
    api_key: api_key
  };
  this.set_version();
}

OnetWebService.prototype.set_version = function(version) {
  if (version === undefined) {
    this._config.baseURL = 'https://api-v2.onetcenter.org/';
  } else {
    this._config.baseURL = 'https://api-v' + version + '.onetcenter.org/';
  }
};

OnetWebService.prototype._encode_query = function(query) {
  return Object.keys(query).map(function(key) {
    var nkey = encodeURIComponent(key);
    var vals = query[key];
    if (!Array.isArray(vals)) {
      vals = [ query[key] ];
    }
    return vals.map(function(value) {
      return nkey + '=' + encodeURIComponent(value);
    }).join('&');
  }).join('&');
}

OnetWebService.prototype._call_xhr = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.timeout = 10000;
  xhr.setRequestHeader('X-API-Key', this._config.api_key);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.ontimeout = function(e) {
    callback({ error: 'Call to ' + url + ' failed with no response from server' });
  };
  xhr.onerror = function(e) {
    if (xhr.statusText != '') {
      callback({ error: 'Call to ' + url + ' failed with reason: ' + xhr.statusText });
    } else {
      callback({ error: 'Call to ' + url + ' failed with unknown reason' });
    }
  };
  xhr.onload = function(e) {
    if (xhr.readyState == 4) {
      if (xhr.status === 200 || xhr.status === 422) {
        callback(JSON.parse(xhr.responseText));
      } else {
        callback({ error: 'Call to ' + url + ' failed with error code ' + xhr.status });
      }
    }
  };
  xhr.send();
};

OnetWebService.prototype._call_fetch = function(url, callback) {
  fetch(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Accept': 'application/json',
      'X-API-Key': this._config.api_key
    }
  })
  .then(function(response) {
    if (response.status == 200 || response.status == 422) {
      response.json()
        .then(callback)
        .catch(function(error) {
          callback({ error: 'Call to ' + url + ' failed on JSON parse' });
        });
    } else {
      callback({ error: 'Call to ' + url + ' failed with error code ' + response.status });
    }
  })
  .catch(function(error) {
    if (error.message) {
      callback({ error: 'Call to ' + url + ' failed with reason: ' + error.message });
    } else {
      callback({ error: 'Call to ' + url + ' failed with unknown reason' });
    }
  });
};

OnetWebService.prototype.call = function(path, query, callback) {
  var url = this._config.baseURL + path;
  if (query !== null && query !== undefined) {
    url += '?' + this._encode_query(query);
  }
  
  if (self.fetch) {
    this._call_fetch(url, callback);
  } else {
    this._call_xhr(url, callback);
  }
  
};
