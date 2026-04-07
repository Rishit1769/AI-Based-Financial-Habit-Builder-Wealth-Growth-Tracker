import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';
import { User, Lock, IndianRupee, Camera } from 'lucide-react';

export default function Profile() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', bio: '', monthly_income_target: '', currency: 'INR' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });

  useEffect(() => {
    api.get('/users/profile')
      .then((res) => {
        const p = res.data.data;
        setProfile(p);
        setProfileForm({ name: p.name || '', bio: p.bio || '', monthly_income_target: p.financial_profile?.monthly_income_target || '', currency: p.financial_profile?.currency || 'INR' });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/users/profile', profileForm);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await api.post('/users/change-password', { current_password: passwordForm.current_password, new_password: passwordForm.new_password });
      toast.success('Password changed successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPassword(false); }
  };

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map((i) => <div key={i} className="h-24 bg-elevated rounded-xl animate-pulse" />)}
    </div>
  );

  const initials = profile?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-main">Profile</h1>
        <p className="text-sub text-sm mt-0.5">Manage your account settings</p>
      </div>

      {/* Avatar & info */}
      <Card>
        <div className="p-6 flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center text-xl font-bold text-white">
              {initials}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-main">{profile?.name}</h2>
            <p className="text-sub text-sm">{profile?.email}</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full capitalize font-medium ${profile?.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
              {profile?.role}
            </span>
          </div>
        </div>
      </Card>

      {/* Edit profile */}
      <Card title="Personal Information">
        <form onSubmit={handleProfileSave} className="p-5 space-y-4">
          <Input label="Full Name" placeholder="Your name" value={profileForm.name}
            onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} icon={User} required />
          <Input label="Bio (optional)" placeholder="Tell us about yourself..." value={profileForm.bio}
            onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))} />
          <Input label="Monthly Income Target (₹)" type="number" placeholder="0.00" min="0" step="0.01"
            value={profileForm.monthly_income_target}
            onChange={(e) => setProfileForm((f) => ({ ...f, monthly_income_target: e.target.value }))}
            icon={IndianRupee} />
          <div>
            <label className="text-xs font-medium text-sub block mb-1">Currency</label>
            <select value={profileForm.currency} onChange={(e) => setProfileForm((f) => ({ ...f, currency: e.target.value }))}
              className="field">
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="EUR">EUR — Euro (€)</option>
              <option value="GBP">GBP — British Pound (£)</option>
            </select>
          </div>
          <div className="flex justify-end pt-1">
            <Button type="submit" loading={savingProfile}>Save Changes</Button>
          </div>
        </form>
      </Card>

      {/* Change password */}
      <Card title="Change Password">
        <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
          <Input label="Current Password" type="password" placeholder="Enter current password"
            value={passwordForm.current_password}
            onChange={(e) => setPasswordForm((f) => ({ ...f, current_password: e.target.value }))}
            icon={Lock} required />
          <Input label="New Password" type="password" placeholder="Min. 8 characters"
            value={passwordForm.new_password}
            onChange={(e) => setPasswordForm((f) => ({ ...f, new_password: e.target.value }))}
            icon={Lock} required />
          <Input label="Confirm New Password" type="password" placeholder="Repeat new password"
            value={passwordForm.confirm_password}
            onChange={(e) => setPasswordForm((f) => ({ ...f, confirm_password: e.target.value }))}
            icon={Lock} required />
          <div className="flex justify-end pt-1">
            <Button type="submit" loading={savingPassword} variant="secondary">Change Password</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
