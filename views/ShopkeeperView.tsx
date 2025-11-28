import React, { useState } from 'react';
import { useApp } from '../store/context';
import { OrderStatus, Product } from '../types';
import { Package, CheckCircle, Plus, Wand2, RefreshCw, Calendar, Save, Search, Upload, Store, User as UserIcon } from 'lucide-react';
import { generateProductDescription, generateShopDescription } from '../services/geminiService';

const ShopkeeperView: React.FC = () => {
  const { currentUser, updateUser, products, addProduct, updateProduct, orders, updateOrderStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Date Filters & Customer Filter
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [customerFilter, setCustomerFilter] = useState('');

  // New Product State
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCat, setNewProdCat] = useState('Groceries');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState<string>('');
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdUnit, setNewProdUnit] = useState('pc'); // New Unit State
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // AI Improvement State for existing products
  const [improvingId, setImprovingId] = useState<string | null>(null);

  // Shop Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [shopDesc, setShopDesc] = useState(currentUser?.shopDescription || '');
  const [shopImage, setShopImage] = useState(currentUser?.shopImageUrl || '');
  const [isGenShopDesc, setIsGenShopDesc] = useState(false);

  // Stock Edit State
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});

  // Filter orders for this shop
  const myOrders = orders.filter(o => o.shopId === currentUser?.id);
  
  const filteredOrders = myOrders.filter(o => {
      const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
      const matchesCustomer = o.customerName.toLowerCase().includes(customerFilter.toLowerCase());
      
      let matchesDate = true;
      if (dateRange.start) {
          const startDate = new Date(dateRange.start).setHours(0,0,0,0);
          matchesDate = matchesDate && o.createdAt >= startDate;
      }
      if (dateRange.end) {
          const endDate = new Date(dateRange.end).setHours(23,59,59,999);
          matchesDate = matchesDate && o.createdAt <= endDate;
      }

      return matchesStatus && matchesDate && matchesCustomer;
  });

  const myProducts = products.filter(p => p.shopId === currentUser?.id);

  const handleGenerateDesc = async () => {
    if (!newProdName) return;
    setIsGenerating(true);
    const desc = await generateProductDescription(newProdName, newProdCat);
    setNewProdDesc(desc);
    setIsGenerating(false);
  };

  const handleImproveDesc = async (product: Product) => {
      setImprovingId(product.id);
      const newDesc = await generateProductDescription(product.name, product.category);
      updateProduct({ ...product, description: newDesc });
      setImprovingId(null);
  };

  const handleGenerateShopDesc = async () => {
      if(!currentUser) return;
      setIsGenShopDesc(true);
      const categories = Array.from(new Set(myProducts.map(p => p.category))).join(', ');
      const desc = await generateShopDescription(currentUser.shopName || 'My Shop', categories);
      setShopDesc(desc);
      setIsGenShopDesc(false);
  };

  const handleSaveProfile = () => {
      if(!currentUser) return;
      updateUser({ ...currentUser, shopDescription: shopDesc, shopImageUrl: shopImage });
      setIsEditingProfile(false);
  };

  const handleStockChange = (id: string, value: string) => {
      setEditingStock(prev => ({ ...prev, [id]: Number(value) }));
  };

  const saveStock = (product: Product) => {
      const newStock = editingStock[product.id];
      if (newStock !== undefined && !isNaN(newStock)) {
          updateProduct({ ...product, stock: newStock });
          // Optional: clear editing state or keep it synced
          const newState = { ...editingStock };
          delete newState[product.id];
          setEditingStock(newState);
          alert(`Stock updated to ${newStock}`);
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setNewProdImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleShopImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setShopImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsAdding(true);

    let finalDesc = newProdDesc;
    
    // Auto-generate if empty
    if (!finalDesc.trim()) {
        finalDesc = await generateProductDescription(newProdName, newProdCat);
    }
    
    const newProduct: Product = {
        id: `p_${Date.now()}`,
        shopId: currentUser.id,
        shopName: currentUser.shopName || 'My Shop',
        name: newProdName,
        category: newProdCat,
        price: Number(newProdPrice),
        description: finalDesc,
        stock: Number(newProdStock),
        unit: newProdUnit,
        imageUrl: newProdImage || `https://picsum.photos/300/300?random=${Date.now()}`
    };
    
    addProduct(newProduct);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdDesc('');
    setNewProdImage('');
    setNewProdStock('10');
    setNewProdUnit('pc');
    setIsAdding(false);
    alert('Product Added!');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
           Namaste, {currentUser?.name} 👋
        </h1>
        <div className="space-x-2">
            <button 
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'orders' ? 'bg-saffron-600 text-white' : 'bg-white text-gray-600'}`}
            >
                Orders ({myOrders.filter(o => o.status === OrderStatus.PENDING).length})
            </button>
            <button 
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'inventory' ? 'bg-saffron-600 text-white' : 'bg-white text-gray-600'}`}
            >
                My Products & Profile
            </button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="grid gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                     <div className="flex items-center space-x-2 relative">
                        <Search size={18} className="text-gray-500 absolute left-2" />
                        <input 
                            type="text" 
                            placeholder="Filter by Customer..." 
                            value={customerFilter}
                            onChange={(e) => setCustomerFilter(e.target.value)}
                            className="pl-8 pr-2 py-2 border rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-saffron-500 text-sm"
                        />
                     </div>
                     <div className="flex items-center space-x-2">
                        <Calendar size={18} className="text-gray-500" />
                        <input 
                            type="date" 
                            value={dateRange.start} 
                            onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))}
                            className="border rounded p-2 text-sm"
                            placeholder="Start Date"
                        />
                        <span className="text-gray-400">to</span>
                        <input 
                            type="date" 
                            value={dateRange.end} 
                            onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))}
                            className="border rounded p-2 text-sm"
                            placeholder="End Date"
                        />
                    </div>
                </div>
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full md:w-48 p-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:border-saffron-500"
                >
                    <option value="All">All Status</option>
                    <option value={OrderStatus.PENDING}>Pending</option>
                    <option value={OrderStatus.ACCEPTED}>Accepted</option>
                    <option value={OrderStatus.READY}>Ready</option>
                    <option value={OrderStatus.PICKED_UP}>Picked Up</option>
                    <option value={OrderStatus.DELIVERED}>Delivered</option>
                </select>
            </div>

            {filteredOrders.length === 0 && <p className="text-center text-gray-500 py-8">No orders found.</p>}
            {filteredOrders.slice().reverse().map(order => (
                <div key={order.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-saffron-500">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${
                                order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                                order.status === OrderStatus.READY ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {order.status}
                            </span>
                            <p className="text-sm text-gray-500 mt-1">Order #{order.id.slice(-6)}</p>
                            <p className="font-bold text-gray-800 mt-1">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-xl font-bold text-saffron-600">₹{order.totalAmount}</p>
                             <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm py-1">
                                <span>{item.name} x {item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end space-x-3">
                        {order.status === OrderStatus.PENDING && (
                             <button 
                                onClick={() => updateOrderStatus(order.id, OrderStatus.ACCEPTED)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                             >
                                Accept Order
                             </button>
                        )}
                         {order.status === OrderStatus.ACCEPTED && (
                             <button 
                                onClick={() => updateOrderStatus(order.id, OrderStatus.READY)}
                                className="bg-saffron-600 text-white px-4 py-2 rounded hover:bg-saffron-700 transition flex items-center space-x-2"
                             >
                                <Package size={18} />
                                <span>Mark Ready for Pickup</span>
                             </button>
                        )}
                        {order.status === OrderStatus.READY && (
                            <div className="text-gray-500 italic text-sm flex items-center">
                                <CheckCircle size={16} className="mr-1" /> Waiting for Rider
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-8">
            {/* Shop Profile Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-saffron-100">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                         {currentUser?.shopImageUrl ? (
                             <img src={currentUser.shopImageUrl} alt="Shop" className="w-20 h-20 rounded-full object-cover border-2 border-saffron-200" />
                         ) : (
                            <div className="p-4 bg-saffron-100 rounded-full text-saffron-600">
                                <Store size={32} />
                            </div>
                         )}
                         <div>
                             <h2 className="text-xl font-bold">{currentUser?.shopName}</h2>
                             <p className="text-sm text-gray-500">Shop Profile</p>
                         </div>
                    </div>
                    <button 
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="text-saffron-600 font-bold text-sm hover:underline"
                    >
                        {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>
                
                {isEditingProfile ? (
                    <div className="mt-6 space-y-4 border-t pt-4">
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-1">Shop Description</label>
                             <textarea 
                                value={shopDesc}
                                onChange={(e) => setShopDesc(e.target.value)}
                                rows={3}
                                placeholder="Enter your shop description..."
                                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-saffron-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Shop Image</label>
                            <div className="flex items-center space-x-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center hover:bg-gray-50 transition cursor-pointer relative w-32 h-32 flex items-center justify-center">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleShopImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {shopImage ? (
                                        <img src={shopImage} alt="Preview" className="h-full w-full object-cover rounded" />
                                    ) : (
                                        <div className="text-gray-400">
                                            <Upload className="mx-auto mb-1" size={16}/>
                                            <span className="text-[10px]">Upload</span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400">Upload a logo or storefront image.</span>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                             <button 
                                onClick={handleGenerateShopDesc}
                                disabled={isGenShopDesc}
                                className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm font-bold"
                             >
                                 <Wand2 size={16} className="mr-2" />
                                 {isGenShopDesc ? 'Generating...' : 'Generate AI Bio'}
                             </button>
                             <button 
                                onClick={handleSaveProfile}
                                className="px-4 py-2 bg-saffron-600 text-white rounded hover:bg-saffron-700 text-sm font-bold"
                             >
                                 Save Profile
                             </button>
                        </div>
                    </div>
                ) : (
                    <p className="mt-4 text-gray-700 italic">
                        "{currentUser?.shopDescription || "No description set yet. Add one to attract customers!"}"
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Product Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            <Plus size={20} className="mr-2" /> Add New Item
                        </h3>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                <input 
                                    required
                                    type="text" 
                                    value={newProdName}
                                    onChange={e => setNewProdName(e.target.value)}
                                    className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-saffron-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select 
                                    value={newProdCat}
                                    onChange={e => setNewProdCat(e.target.value)}
                                    className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-saffron-400 focus:outline-none"
                                >
                                    <option>Groceries</option>
                                    <option>Vegetables</option>
                                    <option>Spices</option>
                                    <option>Dairy</option>
                                    <option>Snacks</option>
                                    <option>Beverages</option>
                                    <option>Personal Care</option>
                                    <option>Household</option>
                                </select>
                            </div>
                            
                            {/* Price & Unit Row */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                                    <input 
                                        required
                                        type="number" 
                                        value={newProdPrice}
                                        onChange={e => setNewProdPrice(e.target.value)}
                                        className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-saffron-400 focus:outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                                    <select 
                                        value={newProdUnit}
                                        onChange={e => setNewProdUnit(e.target.value)}
                                        className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-saffron-400 focus:outline-none"
                                    >
                                        <option value="pc">pc</option>
                                        <option value="kg">kg</option>
                                        <option value="gm">gm</option>
                                        <option value="L">L</option>
                                        <option value="ml">ml</option>
                                        <option value="pack">pack</option>
                                        <option value="dozen">dozen</option>
                                    </select>
                                </div>
                            </div>

                            {/* Stock Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Initial Stock (Qty)</label>
                                <input 
                                    required
                                    type="number" 
                                    value={newProdStock}
                                    onChange={e => setNewProdStock(e.target.value)}
                                    className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-saffron-400 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {newProdImage ? (
                                        <img src={newProdImage} alt="Preview" className="h-24 w-full object-contain mx-auto" />
                                    ) : (
                                        <div className="text-gray-400">
                                            <Upload className="mx-auto mb-2" size={20}/>
                                            <span className="text-xs">Click to upload image</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <button 
                                        type="button"
                                        onClick={handleGenerateDesc}
                                        disabled={!newProdName || isGenerating}
                                        className="text-xs text-saffron-600 font-bold flex items-center hover:text-saffron-700 disabled:opacity-50"
                                    >
                                        <Wand2 size={12} className="mr-1" /> 
                                        {isGenerating ? 'Generating...' : 'AI Write'}
                                    </button>
                                </div>
                                <textarea 
                                    value={newProdDesc}
                                    onChange={e => setNewProdDesc(e.target.value)}
                                    rows={3}
                                    placeholder="Leave empty to auto-generate"
                                    className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-saffron-400 focus:outline-none placeholder-gray-300"
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isAdding}
                                className="w-full bg-navy-900 text-white py-2 rounded hover:bg-opacity-90 transition disabled:opacity-70 flex items-center justify-center"
                            >
                                {isAdding ? <RefreshCw className="animate-spin h-5 w-5" /> : 'Add to Shop'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Product List */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myProducts.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
                        <div className="flex space-x-4">
                                <img src={p.imageUrl} className={`w-20 h-20 object-cover rounded bg-gray-100 ${p.stock <= 0 ? 'grayscale opacity-50' : ''}`} alt={p.name}/>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-800">{p.name}</h4>
                                        <div className="text-xs text-gray-500">
                                            {p.stock > 0 ? (
                                                <span className="text-green-600 font-bold">{p.stock} in stock</span>
                                            ) : (
                                                <span className="text-red-600 font-bold">Out of Stock</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">{p.category}</p>
                                    <p className="text-saffron-600 font-bold mt-1">₹{p.price} <span className="text-xs text-gray-400 font-normal">/ {p.unit || 'pc'}</span></p>
                                    
                                    <div className="mt-2 flex items-center space-x-2">
                                        <input 
                                            type="number"
                                            min="0"
                                            className="w-16 border rounded p-1 text-sm"
                                            placeholder="Qty"
                                            value={editingStock[p.id] !== undefined ? editingStock[p.id] : p.stock}
                                            onChange={(e) => handleStockChange(p.id, e.target.value)}
                                        />
                                        <button 
                                            onClick={() => saveStock(p)}
                                            className="bg-gray-800 text-white p-1 rounded hover:bg-gray-900"
                                            title="Update Stock"
                                        >
                                            <Save size={14} />
                                        </button>
                                    </div>
                                </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-50 flex items-start justify-between">
                                <p className="text-xs text-gray-400 line-clamp-2 flex-1 mr-2 italic">
                                    {p.description || "No description."}
                                </p>
                                <button 
                                    onClick={() => handleImproveDesc(p)}
                                    disabled={improvingId === p.id}
                                    className="text-xs bg-saffron-50 text-saffron-600 px-2 py-1 rounded border border-saffron-200 hover:bg-saffron-100 flex items-center whitespace-nowrap"
                                    title="Improve Description with AI"
                                >
                                    {improvingId === p.id ? (
                                        <RefreshCw size={12} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Wand2 size={12} className="mr-1" /> Improve
                                        </>
                                    )}
                                </button>
                        </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ShopkeeperView;