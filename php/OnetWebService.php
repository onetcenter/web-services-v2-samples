<?php
class OnetWebService
{
  private $ch;
  private $url_root;
  
  function __construct($api_key) {
    $this->ch = curl_init();
    curl_setopt($this->ch, CURLOPT_HTTPHEADER, array("Accept: application/json", "X-API-Key: " . $api_key));
    curl_setopt($this->ch, CURLOPT_USERAGENT, "php-OnetWebService/2.00 (bot)");
    curl_setopt($this->ch, CURLOPT_HEADER, false);
    curl_setopt($this->ch, CURLOPT_RETURNTRANSFER, true);
    
    $this->set_version(NULL);
  }
  
  public function set_version($version) {
    if (is_null($version)) {
      $this->url_root = 'https://api-v2.onetcenter.org/';
    } else {
      $this->url_root = 'https://api-v' . version . '.onetcenter.org/';
    }
  }
  
  public function call($path, $query = NULL) {
    $url = $this->url_root . $path;
    if (!is_null($query)) {
      $qstring = http_build_query($query);
      $qstring = preg_replace('/%5B[0-9]+%5D=/i', '=', $qstring);
      $url .= '?' . $qstring;
    }
    curl_setopt($this->ch, CURLOPT_URL, $url);
    $result = curl_exec($this->ch);
    if (curl_errno($this->ch) != 0) {
      $result = (object)array('error' => curl_error($this->ch),
                              'curl_info' => curl_getinfo($this->ch));
      return $result;
    }
    $info = curl_getinfo($this->ch);
    $http_code = $info['http_code'];
    if ($http_code != 200 && $http_code != 422) {
      $result = (object)array('error' => 'Call to ' . $url . ' failed with error code ' . $http_code,
                              'curl_info' => $info);
      return $result;
    }
    return json_decode($result);
  }
}
?>
