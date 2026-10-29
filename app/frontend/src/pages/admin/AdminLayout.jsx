import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Image,
  Star,
  FileText,
  LogOut,
  Menu,
  X,
  Home,
  Settings
} from 'lucide-react';
import { getAdminSession, logoutAdmin } from '../../lib/adminApi';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState('checking');
  const [logoutError,setLogoutError] = useState('');

  useEffect(() => {
    let active = true;
    const expire = () => navigate('/admin', {replace:true});
    window.addEventListener('admin-session-expired',expire);
    getAdminSession()
      .then(()=>{if(active)setSession('verified');})
      .catch(()=>{if(active)setSession('error');});
    return ()=>{active=false;window.removeEventListener('admin-session-expired',expire);};
  }, [navigate]);

  useEffect(() => {
    const close = event => { if(event.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown',close);
    return ()=>window.removeEventListener('keydown',close);
  },[]);

  const handleLogout = async () => {
    try {await logoutAdmin();navigate('/admin',{replace:true});}
    catch {setLogoutError('Не удалось завершить сессию. Проверьте соединение и повторите выход.');}
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Панель управления', icon: LayoutDashboard },
    { path: '/admin/categories', label: 'Категории', icon: FolderTree },
    { path: '/admin/products', label: 'Товары', icon: Package },
    { path: '/admin/slides', label: 'Слайдер', icon: Image },
    { path: '/admin/featured', label: 'Популярные товары', icon: Star },
    { path: '/admin/orders', label: 'Заявки', icon: FileText },
    { path: '/admin/settings', label: 'Настройки', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path+'/');

  if (session !== 'verified') return <div className="min-h-screen grid place-items-center bg-slate-50 p-6"><div role="status" className="text-center max-w-md"><p className="text-slate-700">{session === 'checking' ? 'Проверяем доступ…' : 'Не удалось проверить доступ. Проверьте соединение и повторите вход.'}</p>{session === 'error' && <button onClick={()=>navigate('/admin',{replace:true})} className="ui-button mt-5 px-5 py-3 bg-[#074089] text-white">Вернуться ко входу</button>}</div></div>;

  return (
    <div className="admin-shell min-h-screen bg-slate-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-md px-4 py-3 flex items-center justify-between">
        <button aria-label="Открыть меню администратора" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(true)} className="p-2">
          <Menu size={24} />
        </button>
        <span className="font-bold text-gray-900">Админ-панель</span>
        <Link to="/" aria-label="На сайт" className="p-2 text-[#074089]">
          <Home size={24} />
        </Link>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-[#102f57] text-white flex flex-col transform transition-transform duration-200
        lg:translate-x-0 lg:visible ${sidebarOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'}
      `}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Tib Tekhnologiya</h1>
            <p className="text-gray-400 text-sm">Админ-панель</p>
          </div>
          <button aria-label="Закрыть меню администратора" onClick={() => setSidebarOpen(false)} className="lg:hidden p-2">
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Разделы админ-панели" className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive(item.path) ? 'page' : undefined}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive(item.path)
                  ? 'bg-white/15 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors mb-2"
          >
            <Home size={20} />
            На сайт
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/30 hover:text-red-300 rounded-lg transition-colors w-full"
          >
            <LogOut size={20} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        {logoutError && <p role="alert" className="m-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-800">{logoutError}</p>}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
