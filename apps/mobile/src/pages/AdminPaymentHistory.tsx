import { useCallback, useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { getCurrentUser } from '../lib/auth';
import { API_BASE_URL } from '../lib/apiConfig';
import AdminSidebar from './AdminSidebar';
import './Admindashboard.css';

type PaymentStatus = 'pending' | 'approved' | 'rejected';
type Payment = {
  id: number;
  client_name: string;
  plan: string;
  amount: number;
  days: number;
  proof_image: string | null;
  created_at: string;
  subscription_start: string | null;
  subscription_end: string | null;
  status: PaymentStatus;
};

const PLAN_LABELS: Record<string, string> = { '1_month': '1 Month', '2_months': '2 Months', '1_year': '1 Year' };

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  approved: 'Paid',
  rejected: 'Rejected',
};

const STATUS_COLORS: Record<PaymentStatus, { color: string; background: string }> = {
  pending: { color: '#92400e', background: '#fef3c7' },
  approved: { color: '#166534', background: '#dcfce7' },
  rejected: { color: '#991b1b', background: '#fee2e2' },
};

const formatDateTime = (value: string | null) =>
  value ? new Date(value.includes('T') ? value : value.replace(' ', 'T')).toLocaleString() : '—';

const isToday = (value: string) => {
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  return date.toDateString() === new Date().toDateString();
};

const AdminPaymentHistory: React.FC = () => {
  const admin = getCurrentUser();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<'all' | PaymentStatus>('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    if (!admin?.id || admin.role !== 'admin') {
      setError('Administrator access is required.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin_payments.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': admin.token,
        },
        body: JSON.stringify({ adminId: admin.id, status: 'all' }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load payment records.');
      setPayments(result.payments);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load payment records.');
    } finally {
      setLoading(false);
    }
  }, [admin?.id, admin?.role, admin?.token]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const pastPayments = payments.filter((payment) => !isToday(payment.created_at));
  const visiblePayments = filter === 'all' ? pastPayments : pastPayments.filter((payment) => payment.status === filter);

  return (
    <IonPage>
      <IonContent fullscreen className="admin-shell">
        <AdminSidebar active="payment-history" />

        <main className="admin-main">
          <header className="admin-header">
            <h1>Payment History</h1>
            <p>Earlier payments, before today.</p>
          </header>

          {error && <p role="alert">{error} <button type="button" onClick={() => void loadPayments()}>Retry</button></p>}

          <section className="admin-list-card">
            <h2>Past Payments ({visiblePayments.length})</h2>
            <div className="input-group" style={{ maxWidth: 260 }}>
              <label className="input-label" htmlFor="payment-history-filter">Filter by status</label>
              <select
                id="payment-history-filter"
                className="input-box"
                value={filter}
                onChange={(event) => setFilter(event.target.value as typeof filter)}
              >
                <option value="all">All payments</option>
                <option value="approved">Paid</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {loading ? <p>Loading payments…</p> : visiblePayments.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>Proof</th>
                      <th>Submitted</th>
                      <th>Subscription Start</th>
                      <th>Subscription Expiry</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePayments.map((payment) => {
                      const proofUrl = payment.proof_image ? `${API_BASE_URL}/uploads/payments/${payment.proof_image}` : '';
                      return (
                        <tr key={payment.id}>
                          <td data-label="Client">{payment.client_name}</td>
                          <td data-label="Plan">{PLAN_LABELS[payment.plan] ?? payment.plan} ({payment.days} days)</td>
                          <td data-label="Amount">PHP {payment.amount.toLocaleString()}</td>
                          <td data-label="Proof">
                            {proofUrl ? (
                              <a href={proofUrl} target="_blank" rel="noreferrer">
                                <img src={proofUrl} alt="Payment proof" style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 4 }} />
                              </a>
                            ) : '—'}
                          </td>
                          <td data-label="Submitted">{formatDateTime(payment.created_at)}</td>
                          <td data-label="Subscription Start">{formatDateTime(payment.subscription_start)}</td>
                          <td data-label="Subscription Expiry">{formatDateTime(payment.subscription_end)}</td>
                          <td data-label="Status">
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 9px',
                                borderRadius: 999,
                                fontWeight: 700,
                                ...STATUS_COLORS[payment.status],
                              }}
                            >
                              {STATUS_LABELS[payment.status] ?? payment.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <p>No payments for this filter.</p>}
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default AdminPaymentHistory;