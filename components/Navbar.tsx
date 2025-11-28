import React, { useState } from 'react';
import { useApp } from '../store/context';
import { LogOut, ShoppingBag, User as UserIcon, Bell, X, ChevronDown, Menu } from 'lucide-react';
import { UserRole } from '../types';

const CATEGORIES = [
  { 
    name: 'Groceries', 
    subs: ['Rice & Atta', 'Dals & Pulses', 'Oils & Ghee', 'Masalas'] 
  },
  { 
    name: 'Vegetables', 
    subs: ['Fresh Vegetables', 'Fruits', 'Organic'] 
  },
  { 
    name: 'Snacks', 
    subs: ['Biscuits', 'Namkeen', 'Chips', 'Chocolates'] 
  },
  { 
    name: 'Beverages', 
    subs: ['Tea', 'Coffee', 'Juices', 'Soft Drinks'] 
  },
  { 
    name: 'Personal Care', 
    subs: ['Soaps', 'Shampoos', 'Skin Care', 'Oral Care'] 
  },
  {
    name: 'Household',
    subs: ['Detergents', 'Cleaners', 'Pooja Needs']
  }
];

const Navbar: React.FC = () => {
  const { currentUser, logout, cart, notifications, markNotificationRead, setHeaderCategory } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const myNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    setShowNotifs(false);
    logout();
  }

  const handleCategoryClick = (cat: string) => {
      setHeaderCategory(cat);
  };

  return (
    <div className="flex flex-col sticky top-0 z-50">
      {/* Main Navbar */}
      <nav className="bg-saffron-500 text-white shadow-md relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Digital Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleCategoryClick('All')}>
               <div className="bg-white p-1.5 rounded-lg shadow-sm transform hover:scale-105 transition">
                  <ShoppingBag className="h-6 w-6 text-saffron-600" />
               </div>
               <div className="flex flex-col leading-none">
                  <span className="text-xl font-black tracking-tighter italic">Desi<span className="text-navy-900">Mart</span></span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-navy-900 opacity-80">Local & Digital</span>
               </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <div className="hidden md:flex items-center space-x-2 bg-saffron-600/50 px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-saffron-400">
                    <UserIcon size={16} />
                    <span className="font-medium">{currentUser.name} ({currentUser.role === 'SHOPKEEPER' ? 'Seller' : currentUser.role})</span>
                  </div>

                  {/* Notifications for Shopkeepers/Riders/Admin */}
                  {currentUser.role !== UserRole.CUSTOMER && (
                    <div className="relative">
                      <button 
                        onClick={() => setShowNotifs(!showNotifs)}
                        className="p-1 rounded-full hover:bg-saffron-600 relative transition"
                      >
                        <Bell size={24} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      
                      {showNotifs && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 text-gray-800 animate-in fade-in slide-in-from-top-2 border border-gray-100">
                          <div className="bg-gray-100 p-3 flex justify-between items-center border-b">
                            <h3 className="font-bold text-sm">Notifications</h3>
                            <button onClick={() => setShowNotifs(false)}><X size={16} /></button>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {myNotifications.length === 0 ? (
                              <p className="p-4 text-center text-sm text-gray-500">No notifications.</p>
                            ) : (
                              myNotifications.slice().reverse().map(notif => (
                                <div 
                                  key={notif.id} 
                                  onClick={() => markNotificationRead(notif.id)}
                                  className={`p-3 border-b text-sm cursor-pointer hover:bg-gray-50 ${notif.isRead ? 'opacity-60' : 'bg-blue-50'}`}
                                >
                                  <p className="font-medium">{notif.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentUser.role === UserRole.CUSTOMER && (
                    <div className="relative">
                      <ShoppingBag className="h-6 w-6 cursor-pointer hover:text-gray-200 transition" />
                      {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-white text-saffron-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                          {cart.length}
                        </span>
                      )}
                    </div>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-saffron-600 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <span className="text-sm font-medium">Welcome, Guest</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Categories Navbar (Only for Customers) */}
      {currentUser?.role === UserRole.CUSTOMER && (
        <div className="bg-white shadow-sm border-b border-gray-200 relative z-40 hidden md:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex space-x-8 text-sm font-medium text-gray-600 overflow-visible">
                    {CATEGORIES.map((cat) => (
                        <div 
                            key={cat.name} 
                            className="relative group py-3"
                            onMouseEnter={() => setHoveredCategory(cat.name)}
                            onMouseLeave={() => setHoveredCategory(null)}
                        >
                            <button 
                                onClick={() => handleCategoryClick(cat.name)}
                                className="flex items-center hover:text-saffron-600 transition-colors"
                            >
                                {cat.name}
                                <ChevronDown size={14} className="ml-1 opacity-50 group-hover:opacity-100" />
                            </button>
                            
                            {/* Mega Menu / Dropdown */}
                            <div className="absolute top-full left-0 w-48 bg-white shadow-xl rounded-b-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top overflow-hidden">
                                <div className="py-2">
                                    {cat.subs.map(sub => (
                                        <button 
                                            key={sub} 
                                            onClick={() => handleCategoryClick(sub)} // Filter by sub-category logic can be refined later, mapping to 'Groceries' for now or precise sub match
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-saffron-600 text-xs"
                                        >
                                            {sub}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={() => handleCategoryClick('All')}
                        className="py-3 hover:text-saffron-600"
                    >
                        View All
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;