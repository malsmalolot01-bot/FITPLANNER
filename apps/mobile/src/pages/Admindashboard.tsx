import { IonContent, IonPage } from '@ionic/react';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../lib/auth';
import { API_BASE_URL } from '../lib/apiConfig';
import AdminSidebar, { AdminTab } from './AdminSidebar';
import './Admindashboard.css';

type AdminClient = {
  id: string;
  name: string;
  email: string;
  subscription_status: 'trial' | 'active' | 'expired';
  days_left: number;
  joined: string;
};

type ActivityLog = {
  text: string;
  actor: string | null;
  time: string;
};

type Props = { tab?: AdminTab };

const AdminDashboard: React.FC<Props> = ({ tab = 'overview' }) => {
  const activeTab = tab;

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUser = getCurrentUser();
  const [adminName, setAdminName] = useState(storedUser?.name || 'Admin User');
  const [adminPic, setAdminPic] = useState(storedUser?.pic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop');

  // State para sa Database Data
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [users, setUsers] = useState<AdminClient[]>([]);
  const [systemLogs, setSystemLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (!currentUser?.id) return;

    fetch(`${API_BASE_URL}/admin_stats.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': currentUser.token,
      },
      body: JSON.stringify({ adminId: currentUser.id }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Stats request failed: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (!data.success) throw new Error(data.message || 'Unable to load admin statistics.');
        setTotalAccounts(data.totalAccounts || 0);
        setUsers(data.users || []);
        setSystemLogs(data.logs || []);
      })
      .catch(err => console.error("Error fetching stats:", err));
  }, [currentUser?.id, currentUser?.token]);

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setAdminPic(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSaveProfile = () => {
    const updatedUser = { ...storedUser, name: adminName, pic: adminPic };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    alert('Profile updated successfully!');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="admin-shell">

        {/* Sidebar */}
        <AdminSidebar active={activeTab} />

        {/* Main Content */}
        <main className="admin-main">

          {activeTab === 'overview' && (
            <>
              <header className="admin-header">
                <h1>Admin Overview</h1>
                <p>Monitor gym activity and user accounts.</p>
              </header>

              <div className="stat-strip">
                <div className="stat-block stat-block-primary">
                  <span className="stat-label">Total Accounts</span>
                  <div className="stat-value">{totalAccounts}</div>
                </div>
                <div className="stat-block">
                  <span className="stat-label">System Status</span>
                  <div className="stat-status-row">
                    <span className="status-pulse"></span>
                    <span className="stat-status">Online</span>
                  </div>
                </div>
              </div>

              <div className="admin-list-card">
                <h2>Recent Activity</h2>
                {systemLogs.length === 0 ? (
                  <div className="log-item">
                    <div className="log-text">No recent activity recorded.</div>
                    <div className="log-time">--</div>
                  </div>
                ) : (
                  systemLogs.slice(0, 5).map((log, index) => (
                    <div key={index} className="log-item">
                      <div className="log-marker"></div>
                      <div className="log-text">{log.text}</div>
                      <div className="log-time">{log.time}</div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <>
              <header className="admin-header">
                <h1>Registered Users</h1>
                <p>Total registered clients in the database: {totalAccounts}</p>
              </header>

              <div className="admin-list-card">
                <h2>User List</h2>
                {users.length === 0 ? (
                  <div className="log-item">
                    <div className="log-text">No users registered yet.</div>
                    <div className="log-time">--</div>
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Subscription</th>
                        <th>Date Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={index}>
                          <td data-label="Name">{user.name}</td>
                          <td data-label="Email">{user.email}</td>
                          <td data-label="Subscription">
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 9px',
                                borderRadius: 999,
                                fontWeight: 700,
                                color: user.subscription_status === 'active' ? '#166534' : user.subscription_status === 'trial' ? '#92400e' : '#991b1b',
                                background: user.subscription_status === 'active' ? '#dcfce7' : user.subscription_status === 'trial' ? '#fef3c7' : '#fee2e2',
                              }}
                            >
                              {user.subscription_status === 'trial' ? 'Trial' : user.subscription_status === 'active' ? 'Active' : 'Expired'}
                            </span>
                            <span style={{ marginLeft: 8 }}>{user.days_left} days left</span>
                          </td>
                          <td data-label="Joined">{user.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {activeTab === 'logs' && (
            <>
              <header className="admin-header">
                <h1>System Logs</h1>
                <p>Real-time monitoring of user logins and activities.</p>
              </header>

              <div className="admin-list-card">
                <h2>Activity Logs</h2>
                {systemLogs.length === 0 ? (
                  <div className="log-item">
                    <div className="log-text">No logs available. Wait for users to log in.</div>
                    <div className="log-time">--</div>
                  </div>
                ) : (
                  systemLogs.map((log, index) => (
                    <div key={index} className="log-item">
                      <div className="log-text">{log.text}</div>
                      <div className="log-time">{log.time}</div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <>
              <header className="admin-header">
                <h1>Admin Profile</h1>
                <p>Update your account information.</p>
              </header>

              <div className="admin-list-card">
                <h2>Edit Details</h2>
                <div className="profile-form">

                  <img src={adminPic} alt="Admin Avatar" className="profile-pic-preview" />

                  <div className="input-group">
                    <label className="input-label">Update Picture</label>
                    <input type="file" className="input-box" onChange={handlePictureUpload} accept="image/*" />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input
                      type="text"
                      className="input-box"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                    />
                  </div>

                  <button className="save-btn" onClick={handleSaveProfile}>Save Changes</button>
                </div>
              </div>
            </>
          )}

        </main>
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;