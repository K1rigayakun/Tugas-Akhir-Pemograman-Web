import { getSessionUser } from "../../actions/session";
import { prisma } from "@emerald-kingdom/db";
import Link from "next/link";
import { ShieldEmblem, SettingsGear, ScrollIcon } from "../../../components/LuxurySVGs";
import UsernameChanger from "../../../components/profile/UsernameChanger";

// Force dynamic rendering to avoid database calls at build time
export const dynamic = 'force-dynamic';

/**
 * Account Settings Page
 * User account configuration, security, and privacy settings
 */
export default async function AccountSettingsPage() {
  const sessionUser = await getSessionUser();
  
  if (!sessionUser) {
    return <div>User not found</div>;
  }
  
  // Fetch user data from database
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      username: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <h1 className="font-cinzel text-3xl text-gray-100">Pengaturan Akun</h1>
        <SettingsGear size={32} />
      </div>

      {/* WARNING BANNER */}
      <div className="bg-gradient-to-r from-red-900/10 to-transparent border-l-4 border-red-600 p-6 rounded-r-lg">
        <h3 className="text-red-400 text-lg mb-2 flex items-center gap-2">
          <ScrollIcon size={20} /> Name Change Policy
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          Username bersifat <strong>unik dan permanen</strong> untuk menjaga integritas Kingdom. Kamu hanya bisa mengubah username sekali setiap bulan menggunakan item khusus <strong>"Name Change Scroll"</strong> yang bisa dibeli dari Shop menggunakan Crown Coins (CC).
        </p>
      </div>

      {/* ACCOUNT SECTION */}
      <section className="bg-white/5 border border-white/5 rounded-2xl p-8">
        <h3 className="text-amber-400 text-xl mb-6">Account Details</h3>
        
        <div className="grid gap-6">
          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
              Username
            </label>
            <UsernameChanger currentUsername={user.username} />
          </div>

          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              defaultValue={user.email}
              disabled
              className="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
              Biography
            </label>
            <textarea 
              disabled
              placeholder="Bio update system is currently under maintenance by the Royal Engineers."
              className="w-full h-24 bg-black/50 border border-white/10 px-4 py-3 rounded-lg text-gray-400 resize-none cursor-not-allowed"
            />
          </div>
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section className="bg-white/5 border border-white/5 rounded-2xl p-8">
        <h3 className="text-amber-400 text-xl mb-6 flex items-center gap-2">
          <ShieldEmblem size={24} /> Security
        </h3>
        
        <div className="flex justify-between items-center pb-6 border-b border-white/5 mb-6">
          <div>
            <div className="text-gray-200 font-semibold mb-1">Two-Factor Authentication (2FA)</div>
            <div className="text-gray-400 text-sm">Protect your Vault and Wallet with an extra layer of security.</div>
          </div>
          <button 
            disabled 
            className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-6 py-2 rounded-lg font-semibold cursor-not-allowed opacity-70"
          >
            Enable 2FA
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <div className="text-gray-200 font-semibold mb-1">Change Password</div>
            <div className="text-gray-400 text-sm">Ensure your account stays secure.</div>
          </div>
          <button 
            disabled 
            className="bg-white/5 text-white border border-white/10 px-6 py-2 rounded-lg font-semibold cursor-not-allowed opacity-70"
          >
            Update
          </button>
        </div>
      </section>

      {/* PRIVACY SECTION */}
      <section className="bg-white/5 border border-white/5 rounded-2xl p-8">
        <h3 className="text-amber-400 text-xl mb-6">Privacy & Visibility</h3>
        
        <div className="flex justify-between items-center">
          <div>
            <div className="text-gray-200 font-semibold mb-1">Public Vault Visibility</div>
            <div className="text-gray-400 text-sm">Atur koleksi, statistik, alias anonim, dan mode Shadow di halaman privasi.</div>
          </div>
          <Link
            href="/settings/privacy"
            className="rounded-md border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-300 transition hover:bg-amber-400/20"
          >
            Buka Privasi
          </Link>
        </div>
      </section>
    </div>
  );
}
