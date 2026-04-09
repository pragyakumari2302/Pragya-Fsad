import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { fetchReports } from "../api/mockApi";

function ReportStatusBadge({ status }) {
  const styles = {
    completed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
        styles[status] ?? "bg-neutral-200 text-neutral-600"
      }`}
    >
      {status}
    </span>
  );
}

export default function Reports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchReports()
      .then((res) => {
        if (!cancelled) setData(res || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load reports");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section aria-label="Reports" className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-neutral-900">Reports</h1>
          <p className="text-neutral-500 mt-1">View and generate reports</p>
        </header>
        <div className="grid gap-4" role="status" aria-live="polite">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} title="">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-lg bg-neutral-200 animate-pulse" aria-hidden />
                <div className="flex-1">
                  <div className="h-5 w-48 bg-neutral-200 rounded animate-pulse" aria-hidden />
                  <div className="h-4 w-32 mt-2 bg-neutral-100 rounded animate-pulse" aria-hidden />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label="Reports">
        <header>
          <h1 className="text-2xl font-bold text-neutral-900">Reports</h1>
        </header>
        <div
          className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700"
          role="alert"
        >
          {error}
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Reports" className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Reports</h1>
          <p className="text-neutral-500 mt-1">View and generate reports</p>
        </div>
        <Button variant="primary">Generate Report</Button>
      </header>

      <div className="grid gap-4">
        {data.length === 0 ? (
          <Card title="">
            <p className="text-neutral-500 text-center py-8">No reports yet.</p>
          </Card>
        ) : (
          data.map((report) => (
            <Card key={report.id} title="">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span
                    className="flex w-12 h-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600"
                    aria-hidden
                  >
                    📄
                  </span>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{report.title}</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {report.type} • {report.records} records • {report.format}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">Generated {report.generatedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <ReportStatusBadge status={report.status} />
                  <Button variant="outline" className="!py-2">
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
