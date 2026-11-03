import { useCallback, useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { getCurrentUser } from '../lib/auth';
import { API_BASE_URL } from '../lib/apiConfig';
import AdminSidebar from './AdminSidebar';
import './Admindashboard.css';

type MonthRow = {
  month: number;
  income: number;
  payments: number;
  one_month: number;
  two_months: number;
  one_year: number;
  new_accounts: number;
};

type ExpiringRow = { month: string; users: number };

type ReportData = {
  year: number;
  years: number[];
  months: MonthRow[];
  year_total: number;
  year_payments: number;
  expiring: ExpiringRow[];
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const peso = (value: number) => `PHP ${Number(value).toLocaleString()}`;

const expiringLabel = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
};

const AdminReports: React.FC = () => {
  const admin = getCurrentUser();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    if (!admin?.id || admin.role !== 'admin') {
      setError('Administrator access is required.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin_reports.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': admin.token,
        },
        body: JSON.stringify({ adminId: admin.id, year }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load reports.');
      setData(result);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load reports.');
    } finally {
      setLoading(false);
    }
  }, [admin?.id, admin?.role, admin?.token, year]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const thisMonthRow = data && year === currentYear
    ? data.months.find((row) => row.month === currentMonth)
    : undefined;

  const yearOptions = data && data.years.length ? data.years : [currentYear];

  return (
    <IonPage>
      <IonContent fullscreen className="admin-shell">
        <AdminSidebar active="reports" />

        <main className="admin-main">
          <header className="admin-header">
            <h1>Reports</h1>
            <p>Income and account activity from GCash payments.</p>
          </header>

          <div className="stat-strip">
            <div className="stat-block stat-block-primary">
              <span className="stat-label">Income in {year}</span>
              <div className="stat-value">{data ? peso(data.year_total) : '—'}</div>
            </div>
            <div className="stat-block">
              <span className="stat-label">Income This Month</span>
              <div className="stat-value">{thisMonthRow ? peso(thisMonthRow.income) : '—'}</div>
            </div>
            <div className="stat-block">
              <span className="stat-label"> Payments in {year}</span>
              <div className="stat-value">{data ? data.year_payments : '—'}</div>
            </div>
          </div>

          {error && <p role="alert">{error} <button type="button" onClick={() => void loadReport()}>Retry</button></p>}

          <section className="admin-list-card" style={{ marginBottom: 24 }}>
            <h2>Monthly Report</h2>
            <div className="input-group" style={{ maxWidth: 260 }}>
              <label className="input-label" htmlFor="report-year">Year</label>
              <select
                id="report-year"
                className="input-box"
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
              >
                {yearOptions.map((optionYear) => (
                  <option key={optionYear} value={optionYear}>{optionYear}</option>
                ))}
              </select>
            </div>

            {loading ? <p>Loading reports…</p> : data ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Income</th>
                      <th> Payments</th>
                      <th>1 Month</th>
                      <th>2 Months</th>
                      <th>1 Year</th>
                      <th>New Accounts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.months.map((row) => (
                      <tr key={row.month}>
                        <td data-label="Month">
                          {MONTH_NAMES[row.month - 1]}
                          {year === currentYear && row.month === currentMonth ? ' (this month)' : ''}
                        </td>
                        <td data-label="Income">{peso(row.income)}</td>
                        <td data-label="Payments">{row.payments}</td>
                        <td data-label="1 Month">{row.one_month}</td>
                        <td data-label="2 Months">{row.two_months}</td>
                        <td data-label="1 Year">{row.one_year}</td>
                        <td data-label="New Accounts">{row.new_accounts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>

          <section className="admin-list-card">
            <h2>Projected: Subscriptions Ending Soon</h2>
            <p>Number of accounts whose trial or plan ends in each month. These are projected renewals, not income.</p>
            {loading ? <p>Loading reports…</p> : data && data.expiring.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Accounts Ending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.expiring.map((row) => (
                      <tr key={row.month}>
                        <td data-label="Month">{expiringLabel(row.month)}</td>
                        <td data-label="Accounts Ending">{row.users}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p>No data.</p>}
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default AdminReports;