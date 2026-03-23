import React from 'react';
import AppCard from './AppCard';
import { APP_CONFIGS } from '../../config/apps';

export default function ProductCardsGrid({ onLaunch }) {
  return (
    <section aria-label="Available financial tools" className="px-4 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {APP_CONFIGS.map(app => (
          <AppCard key={app.id} app={app} onLaunch={onLaunch} />
        ))}
      </div>
    </section>
  );
}
