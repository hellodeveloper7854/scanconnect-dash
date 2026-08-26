import React, { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { downloadFile } from '../../lib/api';

const REPORTS = [
  { key: 'users', label: 'Users', path: '/api/admin/reports/users.csv', filename: 'users.csv' },
  { key: 'orders', label: 'Orders', path: '/api/admin/reports/orders.csv', filename: 'orders.csv' },
  { key: 'reviews', label: 'Reviews', path: '/api/admin/reports/reviews.csv', filename: 'reviews.csv' },
];

export const AdminReports: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleDownload = async (report: (typeof REPORTS)[number]) => {
    setDownloading(report.key);
    setError('');
    try {
      await downloadFile(report.path, report.filename);
    } catch {
      setError(`Failed to download ${report.label} report.`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">Reports</h1>
      <p className="text-white/50 text-sm">Export live data as CSV files.</p>

      {error && <p className="text-sm font-semibold text-rose-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map((report) => (
          <div key={report.key} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFED00]/10 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-[#FFED00]" />
              </div>
              <span className="font-bold text-white">{report.label}</span>
            </div>
            <button
              onClick={() => handleDownload(report)}
              disabled={downloading === report.key}
              className="w-full flex items-center justify-center gap-2 h-10 bg-[#FFED00] hover:bg-[#e0ac00] text-neutral-950 font-bold text-sm rounded-md transition-colors cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              {downloading === report.key ? 'Downloading...' : 'Download CSV'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
