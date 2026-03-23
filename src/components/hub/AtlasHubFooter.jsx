import React from 'react';
import { APP_CONFIGS } from '../../config/apps';
import { SmallAppIcon } from './AppCard';

export default function AtlasHubFooter() {
  return (
    <footer className="mx-4 mt-8 mb-6">
      <div className="card !py-5 !px-7">
        {/* App icons row with names */}
        <div className="flex items-center justify-center gap-6 mb-4">
          {APP_CONFIGS.map(app => (
            <div key={app.id} className="flex items-center gap-2 text-text-muted text-xs">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${app.accentStart}, ${app.accentEnd})`, opacity: app.status === 'live' ? 1 : 0.5 }}
              >
                <span className="text-white">
                  <SmallAppIcon icon={app.icon} size={14} />
                </span>
              </div>
              <span className={app.status === 'live' ? 'text-text-secondary font-medium' : ''}>
                {app.name}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent mb-3" />

        <p className="text-text-muted text-xs text-center leading-relaxed mb-1">
          All Atlas Health tools run locally in your browser — your financial data never leaves your device.
        </p>
        <p className="text-text-muted/50 text-xs text-center">
          Atlas Health is an educational financial toolkit. Not financial advice.
        </p>
      </div>
    </footer>
  );
}
