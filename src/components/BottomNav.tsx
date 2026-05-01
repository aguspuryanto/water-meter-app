import { NavLink } from 'react-router-dom'
import { Home, Users, PenSquare, History } from 'lucide-react'

export default function BottomNav() {
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/warga', icon: Users, label: 'Warga' },
    { to: '/catat', icon: PenSquare, label: 'Catat' },
    { to: '/riwayat', icon: History, label: 'Riwayat' },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center p-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
          <Icon size={24} />
          <span className="text-xs">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}