import React, { useState } from 'react';
import { useApp } from '../store/context';
import { SAMPLE_USERS } from '../constants';
import { Users, ShoppingBag, Truck, DollarSign, Search } from 'lucide-react';

const AdminView: React.FC = () => {
  const { products, orders } = useApp();
  const [customerSearch, setCustomerSearch] = useState('');

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalShops = SAMPLE_USERS.filter(u => u.role === 'SHOPKEEPER').length;
  
  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color} text-white`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
  );

  const filteredOrders = orders.filter(o => 
      o.customerName.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Total Users" value={SAMPLE_USERS.length} icon={Users} color="bg-blue-500" />
            <StatCard title="Active Shops" value={totalShops} icon={ShoppingBag} color="bg-saffron-500" />
            <StatCard title="Total Orders" value={orders.length} icon={Truck} color="bg-purple-500" />
            <StatCard title="Platform Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-green-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Recent Orders</h3>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search customer..." 
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="pl-8 pr-3 py-1 text-sm border rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <Search className="absolute left-2.5 top-1.5 text-gray-400" size={14} />
                    </div>
                </div>
                
                <div className="space-y-3">
                    {filteredOrders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <div>
                                <p className="font-bold text-sm">#{order.id.slice(-6)}</p>
                                <p className="text-xs text-gray-500">{order.customerName}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-gray-100'}`}>
                                {order.status}
                            </span>
                        </div>
                    ))}
                    {filteredOrders.length === 0 && <p className="text-gray-500 text-sm">No orders matching search.</p>}
                </div>
            </div>

             <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold mb-4">Product Inventory Overview</h3>
                <div className="space-y-3">
                    {products.slice(0, 5).map(prod => (
                        <div key={prod.id} className="flex items-center space-x-3 border-b border-gray-100 pb-2">
                             <img src={prod.imageUrl} className="w-8 h-8 rounded bg-gray-200" alt="" />
                             <div className="flex-1">
                                <p className="font-medium text-sm truncate">{prod.name}</p>
                                <p className="text-xs text-gray-500">{prod.shopName}</p>
                             </div>
                             <span className="text-sm font-bold">₹{prod.price}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default AdminView;