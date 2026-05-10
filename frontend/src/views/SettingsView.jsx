import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';

export default function SettingsView({ accessToken, onUserUpdated }) {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    currency: 'INR',
    monthly_income_target: '',
    bio: '',
    avatar_url: '',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiRequest('/users/profile', { token: accessToken });
        if (!mounted) {
          return;
        }

        const payload = response.data;
        setProfile(payload);
        setProfileForm({
          name: payload.name || '',
          currency: payload.currency || 'INR',
          monthly_income_target: payload.monthly_income_target || '',
          bio: payload.bio || '',
          avatar_url: payload.avatar_url || '',
        });
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Unable to load settings.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      setSavingProfile(true);
      const response = await apiRequest('/users/profile', {
        method: 'PUT',
        token: accessToken,
        body: {
          name: profileForm.name.trim(),
          currency: profileForm.currency.trim(),
          monthly_income_target: Number(profileForm.monthly_income_target || 0),
          bio: profileForm.bio,
          avatar_url: profileForm.avatar_url.trim() || null,
        },
      });

      setProfile(response.data);
      onUserUpdated(response.data);
      setSuccessMessage('Profile settings updated successfully.');
    } catch (err) {
      setError(err.message || 'Unable to save profile settings.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setError('Current password and new password are required.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    try {
      setSavingPassword(true);
      await apiRequest('/users/change-password', {
        method: 'PUT',
        token: accessToken,
        body: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      });
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setSuccessMessage('Password changed successfully.');
    } catch (err) {
      setError(err.message || 'Unable to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="max-w-[49rem]">
        <p className="eyebrow" style={{ color: 'var(--signal)' }}>
          Account Preferences
        </p>
        <h2 className="wealth-display mt-3 text-[clamp(2.65rem,5.8vw,4.7rem)] font-extrabold">Settings</h2>
        <p className="mt-4 max-w-2xl text-[1.04rem] leading-[1.6]" style={{ color: 'var(--muted-ink)' }}>
          Profile and security settings are loaded and updated directly from your database-backed user profile.
        </p>
      </section>

      {loading ? (
        <section className="card-stadium px-6 py-7 text-sm" style={{ color: 'var(--muted-ink)' }}>
          Loading settings from database...
        </section>
      ) : null}

      {!loading && error ? (
        <section className="card-stadium px-6 py-7 text-sm font-semibold" style={{ color: '#dc2626' }}>
          {error}
        </section>
      ) : null}

      {!loading ? (
        <section className="grid gap-5 lg:grid-cols-2">
          <form onSubmit={handleSaveProfile} className="card-stadium space-y-4 px-6 py-6 md:px-7">
            <h3 className="wealth-display text-3xl font-bold">Profile</h3>

            <label className="block text-sm font-semibold">
              Name
              <input
                type="text"
                value={profileForm.name}
                onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </label>

            <label className="block text-sm font-semibold">
              Email
              <input
                type="email"
                value={profile?.email || ''}
                className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 opacity-70 outline-none"
                style={{ borderColor: 'var(--border)' }}
                disabled
              />
            </label>

            <label className="block text-sm font-semibold">
              Currency
              <input
                type="text"
                value={profileForm.currency}
                onChange={(event) => setProfileForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
                className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </label>

            <label className="block text-sm font-semibold">
              Monthly Income Target
              <input
                type="number"
                min="0"
                step="0.01"
                value={profileForm.monthly_income_target}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, monthly_income_target: event.target.value }))
                }
                className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </label>

            <label className="block text-sm font-semibold">
              Bio
              <textarea
                value={profileForm.bio}
                onChange={(event) => setProfileForm((current) => ({ ...current, bio: event.target.value }))}
                rows={3}
                className="mt-2 w-full rounded-2xl border bg-transparent px-4 py-3 outline-none"
                style={{ borderColor: 'var(--border)' }}
              />
            </label>

            <button
              type="submit"
              disabled={savingProfile}
              className="pill-button w-full px-4 py-3 text-sm font-semibold"
              style={{ background: 'var(--ink)', color: 'var(--canvas)', opacity: savingProfile ? 0.7 : 1 }}
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          <form onSubmit={handleChangePassword} className="card-stadium space-y-4 px-6 py-6 md:px-7">
            <h3 className="wealth-display text-3xl font-bold">Security</h3>

            <label className="block text-sm font-semibold">
              Current Password
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                }
                className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
                style={{ borderColor: 'var(--border)' }}
                autoComplete="current-password"
              />
            </label>

            <label className="block text-sm font-semibold">
              New Password
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                }
                className="mt-2 w-full radius-pill border bg-transparent px-4 py-3 outline-none"
                style={{ borderColor: 'var(--border)' }}
                autoComplete="new-password"
              />
            </label>

            <button
              type="submit"
              disabled={savingPassword}
              className="pill-button w-full px-4 py-3 text-sm font-semibold"
              style={{ background: 'var(--ink)', color: 'var(--canvas)', opacity: savingPassword ? 0.7 : 1 }}
            >
              {savingPassword ? 'Updating Password...' : 'Change Password'}
            </button>

            {successMessage ? (
              <p className="text-sm font-semibold" style={{ color: 'var(--growth)' }}>
                {successMessage}
              </p>
            ) : null}
          </form>
        </section>
      ) : null}
    </div>
  );
}
