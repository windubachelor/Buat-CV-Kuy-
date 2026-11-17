import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cloud,
  FileText,
  Lock,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge, Button, Input, Label } from '../components/ui/primitives';
import { auth, googleProvider } from '../lib/firebase';
import { useCVStore } from '../store/useCVStore';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, authReady } = useCVStore();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [providerNotEnabledGuide, setProviderNotEnabledGuide] = useState(false);

  useEffect(() => {
    if (authReady && currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [authReady, currentUser, navigate]);

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setProviderNotEnabledGuide(false);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      toast.success(
        `Selamat datang, ${result.user.displayName || result.user.email || 'Kandidat'}! Data CV disinkronkan ke Firebase.`
      );
      navigate('/dashboard');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const msg = (err as { message?: string })?.message || 'Gagal masuk dengan Google.';
      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Jendela login Google ditutup sebelum selesai. Silakan coba kembali.');
      } else if (code === 'auth/unauthorized-domain') {
        setErrorMsg(
          'Domain ini belum ditambahkan ke Authorized Domains di Firebase Console (Authentication → Settings → Authorized domains).'
        );
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setProviderNotEnabledGuide(false);

    if (!email.trim() || !password) {
      setErrorMsg('Mohon isi alamat email dan kata sandi terlebih dahulu.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (fullName.trim()) {
          await updateProfile(cred.user, { displayName: fullName.trim() });
        }
        toast.success('Akun berhasil dibuat! Menyinkronkan CV Anda ke Firebase Firestore...');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        toast.success('Berhasil masuk! Memuat dokumen CV dari Firebase Firestore...');
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setProviderNotEnabledGuide(true);
        setErrorMsg(
          'Metode login Email/Password belum diaktifkan pada proyek Firebase Anda. Gunakan tombol "Lanjutkan dengan Google" di atas atau aktifkan Email/Password di Firebase Console.'
        );
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password'
      ) {
        setErrorMsg('Email atau kata sandi tidak sesuai. Silakan periksa kembali atau daftar akun baru.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('Email ini sudah terdaftar. Silakan beralih ke tab Masuk (Login).');
      } else if (code === 'auth/weak-password') {
        setErrorMsg('Kata sandi terlalu lemah. Gunakan minimal 6 karakter.');
      } else {
        setErrorMsg((err as { message?: string })?.message || 'Gagal memproses autentikasi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden">
      {/* Ambient Background Blobs */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-36 left-1/4 w-[520px] h-[520px] rounded-full bg-[#B8A9F5]/20 dark:bg-[#B8A9F5]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[480px] h-[480px] rounded-full bg-[#BFEBD7]/20 dark:bg-[#BFEBD7]/8 blur-[120px]" />
      </div>

      {/* Top Navigation */}
      <header className="px-6 md:px-12 py-4 border-b border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-md flex items-center justify-between z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 text-lg font-bold font-heading text-[var(--foreground)]"
        >
          <div className="w-8 h-8 rounded-[10px] btn-lavender-gradient flex items-center justify-center">
            <FileText className="w-4 h-4 text-[#211942]" strokeWidth={2.5} />
          </div>
          <span>Buat CV Kuy</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-[960px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Pitch Column */}
          <div className="lg:col-span-6 space-y-5">
            <Badge variant="lavender" className="px-3 py-1 text-xs">
              <Cloud className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Firebase Cloud Sync &amp; Keamanan Dokumen</span>
            </Badge>

            <h1 className="text-2xl sm:text-3xl font-bold font-heading leading-tight">
              Simpan Seluruh CV Harvard &amp; Surat Lamaran Anda di Cloud Firebase.
            </h1>

            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              Masuk atau buat akun untuk menyinkronkan seluruh resume, cover letter, dan pengaturan tipografi LaTeX Anda secara otomatis di database Firebase Firestore. Akses dan lanjutkan penyusunan CV dari perangkat mana saja.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                <div className="text-xs">
                  <p className="font-bold text-[var(--foreground)]">
                    8 Template Resmi Harvard OCS &amp; Overleaf LaTeX (.tex)
                  </p>
                  <p className="text-[var(--muted-foreground)] mt-0.5">
                    Termasuk Classic Harvard, Jake&apos;s Resume SWE, Cover Letter #1 ModernCV Bahasa Indonesia, dan Simple Letter.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
                <ShieldCheck className="w-4 h-4 text-[#9B86EC] shrink-0 mt-0.5" strokeWidth={2.5} />
                <div className="text-xs">
                  <p className="font-bold text-[var(--foreground)]">
                    Sinkronisasi Real-Time ke Firebase Firestore
                  </p>
                  <p className="text-[var(--muted-foreground)] mt-0.5">
                    Setiap perubahan pada CV dan Cover Letter otomatis tersimpan ke akun pribadi Anda dengan proteksi aturan keamanan pemilik.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Auth Form Card */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-[24px] bg-[var(--surface)] border border-[var(--border-strong)] shadow-[var(--shadow-4)] space-y-5">
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  Masuk (Login)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  Daftar Akun Baru
                </button>
              </div>

              <div>
                <h2 className="text-lg font-bold font-heading">
                  {mode === 'login'
                    ? 'Masuk ke Ruang Kerja Buat CV Kuy'
                    : 'Buat Akun Baru Buat CV Kuy'}
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {mode === 'login'
                    ? 'Pilih login cepat dengan akun Google atau gunakan Email & Password Anda.'
                    : 'Daftarkan akun untuk menyimpan CV dan Cover Letter Anda di Firebase.'}
                </p>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleAuth}
                className="w-full h-11 px-4 rounded-xl border border-[var(--border-strong)] bg-white dark:bg-[#1E1A2E] hover:bg-[#FAF8FF] dark:hover:bg-[#26213A] text-sm font-bold text-[#1F1B2E] dark:text-white flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                <span>Lanjutkan dengan Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-[var(--border)] w-full" />
                <span className="bg-[var(--surface)] px-3 text-[11px] font-medium text-[var(--muted-foreground)] whitespace-nowrap">
                  atau dengan Email &amp; Password
                </span>
                <div className="border-t border-[var(--border)] w-full" />
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" strokeWidth={2.5} />
                    <span>{errorMsg}</span>
                  </div>
                  {providerNotEnabledGuide && (
                    <div className="pl-6 text-[11px] text-[var(--muted-foreground)] space-y-1">
                      <p className="font-semibold text-[var(--foreground)]">
                        Cara mengaktifkan Email/Password di Firebase Console (15 detik):
                      </p>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>Buka Firebase Console → pilih proyek Anda → menu <strong>Authentication</strong>.</li>
                        <li>Pilih tab <strong>Sign-in method</strong> → klik <strong>Add new provider</strong>.</li>
                        <li>Pilih <strong>Email/Password</strong> → geser tombol <strong>Enable</strong> → klik <strong>Save</strong>.</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {/* Email & Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <Label htmlFor="auth-name">Nama Lengkap</Label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <Input
                        id="auth-name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Contoh: Dita Dwi Auliani"
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="auth-email">Alamat Email</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      id="auth-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="auth-password">Kata Sandi (Password)</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      id="auth-password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-11 justify-center"
                  disabled={loading}
                >
                  <span>
                    {loading
                      ? 'Memproses...'
                      : mode === 'login'
                        ? 'Masuk dengan Email'
                        : 'Daftar & Simpan CV di Cloud'}
                  </span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </Button>
              </form>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                <span>Ingin mencoba editor langsung?</span>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="font-bold text-[#6E56CF] dark:text-[#B8A9F5] hover:underline cursor-pointer"
                >
                  Lanjut ke Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
