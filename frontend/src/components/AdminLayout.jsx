import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = ({ 
  children, 
  admin, 
  onLogout, 
  currentRole = 'admin', // 'admin' | 'teacher'
  activeTab = 'curriculum', 
  onTabChange,
  searchQuery = '',
  onSearchChange,
  breadcrumbs = [],
  primaryAction = null,
  statsBadge = null
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dedicated Admin Navigation Items (no cross-role switchers)
  const adminNavItems = [
    { id: 'curriculum', label: 'Curriculum Hub', icon: '📚', badge: null, path: '/admin' },
    { id: 'audio-studio', label: 'Audio Narration Studio', icon: '🎙️', badge: 'Studio', path: '/admin' },
    { id: 'guides-matrix', label: 'Guide Characters', icon: '🐾', badge: '4 Guides', path: '/admin' },
  ];

  // Dedicated Teacher Navigation Items (no cross-role switchers)
  const teacherNavItems = [
    { id: 'roster', label: 'Student Roster', icon: '👨‍🎓', badge: null, path: '/teacher' },
    { id: 'analytics', label: 'Class Analytics', icon: '📈', badge: null, path: '/teacher' },
    { id: 'curriculum-preview', label: 'Curriculum Plans', icon: '📖', badge: null, path: '/teacher' },
  ];

  const navItems = currentRole === 'admin' ? adminNavItems : teacherNavItems;

  const handleNavClick = (item) => {
    setIsMobileMenuOpen(false);
    if (item.path !== location.pathname) {
      navigate(item.path);
    } else if (onTabChange) {
      onTabChange(item.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EA] flex flex-col antialiased text-navy">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E3DCC8] shadow-sm px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger toggle */}
          <button
            type="button"
            className="lg:hidden p-2 text-navy hover:bg-cream rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Drawer"
          >
            <span className="text-xl">☰</span>
          </button>

          {/* Desktop Logo & Suite Indicator */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sun to-sun-dark flex items-center justify-center text-white font-baloo font-bold text-lg shadow-md">
                ☀️
              </div>
              <div>
                <span className="font-baloo font-extrabold text-navy text-lg tracking-tight block leading-tight">
                  UniMind<span className="text-sun">Kidz</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A8B99] block -mt-0.5">
                  {currentRole === 'admin' ? 'Desktop Admin Suite' : 'Teacher Command Center'}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-xs font-nunito text-[#7A8B99] pl-4 border-l border-[#E3DCC8]/80 ml-2">
            <span className="font-semibold text-navy">
              {currentRole === 'admin' ? 'Admin Hub' : 'Teacher Portal'}
            </span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span>/</span>
                <span className={idx === breadcrumbs.length - 1 ? 'font-bold text-navy' : 'text-[#7A8B99]'}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Global Search & Quick Actions in Header */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xl justify-end">
          {onSearchChange && (
            <div className="relative w-full max-w-xs hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-[#7A8B99]">
                🔍
              </span>
              <input
                type="text"
                placeholder={currentRole === 'admin' ? "Search lessons, grades, audio..." : "Search students, grades, progress..."}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 bg-[#FAF7F0] hover:bg-[#F3EFE6] focus:bg-white border border-[#E3DCC8] rounded-xl text-xs font-nunito focus:border-sun focus:outline-none transition-all placeholder-[#9AA8B4]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-[#7A8B99] hover:text-navy"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Primary Action Button (e.g. + New Lesson or Export CSV) */}
          {primaryAction}

          {/* User Profile widget */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E3DCC8]">
            <div className="w-8 h-8 rounded-full bg-sun text-white font-baloo font-bold flex items-center justify-center text-xs shadow-sm">
              {admin?.name ? admin.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <span className="block font-baloo font-bold text-xs text-navy leading-none">
                {admin?.name || 'Administrator'}
              </span>
              <span className="block text-[10px] text-[#7A8B99] font-nunito leading-none mt-0.5">
                {currentRole === 'admin' ? 'Content Lead' : 'Educator'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Left Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-white border-r border-[#E3DCC8] transition-all duration-200 z-20 ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Navigation Links */}
          <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#9AA8B4]">
              {!isSidebarCollapsed && (currentRole === 'admin' ? 'Administration' : 'Classroom Management')}
            </div>

            {navItems.map((item) => {
              const isActive = (item.path === location.pathname && activeTab === item.id) || 
                               (item.id === 'curriculum' && activeTab === 'curriculum' && location.pathname === '/admin') ||
                               (item.id === 'roster' && activeTab === 'roster' && location.pathname === '/teacher');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-baloo font-semibold text-sm transition-all text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-sun/15 to-sun/5 text-sun-dark border border-sun/30 font-bold shadow-xs'
                      : 'text-navy hover:bg-[#FAF7F0] hover:text-navy border border-transparent'
                  }`}
                  title={item.label}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {!isSidebarCollapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#7A8B99] border border-[#E3DCC8]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer: System Status & User Session */}
          <div className="p-3 border-t border-[#E3DCC8] bg-[#FAF7F0]/60 space-y-2">
            {!isSidebarCollapsed && (
              <div className="p-2 bg-white rounded-xl border border-[#E3DCC8]/80 text-[11px] font-nunito space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-navy">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-grass animate-pulse" />
                    System Status
                  </span>
                  <span className="font-bold text-grass">Online</span>
                </div>
                <div className="text-[10px] text-[#7A8B99]">
                  Audio: Real Studio & TTS Ready
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={onLogout}
                className={`flex items-center gap-2 py-1.5 px-2.5 rounded-xl text-xs font-baloo font-bold text-coral hover:bg-red-50 hover:text-red-700 transition-colors ${
                  isSidebarCollapsed ? 'w-full justify-center' : 'flex-1'
                }`}
                title="Sign out"
              >
                <span>🚪</span>
                {!isSidebarCollapsed && <span>Sign Out</span>}
              </button>

              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex p-1.5 text-xs text-[#7A8B99] hover:text-navy hover:bg-white rounded-lg border border-transparent hover:border-[#E3DCC8] transition-all"
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isSidebarCollapsed ? '→|' : '|←'}
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-Over Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-10 border-r border-[#E3DCC8]">
              <div className="p-4 border-b border-[#E3DCC8] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sun flex items-center justify-center text-white font-bold">
                    ☀️
                  </div>
                  <div>
                    <span className="font-baloo font-bold text-navy text-base">UniMindKidz</span>
                    <span className="text-[10px] block text-[#7A8B99]">
                      {currentRole === 'admin' ? 'Admin Portal' : 'Teacher Portal'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#7A8B99] hover:text-navy hover:bg-cream"
                >
                  ✕
                </button>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-baloo text-sm text-navy hover:bg-cream text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-cream rounded-full text-[#7A8B99]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-3 border-t border-[#E3DCC8] bg-[#FAF7F0]">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-50 text-coral font-baloo font-bold text-xs hover:bg-red-100"
                >
                  <span>🚪</span>
                  <span>Sign Out ({admin?.name || 'User'})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#F8F5EE]">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
