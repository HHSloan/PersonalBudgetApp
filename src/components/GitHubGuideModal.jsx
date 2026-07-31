import React, { useState } from 'react';
import { X, Github, Globe, Terminal, CheckCircle2, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';

export default function GitHubGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [copiedStep, setCopiedStep] = useState(null);

  const copyToClipboard = (text, stepIndex) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Github size={24} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '20px' }}>GitHub & Live URL Deployment Guide</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px', color: 'var(--text-primary)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Follow these 3 easy steps to connect your personal GitHub repository and deploy your budget app to a live URL (`https://your-app.vercel.app`).
          </p>

          {/* Step 1 */}
          <div style={{ background: 'var(--bg-element)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '8px', color: 'var(--accent-primary)' }}>
              <span>Step 1:</span> Create a new repository on GitHub
            </div>
            <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Go to <a href="https://github.com/new" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>github.com/new <ExternalLink size={12} /></a></li>
              <li>Name your repository (e.g. <code>personal-budget-app</code>).</li>
              <li>Leave it as <strong>Public</strong> or <strong>Private</strong> and click <strong>Create repository</strong>.</li>
            </ol>
          </div>

          {/* Step 2 */}
          <div style={{ background: 'var(--bg-element)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '8px', color: 'var(--accent-emerald)' }}>
              <span>Step 2:</span> Push local code to your GitHub repo
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Run these commands in your terminal inside this project folder:
            </p>
            <div style={{ position: 'relative', background: '#090d16', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', color: '#38bdf8' }}>
              git init<br />
              git add .<br />
              git commit -m "Initial commit - Personal Budget App"<br />
              git branch -M main<br />
              git remote add origin https://github.com/YOUR_USERNAME/personal-budget-app.git<br />
              git push -u origin main
              <button
                className="btn btn-secondary"
                style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px', fontSize: '11px' }}
                onClick={() => copyToClipboard(`git init\ngit add .\ngit commit -m "Initial commit - Personal Budget App"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/personal-budget-app.git\ngit push -u origin main`, 2)}
              >
                {copiedStep === 2 ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ background: 'var(--bg-element)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '8px', color: 'var(--accent-secondary)' }}>
              <span>Step 3:</span> Deploy for Free Live URL on Vercel / Netlify
            </div>
            <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Sign up for free at <a href="https://vercel.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-secondary)' }}>Vercel.com</a> or <a href="https://netlify.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-secondary)' }}>Netlify.com</a> using your GitHub account.</li>
              <li>Click <strong>"Add New Project"</strong> & Select your <code>personal-budget-app</code> repository.</li>
              <li>Click <strong>"Deploy"</strong>. Within seconds, Vercel will generate your live HTTPS public web URL!</li>
            </ol>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
