import { useState } from 'react'
import AppSettings from './AppSettings';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [authType, setAuthType] = useState('None');
  const [bearerToken, setBearerToken] = useState('');
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [responseHeaders, setResponseHeaders] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [variables, setVariables] = useState({ baseUrl: 'https://api.example.com' });

  const handleHeaderChange = (idx, field, value) => {
    const newHeaders = [...headers];
    newHeaders[idx][field] = value;
    setHeaders(newHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (idx) => {
    setHeaders(headers.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setResponseHeaders(null);
    setResponseTime(null);
    try {
      // Replace {{var}} in URL with variable values
      let parsedUrl = url;
      parsedUrl = parsedUrl.replace(/{{(\w+)}}/g, (match, varName) => variables[varName] || match);
      const fetchHeaders = {};
      headers.forEach(h => {
        if (h.key) fetchHeaders[h.key] = h.value;
      });
      // Add Authorization header if Bearer Token is selected
      if (authType === 'Bearer' && bearerToken) {
        fetchHeaders['Authorization'] = `Bearer ${bearerToken}`;
      }
      const options = {
        method,
        headers: fetchHeaders,
      };
      if (method !== 'GET' && method !== 'DELETE' && body) {
        options.body = body;
      }
      const start = performance.now();
      const res = await fetch(parsedUrl, options);
      const end = performance.now();
      setResponseTime((end - start).toFixed(2));
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      // Get all headers
      const headersObj = {};
      res.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
      setResponseHeaders(headersObj);
      setResponse({ status: res.status, data });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">API Request Form</h2>
        <button type="button" className="text-blue-600 underline" onClick={() => setShowSettings(v => !v)}>
          {showSettings ? 'Close Settings' : 'Settings'}
        </button>
      </div>
      {showSettings && (
        <AppSettings variables={variables} setVariables={setVariables} />
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="block font-semibold mb-1">Auth</label>
          <select value={authType} onChange={e => setAuthType(e.target.value)} className="border rounded p-2 mr-2">
            <option value="None">None</option>
            <option value="Bearer">Bearer Token</option>
          </select>
          {authType === 'Bearer' && (
            <input
              type="text"
              placeholder="Bearer Token"
              value={bearerToken}
              onChange={e => setBearerToken(e.target.value)}
              className="border rounded p-2 w-1/2"
            />
          )}
        </div>
        <div className="flex gap-2">
          <select value={method} onChange={e => setMethod(e.target.value)} className="border rounded p-2">
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>
          <input
            type="text"
            placeholder="Request URL"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="flex-1 border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Headers</label>
          {headers.map((header, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Key"
                value={header.key}
                onChange={e => handleHeaderChange(idx, 'key', e.target.value)}
                className="border rounded p-2 w-1/3"
              />
              <input
                type="text"
                placeholder="Value"
                value={header.value}
                onChange={e => handleHeaderChange(idx, 'value', e.target.value)}
                className="border rounded p-2 w-1/2"
              />
              <button type="button" onClick={() => removeHeader(idx)} className="text-red-500">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addHeader} className="text-blue-500">Add Header</button>
        </div>
        <div>
          <label className="block font-semibold mb-1">Request Body</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            className="border rounded p-2 w-full min-h-[100px]"
            placeholder="JSON body (for POST/PUT)"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send Request</button>
      </form>
      <div className="mt-6">
        {error && (
          <div className="text-red-600 font-semibold">Error: {error}</div>
        )}
        {response && (
          <div className="bg-gray-100 p-4 rounded shadow">
            <div className="mb-2 font-semibold flex gap-4 items-center">
              <span>Status: <span className="font-mono text-blue-700">{response.status}</span></span>
              {responseTime && <span>Time: <span className="font-mono text-green-700">{responseTime} ms</span></span>}
            </div>
            {responseHeaders && (
              <div className="mb-2">
                <div className="font-semibold">Headers:</div>
                <div className="bg-white border rounded p-2 text-xs max-h-32 overflow-auto">
                  {Object.entries(responseHeaders).map(([k, v]) => (
                    <div key={k}><span className="font-mono text-gray-700">{k}:</span> <span className="font-mono text-gray-900">{v}</span></div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="font-semibold mb-1">Body:</div>
              {typeof response.data === 'object' ? (
                <SyntaxHighlighter language="json" style={oneDark} customStyle={{ borderRadius: '8px', fontSize: '1em', padding: '1em' }}>
                  {JSON.stringify(response.data, null, 2)}
                </SyntaxHighlighter>
              ) : (
                <pre className="text-left whitespace-pre-wrap break-all bg-white border rounded p-2">{response.data}</pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App
