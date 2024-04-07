﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json.Nodes;

public class OnetWebService
{
    public class QueryParams : IEnumerable<KeyValuePair<string, string>>
    {
        private List<KeyValuePair<string, string>> internalParams = new List<KeyValuePair<string, string>>();
        public IEnumerator<KeyValuePair<string, string>> GetEnumerator() => internalParams.GetEnumerator();
        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => internalParams.GetEnumerator();

        public void Add(string key, string value) => internalParams.Add(new KeyValuePair<string, string>(key, value));
    }

    private string baseURL;
    private HttpClient client;

    private static string EncodeAuth(string username, string password)
    {
        return Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes(username + ":" + password));
    }

    public OnetWebService(string api_key)
    {
        HttpClientHandler handler = new HttpClientHandler()
        {
            AllowAutoRedirect = false,
        };
        client = new HttpClient(handler);
        client.Timeout = new TimeSpan(0, 0, 10);
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        client.DefaultRequestHeaders.UserAgent.ParseAdd("dotnet-OnetWebService/2.00 (bot)");
        client.DefaultRequestHeaders.Add("X-API-Key", api_key);

        SetVersion();
    }

    public void SetVersion(string version = "")
    {
        if (version == "")
        {
            baseURL = "https://api-v2.onetcenter.org/";
        }
        else
        {
            baseURL = "https://api-v" + version + ".onetcenter.org/";
        }
    }

    public async Task<JsonNode> Call(string path, QueryParams query = null)
    {
        List<string> encoded_params = new List<string>();
        if (query != null)
        {
            foreach (KeyValuePair<string, string> pair in query)
            {
                encoded_params.Add(System.Net.WebUtility.UrlEncode(pair.Key) + "=" + System.Net.WebUtility.UrlEncode(pair.Value));
            }
        }
        string url = baseURL + path;
        if (encoded_params.Count > 0)
        {
            url += "?" + String.Join("&", encoded_params.ToArray());
        }

        JsonNode result = new JsonObject
        {
            ["error"] = "Call to " + url + " failed with unknown reason"
        };

        try
        {
            HttpResponseMessage response = await client.GetAsync(url);
            if (response.StatusCode == (System.Net.HttpStatusCode)200 || response.StatusCode == (System.Net.HttpStatusCode)422)
            {
                result = JsonNode.Parse(await response.Content.ReadAsStringAsync());
            }
            else
            {
                result["error"] = "Call to " + url + " failed with error code " + ((int)response.StatusCode).ToString();
            }
        }
        catch (HttpRequestException e)
        {
            result["error"] = "Call to " + url + " failed with reason: " + e.Message;
        }

        return result;
    }
}
