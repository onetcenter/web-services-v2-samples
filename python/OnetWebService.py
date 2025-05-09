import urllib.request, urllib.parse, urllib.error
import urllib.request, urllib.error, urllib.parse
import base64
import json

class OnetWebService:
    
    def __init__(self, api_key):
        self._headers = {
            'User-Agent': 'python-OnetWebService/2.00 (bot)',
            'X-API-Key': api_key,
            'Accept': 'application/json' }
        self.set_version()
    
    def set_version(self, version = None):
        if version is None:
            self._url_root = 'https://api-v2.onetcenter.org/'
        else:
            self._url_root = 'https://api-v' + version + '.onetcenter.org/'
    
    def call(self, path, *query):
        try:
            url = self._url_root + path
            if len(query) > 0:
                url += '?' + urllib.parse.urlencode(query, True)
            req = urllib.request.Request(url, None, self._headers)
            handle = None
            try:
                handle = urllib.request.urlopen(req)
            except urllib.error.HTTPError as e:
                if e.code == 422:
                    try:
                        return json.load(e)
                    except json.JSONDecodeError:
                        return { 'error': 'Call to ' + url + ' failed to return valid JSON' }
                    except UnicodeDecodeError:
                        return { 'error': 'Call to ' + url + ' failed to return valid UTF-8' }
                else:
                    return { 'error': 'Call to ' + url + ' failed with error code ' + str(e.code) }
            except urllib.error.URLError as e:
                return { 'error': 'Call to ' + url + ' failed with reason: ' + str(e.reason) }
            code = handle.getcode()
            if (code != 200) and (code != 422):
                return { 'error': 'Call to ' + url + ' failed with error code ' + str(code),
                        'urllib2_info': handle }
            try:
                return json.load(handle)
            except json.JSONDecodeError:
                return { 'error': 'Call to ' + url + ' failed to return valid JSON' }
            except UnicodeDecodeError:
                return { 'error': 'Call to ' + url + ' failed to return valid UTF-8' }
        except Exception as e:
            return { 'error': 'Call failed with unexpected error', 'exception': e }
