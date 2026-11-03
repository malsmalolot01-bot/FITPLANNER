import { IonContent, IonPage } from '@ionic/react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, UserRound } from 'lucide-react';
import { getCurrentUser, logout } from '../lib/auth';
import { getCustomerPhotoUrl, getCustomerProfile, saveCustomerProfile, type CustomerProfile as CustomerProfileData } from '../lib/api';
import { useIsMobile } from '../lib/useIsMobile';
import dashboardBg from '../assets/dashboard-bg.webp';
import ProgressMenu from '../components/ProgressMenu';
import './CustomerProfile.css';

const CustomerProfile: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const registeredUser = getCurrentUser();
  const [profile, setProfile] = useState<CustomerProfileData | null>(registeredUser ? {
    first_name: registeredUser.firstName || '',
    last_name: registeredUser.lastName || '',
    email: registeredUser.email || '',
    phone: null,
    profile_photo: null,
  } : null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(registeredUser?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getCustomerProfile()
      .then((result) => {
        const customerProfile = result.profile && typeof result.profile === 'object' ? result.profile : null;
        setProfile(customerProfile ? {
          ...customerProfile,
          first_name: customerProfile.first_name || registeredUser?.firstName || '',
          last_name: customerProfile.last_name || registeredUser?.lastName || '',
          email: customerProfile.email || registeredUser?.email || '',
        } : registeredUser ? {
          first_name: registeredUser.firstName || '',
          last_name: registeredUser.lastName || '',
          email: registeredUser.email || '',
          phone: null,
          profile_photo: null,
        } : null);
        setPhone(customerProfile?.phone ?? '');
        setEmail(customerProfile?.email || registeredUser?.email || '');
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Could not load your profile.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedPhoto = event.target.files?.[0];
    if (!selectedPhoto) return;
    setPhoto(selectedPhoto);
    setSaved(false);
    setError('');
    setPreviewUrl(URL.createObjectURL(selectedPhoto));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSaved(false);

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if ((email.toLowerCase() !== profile?.email.toLowerCase() || newPassword) && !currentPassword) {
      setError('Enter your current password to change your email or password.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveCustomerProfile(phone, email, currentPassword, newPassword, photo ?? undefined);
      setProfile(result.profile);
      setPhone(result.profile?.phone ?? '');
      setEmail(result.profile?.email ?? '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPhoto(null);
      setPreviewUrl('');
      setSaved(true);
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const imageUrl = previewUrl || (profile?.profile_photo ? getCustomerPhotoUrl(profile.profile_photo) : '');

  return (
    <IonPage>
      <IonContent fullscreen className="cp-shell" style={{ '--db-bg-image': `url(${dashboardBg})` } as React.CSSProperties}>
        <header className="db-top-header">
          <div className="db-top-brand">FIT<span>PLANNER</span></div>
          {!isMobile && (
            <nav className="db-top-nav">
              <Link to="/dashboard" className="db-top-nav-item">Dashboard</Link>
              <Link to="/workout" className="db-top-nav-item">AI Workout Suggestion</Link>
              <Link to="/meal-plan" className="db-top-nav-item">Meal Plan</Link>
              <Link to="/ai-suggestion" className="db-top-nav-item">BMI</Link>
              <ProgressMenu />
              <Link to="/profile" className="db-top-nav-item active">Profile</Link>
            </nav>
          )}
          <button className="db-logout-btn" onClick={handleLogout} aria-label="Log out">
            <LogOut size={24} />
          </button>
        </header>

        <div className="cp-bg-wrapper">
          <main className="cp-container">
            <header className="cp-heading">
              <p className="cp-eyebrow">ACCOUNT</p>
              <h1>Your profile</h1>
              <p>Manage your customer information.</p>
            </header>

            <form className="cp-form" onSubmit={handleSubmit}>
              <div className="cp-photo-row">
                <div className="cp-avatar" aria-label={imageUrl ? 'Profile photo preview' : 'No profile photo'}>
                  {imageUrl ? <img src={imageUrl} alt="Your profile" /> : <UserRound size={42} />}
                </div>
                <div className="cp-photo-actions">
                  <label className="cp-upload-button">
                    Upload photo
                    <input
                      id="profile-photo"
                      className="cp-file-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      capture="user"
                      onChange={handlePhotoChange}
                    />
                  </label>
                  <span>JPG, PNG, or WebP · up to 5 MB</span>
                </div>
              </div>

              <div className="cp-fields">
                <label className="cp-field">
                  <span>First name</span>
                  <input type="text" value={profile?.first_name ?? ''} readOnly placeholder={isLoading ? 'Loading...' : 'Name not available'} />
                </label>
                <label className="cp-field">
                  <span>Last name</span>
                  <input type="text" value={profile?.last_name ?? ''} readOnly placeholder={isLoading ? 'Loading...' : 'Name not available'} />
                </label>
                <label className="cp-field">
                  <span>Email address</span>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setSaved(false);
                    }}
                    placeholder={isLoading ? 'Loading...' : 'Email address'}
                  />
                </label>
                <label className="cp-field">
                  <span>Phone number</span>
                  <input
                    type="tel"
                    maxLength={30}
                    autoComplete="tel"
                    placeholder="Add a contact number"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      setSaved(false);
                    }}
                  />
                </label>
                <div className="cp-password-section">
                  <h2>Change password</h2>
                  <p>Leave the new password blank to keep your current one.</p>
                  <label className="cp-field">
                    <span>Current password</span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                    />
                  </label>
                  <label className="cp-field">
                    <span>New password</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                  </label>
                  <label className="cp-field">
                    <span>Confirm new password</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </label>
                </div>
              </div>

              {error && <p className="cp-message cp-error" role="alert">{error}</p>}
              {saved && <p className="cp-message cp-success" role="status">Profile saved.</p>}

              <button className="cp-save-button" type="submit" disabled={isLoading || isSaving}>
                {isSaving ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CustomerProfile;
