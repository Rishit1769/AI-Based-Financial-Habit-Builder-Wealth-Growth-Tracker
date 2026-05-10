import { useEffect, useMemo, useState } from 'react';
import { FaCalendarDays, FaEye, FaFileArrowDown } from 'react-icons/fa6';
import { apiDownload, apiRequest } from '../services/api.js';

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const toInputDate = (value) => new Date(value).toISOString().slice(0, 10);

const getInitialFromDate = () => {
  const now = new Date();
  return toInputDate(new Date(now.getFullYear(), now.getMonth(), 1));
};

export default function ReportsView({ accessToken }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [reportMode, setReportMode] = useState('custom');
  const [customRange, setCustomRange] = useState({
    fromDate: getInitialFromDate(),
    toDate: toInputDate(new Date()),
  });

  const loadReports = async () => {
    const response = await apiRequest('/reports', { token: accessToken });
    setReports(response.data || []);
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError('');
        await loadReports();
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Unable to load reports.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const selectedModeLabel = useMemo(() => {
    if (reportMode === 'past_6_months') {
      return 'Past 6 Months';
    }
    if (reportMode === 'past_year') {
      return 'Past Year';
    }
    return 'Custom Date Range';
  }, [reportMode]);

  const handleGenerate = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (reportMode === 'custom' && customRange.fromDate > customRange.toDate) {
      setError('Start date must be before end date.');
      return;
    }

    try {
      setGenerating(true);
      const payload =
        reportMode === 'custom'
          ? {
              fromDate: customRange.fromDate,
              toDate: customRange.toDate,
            }
          : {
              preset: reportMode,
            };

      const response = await apiRequest('/reports/generate', {
        method: 'POST',
        token: accessToken,
        body: payload,
      });

      await loadReports();
      setSuccessMessage(
        `Report generated for ${response.data?.periodLabel || selectedModeLabel}. It is now available below.`
      );
    } catch (err) {
      setError(err.message || 'Unable to generate report right now.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report) => {
    setError('');
    setSuccessMessage('');
    setDownloadingId(report.id);

    try {
      const response = await apiDownload(`/reports/${report.id}/download`, {
        token: accessToken,
      });

      const fileName = `financial-report-${report.period || report.id}.pdf`;
      const url = URL.createObjectURL(response.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      const emailStatus = response.headers.get('x-report-email-status');
      if (emailStatus === 'failed') {
        setSuccessMessage('Report downloaded. Email delivery failed; please verify SMTP settings.');
      } else {
        setSuccessMessage('Report downloaded and emailed to your registered email address.');
      }
    } catch (err) {
      setError(err.message || 'Unable to download report.');
    } finally {
      setDownloadingId('');
    }
  };

  return (
    <div className="space-y-8">
      <section className="max-w-[49rem]">
        <p className="eyebrow" style={{ color: 'var(--signal)' }}>
          Reports Hub
        </p>
        <h2 className="wealth-display mt-3 text-[clamp(2.65rem,5.8vw,4.7rem)] font-extrabold">Financial Reports</h2>
        <p className="mt-4 max-w-2xl text-[1.04rem] leading-[1.6]" style={{ color: 'var(--muted-ink)' }}>
          Generate PDF reports for any custom date range or use quick presets like past 6 months and past year.
        </p>
      </section>

      <section className="card-stadium px-6 py-6 md:px-7">
        <h3 className="wealth-display text-3xl font-bold">Generate Report</h3>
        <form onSubmit={handleGenerate} className="mt-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => setReportMode('custom')}
              className="radius-pill border px-4 py-3 text-sm font-semibold"
              style={{
                borderColor: reportMode === 'custom' ? 'var(--ink)' : 'var(--border)',
                background: reportMode === 'custom' ? 'color-mix(in srgb, var(--ink) 9%, transparent)' : 'transparent',
              }}
            >
              Custom Date Range
            </button>
            <button
              type="button"
              onClick={() => setReportMode('past_6_months')}
              className="radius-pill border px-4 py-3 text-sm font-semibold"
              style={{
                borderColor: reportMode === 'past_6_months' ? 'var(--ink)' : 'var(--border)',
                background:
                  reportMode === 'past_6_months' ? 'color-mix(in srgb, var(--ink) 9%, transparent)' : 'transparent',
              }}
            >
              Past 6 Months
            </button>
            <button
              type="button"
              onClick={() => setReportMode('past_year')}
              className="radius-pill border px-4 py-3 text-sm font-semibold"
              style={{
                borderColor: reportMode === 'past_year' ? 'var(--ink)' : 'var(--border)',
                background: reportMode === 'past_year' ? 'color-mix(in srgb, var(--ink) 9%, transparent)' : 'transparent',
              }}
            >
              Past Year
            </button>
          </div>

          {reportMode === 'custom' ? (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold">
                From Date
                <input
                  type="date"
                  value={customRange.fromDate}
                  onChange={(event) =>
                    setCustomRange((current) => ({
                      ...current,
                      fromDate: event.target.value,
                    }))
                  }
                  className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
                  style={{ borderColor: 'var(--border)' }}
                />
              </label>

              <label className="text-sm font-semibold">
                To Date
                <input
                  type="date"
                  value={customRange.toDate}
                  onChange={(event) =>
                    setCustomRange((current) => ({
                      ...current,
                      toDate: event.target.value,
                    }))
                  }
                  className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
                  style={{ borderColor: 'var(--border)' }}
                />
              </label>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={generating}
            className="pill-button inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
            style={{ background: 'var(--ink)', color: 'var(--canvas)', opacity: generating ? 0.7 : 1 }}
          >
            <FaCalendarDays />
            {generating ? 'Generating...' : 'Generate Financial Report'}
          </button>
        </form>
      </section>

      {error ? (
        <section className="card-stadium px-6 py-5 text-sm font-semibold" style={{ color: '#dc2626' }}>
          {error}
        </section>
      ) : null}

      {successMessage ? (
        <section className="card-stadium px-6 py-5 text-sm font-semibold" style={{ color: 'var(--growth)' }}>
          {successMessage}
        </section>
      ) : null}

      <section className="card-stadium px-6 py-6 md:px-7">
        <div className="flex items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <h3 className="wealth-display text-3xl font-bold">Generated Reports</h3>
          <span className="text-sm font-semibold" style={{ color: 'var(--muted-ink)' }}>
            {reports.length} records
          </span>
        </div>

        {loading ? (
          <p className="py-8 text-sm" style={{ color: 'var(--muted-ink)' }}>
            Loading generated reports...
          </p>
        ) : null}

        {!loading && reports.length === 0 ? (
          <p className="py-8 text-sm" style={{ color: 'var(--muted-ink)' }}>
            No reports generated yet.
          </p>
        ) : null}

        {!loading && reports.length > 0 ? (
          <div className="mt-4 space-y-2">
            {reports.map((report) => (
              <article
                key={report.id}
                className="radius-stadium flex flex-wrap items-center justify-between gap-4 border px-4 py-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <div>
                  <p className="text-sm font-semibold">{report.periodLabel || report.period || 'Selected Period'}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-ink)' }}>
                    Created on {dateFormatter.format(new Date(report.created_at))}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={report.downloadUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="radius-pill border px-3 py-2 text-xs font-semibold"
                    style={{
                      borderColor: 'var(--border)',
                      color: report.downloadUrl ? 'var(--ink)' : 'var(--muted-ink)',
                      pointerEvents: report.downloadUrl ? 'auto' : 'none',
                      opacity: report.downloadUrl ? 1 : 0.6,
                    }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <FaEye />
                      View
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDownload(report)}
                    disabled={downloadingId === report.id}
                    className="pill-button inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                    style={{ background: 'var(--ink)', color: 'var(--canvas)', opacity: downloadingId === report.id ? 0.7 : 1 }}
                  >
                    <FaFileArrowDown />
                    {downloadingId === report.id ? 'Downloading...' : 'Download PDF'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
