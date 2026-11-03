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
  reference_no: string | null;
  proof_image: string | null;
  client_status: string;
  created_at: string;
  subscription_start: string | null;
  subscription_end: string | null;
  status: PaymentStatus;
};

const PLAN_LABELS: Record<string, string> = { '1_month': '1 Month', '2_months': '2 Months', '1_year': '1 Year' };
const CLIENT_STATUS_LABELS: Record<string, string> = {
  trial: 'Trial', active: 'Active', expired_trial: 'Expired Trial', expired: 'Expired',
};

const formatDateTime = (value: string) =>
  new Date(value.includes('T') ? value : value.replace(' ', 'T')).toLocaleString();

const isToday = (value: string) => {
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  return date.toDateString() === new Date().toDateString();
};

const AdminPayments: React.FC = () => {
  const admin = getCurrentUser();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<'all' | PaymentStatus>('all');
  const [totalReceived, setTotalReceived] = useState(0);
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
        body: JSON.stringify({ adminId: admin.id, status: filter }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load payment records.');
      setPayments(result.payments);
      setTotalReceived(result.total_received);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load payment records.');
    } finally {
      setLoading(false);
    }
  }, [admin?.id, admin?.role, admin?.token, filter]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const paymentHistory = payments.filter((payment) => payment.status !== 'pending' && isToday(payment.created_at));

  return (
    <IonPage>
      <IonContent fullscreen className="admin-shell">
        <AdminSidebar active="payments" />

        <main className="admin-main">
          <header className="admin-header">
            <h1>Payments</h1>
            <p>GCash payments received today.</p>
          </header>

          <div className="stat-strip">
            <div className="stat-block stat-block-primary">
              <span className="stat-label">Total Received</span>
              <div className="stat-value">PHP {totalReceived.toLocaleString()}</div>
            </div>
          </div>

          {error && <p role="alert">{error} <button type="button" onClick={() => void loadPayments()}>Retry</button></p>}

          <section className="admin-list-card">
            <h2>Today's Payments</h2>
            <div className="input-group" style={{ maxWidth: 260 }}>
              <label className="input-label" htmlFor="payment-status-filter">Filter by status</label>
              <select
                id="payment-status-filter"
                className="input-box"
                value={filter}
                onChange={(event) => setFilter(event.target.value as typeof filter)}
              >
                <option value="all">All payments</option>
                <option value="approved">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            {loading ? <p>Loading payments…</p> : paymentHistory.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Client Status</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>Proof</th>
                      <th>Submitted</th>
                      <th>Subscription Expiry</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => {
                      const proofUrl = payment.proof_image ? `${API_BASE_URL}/uploads/payments/${payment.proof_image}` : '';
                      return (
                        <tr key={payment.id}>
                          <td data-label="Client">{payment.client_name}</td>
                          <td data-label="Client Status">{CLIENT_STATUS_LABELS[payment.client_status] ?? payment.client_status}</td>
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
                          <td data-label="Subscription Expiry">{payment.subscription_end ? formatDateTime(payment.subscription_end) : '—'}</td>
                          <td data-label="Status">{payment.status === 'approved' ? 'paid' : payment.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <p>No payments received today.</p>}
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default AdminPayments;