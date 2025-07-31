import { useState } from 'react';

export default function AppSettings({ variables, setVariables }) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addVariable = () => {
    if (newKey && newValue) {
      setVariables({ ...variables, [newKey]: newValue });
      setNewKey('');
      setNewValue('');
    }
  };

  const removeVariable = (key) => {
    const updated = { ...variables };
    delete updated[key];
    setVariables(updated);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Settings: Custom Variables</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Variable Name"
          value={newKey}
          onChange={e => setNewKey(e.target.value)}
          className="border rounded p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Value"
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          className="border rounded p-2 mr-2"
        />
        <button type="button" onClick={addVariable} className="bg-blue-500 text-white px-3 py-1 rounded">Add</button>
      </div>
      <div>
        {Object.entries(variables).map(([key, value]) => (
          <div key={key} className="flex items-center mb-2">
            <span className="font-mono bg-gray-200 px-2 py-1 rounded mr-2">{key}</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded mr-2">{value}</span>
            <button type="button" onClick={() => removeVariable(key)} className="text-red-500">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
