import { useState, useEffect } from 'react';
import { FileText, Download, Mail, RefreshCw } from 'lucide-react';
import { generate, emailReport, getAll } from '../services/reportService';
import { formatDate } from '../utils/constants';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [emailingId, setEmailingId] = useState(null);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const load = async () => {
    try {
      const res = await getAll();
      setReports(res.data.data);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generate({ month, year });
      toast.success('Report generated!');
      // Open download URL
      if (res.data.data?.url) window.open(res.data.data.url, '_blank');
      load();
    } catch { toast.error('Failed to generate report'); }
    finally { setGenerating(false); }
  };

  const handleEmail = async (id) => {
    setEmailingId(id);
    try {
      await emailReport(id);
      toast.success('Report emailed successfully!');
    } catch { toast.error('Failed to send email'); }
    finally { setEmailingId(null); }
  };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">Reports</h1>
        <p className="text-sub text-sm mt-0.5">Generate and download your financial reports</p>
      </div>

      {/* Generate card */}
      <Card title="Generate Monthly Report">
        <div className="p-5">
          <p className="text-sm text-sub mb-4">Select a month and year to generate a comprehensive PDF report of your financial activity.</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-sub block mb-1">Month</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
                className="field w-auto">
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-sub block mb-1">Year</label>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))}
                className="field w-auto">
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <Button onClick={handleGenerate} loading={generating} icon={RefreshCw}>
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Report history */}
      <Card title="Report History">
        <div className="px-5 pb-5">
          {loading ? <LoadingSkeleton rows={4} /> : reports.length === 0 ? (
            <p className="text-[var(--color-muted)] text-sm text-center py-8">No reports generated yet. Create your first one above!</p>
          ) : (
            <div className="space-y-2 mt-2">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-elevated   hover:bg-hover transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9   bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-ink)]">
                        {MONTHS[(r.month || 1) - 1]} {r.year}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">Generated {formatDate(r.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {r.url && (
                      <button onClick={() => window.open(r.url, '_blank')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-elevated hover:bg-hover text-sub hover:text-[var(--color-ink)]   transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    )}
                    <button onClick={() => handleEmail(r.id)} disabled={emailingId === r.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-indigo-300   transition-colors disabled:opacity-50">
                      <Mail className="w-3.5 h-3.5" /> {emailingId === r.id ? 'Sending...' : 'Email'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
