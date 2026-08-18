import React, { useRef } from 'react';
import { Download, Upload, ShieldCheck, RefreshCw, Database } from 'lucide-react';

export default function DataManagement({ transactions, budgetLimits, savingsGoals, onImportData, onResetData }) {
  const fileInputRef = useRef(null);

  const handleExportJSON = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      transactions,
      budgetLimits,
      savingsGoals
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `aurabudget-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e) => {
    const fileReader = new FileReader();
    if (e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.transactions && parsed.budgetLimits) {
            onImportData(parsed);
            alert('Budget data successfully imported!');
          } else {
            alert('Invalid backup file format.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
          <ShieldCheck size={28} />
        </div>
        <div>
          <h2 style={{ fontSize: '18px' }}>100% Private Local-First Storage</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '2px' }}>
            All your financial entries are stored securely right in your browser's LocalStorage. No third-party tracking or mandatory servers required.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Export Backup */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Download size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '16px' }}>Export Data Backup</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Download a full JSON backup file containing all transactions, custom budget limits, and savings goals.
          </p>
          <button className="btn btn-primary" onClick={handleExportJSON}>
            <Download size={16} /> Export Backup (.json)
          </button>
        </div>

        {/* Import Backup */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Upload size={20} color="var(--accent-secondary)" />
            <h3 style={{ fontSize: '16px' }}>Restore from JSON</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Upload a previously exported `.json` file to restore your full financial state.
          </p>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
            <Upload size={16} /> Choose JSON Backup File
          </button>
        </div>

        {/* Reset / Reload Sample Data */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RefreshCw size={20} color="var(--accent-amber)" />
            <h3 style={{ fontSize: '16px' }}>Reset to Sample Data</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Reset your database back to the rich default sample data set for quick testing and demonstration.
          </p>
          <button className="btn btn-secondary" style={{ borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }} onClick={onResetData}>
            <RefreshCw size={16} /> Load Default Sample Data
          </button>
        </div>
      </div>
    </div>
  );
}
