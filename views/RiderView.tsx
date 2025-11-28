import React, { useState, useEffect } from 'react';
import { useApp } from '../store/context';
import { OrderStatus, Order, RiderExperience, Coordinates } from '../types';
import { MapPin, Navigation, CheckCircle, Package, MessageCircle, X, Send, DollarSign, Calendar, Power, TrendingUp, Filter, Clock, Star, Activity, Smile } from 'lucide-react';

const RateExperienceModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (rating: number, comment: string) => void }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in">
                <h3 className="text-xl font-bold mb-4">Rate this Delivery</h3>
                <div className="flex justify-center space-x-2 mb-6">
                    {[1,2,3,4,5].map(star => (
                        <button key={star} onClick={() => setRating(star)}>
                            <Star size={32} className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                    ))}
                </div>
                <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Any feedback on the customer or route?"
                    className="w-full border p-3 rounded-lg mb-4 text-sm"
                    rows={3}
                ></textarea>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold">Cancel</button>
                    <button onClick={() => onSubmit(rating, comment)} className="flex-1 bg-saffron-600 text-white py-2 rounded-lg font-bold">Submit</button>
                </div>
            </div>
        </div>
    );
};

// Simple simulated map using SVG
const LiveMap = ({ order }: { order: Order }) => {
    const [riderPos, setRiderPos] = useState({ x: 10, y: 50 }); // Start near shop
    
    // Simulate movement
    useEffect(() => {
        // Shop is at 10, 50. Customer is at 90, 50.
        // Rider moves from 10 -> 90.
        const interval = setInterval(() => {
            setRiderPos(prev => {
                if (prev.x >= 90) return prev; // Arrived
                return { x: prev.x + 0.5, y: 50 }; // Move right
            });
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gray-100 rounded-lg overflow-hidden relative h-48 border border-gray-200">
            <div className="absolute top-2 right-2 bg-white/80 px-2 py-1 text-[10px] rounded backdrop-blur font-bold z-10">
                Live Tracking
            </div>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Background Grid */}
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                </pattern>
                <rect width="100" height="100" fill="url(#grid)" />

                {/* Road */}
                <line x1="10" y1="50" x2="90" y2="50" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />

                {/* Shop */}
                <circle cx="10" cy="50" r="3" fill="#e67e00" />
                <text x="10" y="60" fontSize="4" textAnchor="middle" fill="#666">Shop</text>

                {/* Customer */}
                <circle cx="90" cy="50" r="3" fill="#138808" />
                <text x="90" y="60" fontSize="4" textAnchor="middle" fill="#666">Home</text>

                {/* Rider */}
                <g transform={`translate(${riderPos.x}, ${riderPos.y})`}>
                    <circle r="2.5" fill="#000080" />
                    <circle r="4" fill="#000080" opacity="0.2" className="animate-ping" />
                </g>
            </svg>
        </div>
    );
};

const RiderView: React.FC = () => {
  const { currentUser, orders, updateOrderStatus, sendOrderMessage, riderAvailability, toggleRiderAvailability, addRiderExperience } = useApp();

  // State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'earnings'>('dashboard');
  const [chatOpen, setChatOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [messageInput, setMessageInput] = useState('');
  
  // Rating
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [orderToRate, setOrderToRate] = useState<string | null>(null);

  // Date Filters
  const [historyDateRange, setHistoryDateRange] = useState({ start: '', end: '' });
  const [earningsDateRange, setEarningsDateRange] = useState({ start: '', end: '' });

  // Current Rider Availability
  const isOnline = currentUser ? (riderAvailability[currentUser.id] !== false) : true;

  // 1. Available Orders: Ready for pickup AND no rider assigned yet
  const availableOrders = orders.filter(o => o.status === OrderStatus.READY && !o.riderId);
  
  // 2. Active Deliveries: Assigned to this rider and not yet delivered
  const myDeliveries = orders.filter(o => o.riderId === currentUser?.id && o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED);

  // 3. Completed History
  const history = orders.filter(o => o.riderId === currentUser?.id && o.status === OrderStatus.DELIVERED);
  
  const filteredHistory = history.filter(o => {
    let matchesDate = true;
    if (historyDateRange.start) {
        const startDate = new Date(historyDateRange.start).setHours(0,0,0,0);
        matchesDate = matchesDate && o.createdAt >= startDate;
    }
    if (historyDateRange.end) {
        const endDate = new Date(historyDateRange.end).setHours(23,59,59,999);
        matchesDate = matchesDate && o.createdAt <= endDate;
    }
    return matchesDate;
  });

  const filteredEarningsList = history.filter(o => {
      // Logic for Earnings list specific date filter
      const time = o.deliveredAt || o.createdAt;
      let matchesDate = true;
      if (earningsDateRange.start) {
          const startDate = new Date(earningsDateRange.start).setHours(0,0,0,0);
          matchesDate = matchesDate && time >= startDate;
      }
      if (earningsDateRange.end) {
          const endDate = new Date(earningsDateRange.end).setHours(23,59,59,999);
          matchesDate = matchesDate && time <= endDate;
      }
      return matchesDate;
  });

  // Calculate Earnings (Mock: ₹50 per delivery)
  const DELIVERY_FEE = 50;
  
  const calculateEarnings = (period: 'daily' | 'weekly' | 'monthly') => {
      const now = new Date();
      return history.filter(o => {
          // Use deliveredAt for earnings calculation, fallback to pickedUpAt or createdAt if missing (simulated)
          const time = o.deliveredAt || o.createdAt; 
          if(!time) return false;
          
          const d = new Date(time);
          
          if (period === 'daily') {
              return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          } else if (period === 'weekly') {
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return d >= weekAgo;
          } else {
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              return d >= monthAgo;
          }
      }).length * DELIVERY_FEE;
  };
  
  const dailyEarnings = calculateEarnings('daily');
  const weeklyEarnings = calculateEarnings('weekly');
  const monthlyEarnings = calculateEarnings('monthly');

  // New Performance Stats
  const deliveriesToday = history.filter(o => {
      const time = o.deliveredAt || o.createdAt;
      const d = new Date(time);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const avgDeliveryTime = history.reduce((sum, o) => {
      if (o.pickedUpAt && o.deliveredAt) {
          return sum + (o.deliveredAt - o.pickedUpAt);
      }
      return sum;
  }, 0) / (history.filter(o => o.pickedUpAt && o.deliveredAt).length || 1);
  
  const avgMinutes = Math.round(avgDeliveryTime / 1000 / 60);

  const openChat = (order: Order) => {
    setActiveOrder(order);
    setChatOpen(true);
  };

  const handleSendMessage = () => {
    if(!activeOrder || !messageInput.trim()) return;
    sendOrderMessage(activeOrder.id, messageInput);
    setMessageInput('');
  };

  const openRateModal = (orderId: string) => {
      setOrderToRate(orderId);
      setRateModalOpen(true);
  };

  const handleSubmitRating = (rating: number, comment: string) => {
      if (!currentUser || !orderToRate) return;
      addRiderExperience({
          id: `rexp_${Date.now()}`,
          riderId: currentUser.id,
          orderId: orderToRate,
          rating,
          comment,
          timestamp: Date.now()
      });
      setRateModalOpen(false);
      alert("Feedback submitted!");
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
       <div className="mb-6 bg-navy-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Rider Dashboard</h1>
            <p className="opacity-80">Ride Safe, {currentUser?.name}!</p>
          </div>
          <div className="flex items-center space-x-4">
              <div className="flex items-center bg-white/10 rounded-full p-1">
                  <button 
                     onClick={() => currentUser && toggleRiderAvailability(currentUser.id)}
                     className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold transition-all ${isOnline ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-200'}`}
                  >
                      <Power size={16} />
                      <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                  </button>
              </div>
          </div>
       </div>

       <div className="flex space-x-2 mb-6">
           <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'dashboard' ? 'bg-saffron-600 text-white' : 'bg-white text-gray-600 shadow'}`}
           >
               Deliveries
           </button>
           <button 
              onClick={() => setActiveTab('earnings')}
              className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'earnings' ? 'bg-saffron-600 text-white' : 'bg-white text-gray-600 shadow'}`}
           >
               Earnings & Stats
           </button>
       </div>

       {activeTab === 'dashboard' && (
           <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section 1: Available Pickups */}
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Package className="mr-2 text-saffron-600" /> New Pickups Available
                    </h2>
                    <div className="space-y-4">
                        {availableOrders.length === 0 && <p className="text-gray-500 italic">No orders ready for pickup nearby.</p>}
                        {availableOrders.map(order => (
                            <div key={order.id} className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-500">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold">{order.shopName}</h3>
                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                            <MapPin size={14} className="mr-1" /> {order.address.slice(0, 20)}...
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-800">₹{order.totalAmount}</span>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Ready</span>
                                    <button 
                                        disabled={!isOnline}
                                        onClick={() => currentUser && updateOrderStatus(order.id, OrderStatus.PICKED_UP, currentUser.id)}
                                        className={`text-white text-sm px-4 py-2 rounded hover:bg-opacity-90 ${isOnline ? 'bg-navy-900' : 'bg-gray-400 cursor-not-allowed'}`}
                                    >
                                        {isOnline ? 'Accept Delivery' : 'Go Online to Accept'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 2: My Active Deliveries */}
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Navigation className="mr-2 text-blue-600" /> Current Deliveries
                    </h2>
                    <div className="space-y-6">
                        {myDeliveries.length === 0 && <p className="text-gray-500 italic">No active deliveries.</p>}
                        {myDeliveries.map(order => (
                            <div key={order.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                                {/* Map View */}
                                <LiveMap order={order} />

                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
                                            <p className="font-bold">{order.customerName}</p>
                                        </div>
                                        <button 
                                            onClick={() => openChat(order)}
                                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                                        >
                                            <MessageCircle size={20} />
                                        </button>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Destination</p>
                                        <p className="text-sm">{order.address}</p>
                                    </div>
                                    
                                    {order.status === OrderStatus.PICKED_UP ? (
                                        <button 
                                            onClick={() => updateOrderStatus(order.id, OrderStatus.DELIVERED)}
                                            className="w-full bg-green-600 text-white py-2 rounded font-bold shadow hover:bg-green-700 transition"
                                        >
                                            Mark Delivered
                                        </button>
                                    ) : (
                                        <span className="w-full block text-center bg-gray-100 py-2 rounded text-gray-600 font-bold">
                                            {order.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="mt-12">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                     <h2 className="text-lg font-bold text-gray-800">Delivery History</h2>
                     <div className="flex items-center space-x-2 mt-2 md:mt-0">
                        <Calendar size={18} className="text-gray-500" />
                        <input 
                            type="date" 
                            value={historyDateRange.start} 
                            onChange={e => setHistoryDateRange(prev => ({...prev, start: e.target.value}))}
                            className="border rounded p-2 text-sm"
                        />
                        <span className="text-gray-400">-</span>
                        <input 
                            type="date" 
                            value={historyDateRange.end} 
                            onChange={e => setHistoryDateRange(prev => ({...prev, end: e.target.value}))}
                            className="border rounded p-2 text-sm"
                        />
                     </div>
                </div>
                
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Shop</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Feedback</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredHistory.map(order => (
                                <tr key={order.id}>
                                    <td className="p-4 text-gray-500">#{order.id.slice(-6)}</td>
                                    <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4">{order.shopName}</td>
                                    <td className="p-4">₹{order.totalAmount}</td>
                                    <td className="p-4 text-green-600 flex items-center">
                                        <CheckCircle size={14} className="mr-1"/> Delivered
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => openRateModal(order.id)}
                                            className="text-xs bg-saffron-50 text-saffron-600 px-2 py-1 rounded border border-saffron-200 hover:bg-saffron-100 flex items-center w-fit"
                                        >
                                            <Smile size={12} className="mr-1"/> Rate Experience
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredHistory.length === 0 && <div className="p-6 text-center text-gray-500">No history matches criteria.</div>}
                </div>
            </div>
           </>
       )}

       {activeTab === 'earnings' && (
           <div className="space-y-8">
               <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                   <TrendingUp className="mr-2 text-green-600" /> Performance & Earnings
               </h2>
               
               {/* Financial Stats */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500">
                       <p className="text-gray-500 font-medium">Today's Earnings</p>
                       <h3 className="text-3xl font-bold text-gray-800 mt-2">₹{dailyEarnings}</h3>
                       <p className="text-xs text-green-600 mt-2 flex items-center"><DollarSign size={12}/> Based on completed deliveries today</p>
                   </div>
                   <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500">
                       <p className="text-gray-500 font-medium">This Week</p>
                       <h3 className="text-3xl font-bold text-gray-800 mt-2">₹{weeklyEarnings}</h3>
                       <p className="text-xs text-blue-600 mt-2 flex items-center"><DollarSign size={12}/> Last 7 days total</p>
                   </div>
                   <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-purple-500">
                       <p className="text-gray-500 font-medium">This Month</p>
                       <h3 className="text-3xl font-bold text-gray-800 mt-2">₹{monthlyEarnings}</h3>
                       <p className="text-xs text-purple-600 mt-2 flex items-center"><DollarSign size={12}/> Last 30 days total</p>
                   </div>
               </div>

               {/* New Performance Stats */}
               <h3 className="text-lg font-bold text-gray-800 mt-4">Performance Metrics</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center space-x-4">
                       <div className="bg-white p-3 rounded-full text-blue-500 shadow-sm"><Activity size={20}/></div>
                       <div>
                           <p className="text-xs text-gray-500 uppercase font-bold">Today's Volume</p>
                           <p className="text-xl font-bold">{deliveriesToday} Deliveries</p>
                       </div>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center space-x-4">
                       <div className="bg-white p-3 rounded-full text-orange-500 shadow-sm"><Clock size={20}/></div>
                       <div>
                           <p className="text-xs text-gray-500 uppercase font-bold">Avg. Delivery Time</p>
                           <p className="text-xl font-bold">{avgMinutes > 0 ? `${avgMinutes} mins` : 'N/A'}</p>
                       </div>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center space-x-4">
                       <div className="bg-white p-3 rounded-full text-yellow-500 shadow-sm"><Star size={20}/></div>
                       <div>
                           <p className="text-xs text-gray-500 uppercase font-bold">Customer Rating</p>
                           <p className="text-xl font-bold">{currentUser?.riderRating || '4.8'} / 5.0</p>
                       </div>
                   </div>
               </div>

               {/* Earnings Breakdown List */}
               <div>
                   <div className="flex flex-col md:flex-row justify-between items-center mb-4 mt-8">
                       <h3 className="text-xl font-bold text-gray-800">Earnings History</h3>
                       <div className="flex items-center space-x-2 mt-2 md:mt-0">
                           <Filter size={18} className="text-gray-500" />
                           <input 
                               type="date" 
                               value={earningsDateRange.start} 
                               onChange={e => setEarningsDateRange(prev => ({...prev, start: e.target.value}))}
                               className="border rounded p-2 text-sm focus:ring-2 focus:ring-saffron-400 focus:outline-none"
                           />
                           <span className="text-gray-400">-</span>
                           <input 
                               type="date" 
                               value={earningsDateRange.end} 
                               onChange={e => setEarningsDateRange(prev => ({...prev, end: e.target.value}))}
                               className="border rounded p-2 text-sm focus:ring-2 focus:ring-saffron-400 focus:outline-none"
                           />
                       </div>
                   </div>

                   <div className="bg-white rounded-xl shadow overflow-hidden">
                       <table className="w-full text-sm text-left">
                           <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                               <tr>
                                   <th className="p-4">Date</th>
                                   <th className="p-4">Order ID</th>
                                   <th className="p-4">Shop Name</th>
                                   <th className="p-4 text-right">Delivery Fee</th>
                                   <th className="p-4 text-right">Bonus</th>
                                   <th className="p-4 text-right">Total</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y">
                               {filteredEarningsList.length === 0 ? (
                                   <tr>
                                       <td colSpan={6} className="p-6 text-center text-gray-500">No earnings records found for this period.</td>
                                   </tr>
                               ) : (
                                   filteredEarningsList.slice().reverse().map(order => (
                                       <tr key={order.id} className="hover:bg-gray-50">
                                           <td className="p-4">
                                               {new Date(order.deliveredAt || order.createdAt).toLocaleDateString()}
                                               <div className="text-xs text-gray-400">{new Date(order.deliveredAt || order.createdAt).toLocaleTimeString()}</div>
                                           </td>
                                           <td className="p-4 font-mono text-gray-500">#{order.id.slice(-6)}</td>
                                           <td className="p-4">{order.shopName}</td>
                                           <td className="p-4 text-right text-gray-600">₹{DELIVERY_FEE}</td>
                                           <td className="p-4 text-right text-gray-600">₹0</td>
                                           <td className="p-4 text-right font-bold text-green-600">+ ₹{DELIVERY_FEE}</td>
                                       </tr>
                                   ))
                               )}
                           </tbody>
                       </table>
                   </div>
               </div>

               <div className="bg-white p-8 rounded-xl shadow">
                    <h3 className="font-bold text-lg mb-4">Payout Schedule</h3>
                    <p className="text-gray-500 text-sm">
                        Payments are processed weekly every Monday. Ensure your bank details are up to date in your profile.
                        <br/>
                        <span className="text-saffron-600 font-bold mt-2 block">Next Payout: Monday, {new Date(new Date().setDate(new Date().getDate() + (1 + 7 - new Date().getDay()) % 7)).toLocaleDateString()}</span>
                    </p>
               </div>
           </div>
       )}

       {/* Chat Modal */}
       {chatOpen && activeOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[500px] flex flex-col">
                  <div className="bg-blue-600 p-4 rounded-t-xl text-white flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                          <MessageCircle size={20} />
                          <span className="font-bold">Chat with {activeOrder.customerName}</span>
                      </div>
                      <button onClick={() => setChatOpen(false)}><X size={20}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                      {(!activeOrder.chatHistory || activeOrder.chatHistory.length === 0) && (
                          <p className="text-center text-gray-400 text-sm mt-4">Start messaging the customer.</p>
                      )}
                      {activeOrder.chatHistory?.map((msg, idx) => {
                          const isMe = msg.senderId === currentUser?.id;
                          return (
                              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[80%] p-2 px-3 rounded-lg text-sm ${isMe ? 'bg-blue-100 text-blue-900' : 'bg-white border text-gray-800'}`}>
                                      <p>{msg.text}</p>
                                      <p className="text-[10px] opacity-60 text-right mt-1">
                                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </p>
                                  </div>
                              </div>
                          )
                      })}
                  </div>

                  <div className="p-3 border-t bg-white">
                      <div className="flex space-x-2">
                          <input 
                              type="text" 
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              placeholder="Type a message..."
                              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <button 
                            onClick={handleSendMessage}
                            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                          >
                              <Send size={18} />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
       )}

       {/* Rate Modal */}
       <RateExperienceModal 
           isOpen={rateModalOpen}
           onClose={() => setRateModalOpen(false)}
           onSubmit={handleSubmitRating}
       />
    </div>
  );
};

export default RiderView;