import React, { useState, useEffect } from 'react';
import { useApp } from '../store/context';
import { Product, Order, OrderStatus, Review, UserRole } from '../types';
import { SAMPLE_USERS } from '../constants';
import { ShoppingCart, Plus, Minus, Search, Sparkles, Filter, Star, MessageCircle, X, Send, Store, Check, Clock, Package, Truck, Home, MapPin, User as UserIcon, Zap, AlertTriangle, CreditCard, Banknote, Smartphone, Loader2, Heart, RefreshCw, Radio, Trash2, History, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';
import { chatWithAssistant, analyzeSearchQuery, getPersonalizedRecommendations } from '../services/geminiService';

interface ChatSession {
  id: string;
  date: number;
  preview: string;
  messages: {role: 'user' | 'ai', text: string}[];
}

const OrderProgress = ({ status }: { status: OrderStatus }) => {
  const steps = [
    { label: 'Placed', status: OrderStatus.PENDING, icon: Clock },
    { label: 'Accepted', status: OrderStatus.ACCEPTED, icon: Check },
    { label: 'Packed', status: OrderStatus.READY, icon: Package },
    { label: 'On Way', status: OrderStatus.PICKED_UP, icon: Truck },
    { label: 'Delivered', status: OrderStatus.DELIVERED, icon: Home },
  ];

  const getCurrentStepIndex = () => {
    if (status === OrderStatus.CANCELLED) return -1;
    return steps.findIndex(s => s.status === status);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
         <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
         <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 -z-10 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
         ></div>

         {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = step.icon;
            
            return (
                <div key={idx} className="flex flex-col items-center bg-white px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                        isCompleted ? 'bg-green-100 border-green-500 text-green-600' : 'bg-gray-50 border-gray-300 text-gray-400'
                    }`}>
                        <Icon size={14} />
                    </div>
                    <span className={`text-[10px] mt-1 font-medium ${isCurrent ? 'text-green-700' : 'text-gray-500'}`}>
                        {step.label}
                    </span>
                </div>
            );
         })}
      </div>
      {status === OrderStatus.CANCELLED && (
          <div className="flex items-center justify-center text-red-500 font-bold mt-2 text-sm">
             <AlertTriangle size={14} className="mr-1" />
             <span>Order Cancelled</span>
          </div>
      )}
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, totalAmount, onConfirm }: { isOpen: boolean, onClose: () => void, totalAmount: number, onConfirm: () => void }) => {
    const [method, setMethod] = useState<'UPI' | 'CARD' | 'COD' | 'NET'>('UPI');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Form States
    const [vpa, setVpa] = useState('');
    
    if (!isOpen) return null;

    const handlePay = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            onConfirm();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row h-[500px]">
                {/* Sidebar */}
                <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-100 p-4">
                    <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-4">Payment Methods</h3>
                    <div className="space-y-2">
                        <button onClick={() => setMethod('UPI')} className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition ${method === 'UPI' ? 'bg-white shadow ring-1 ring-saffron-500 text-saffron-700' : 'hover:bg-gray-200 text-gray-700'}`}>
                            <div className="bg-green-100 p-1.5 rounded"><Smartphone size={16} className="text-green-600"/></div>
                            <span className="font-bold text-sm">UPI</span>
                        </button>
                        <button onClick={() => setMethod('CARD')} className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition ${method === 'CARD' ? 'bg-white shadow ring-1 ring-saffron-500 text-saffron-700' : 'hover:bg-gray-200 text-gray-700'}`}>
                             <div className="bg-blue-100 p-1.5 rounded"><CreditCard size={16} className="text-blue-600"/></div>
                            <span className="font-bold text-sm">Credit/Debit Card</span>
                        </button>
                        <button onClick={() => setMethod('NET')} className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition ${method === 'NET' ? 'bg-white shadow ring-1 ring-saffron-500 text-saffron-700' : 'hover:bg-gray-200 text-gray-700'}`}>
                             <div className="bg-purple-100 p-1.5 rounded"><Banknote size={16} className="text-purple-600"/></div>
                            <span className="font-bold text-sm">Net Banking</span>
                        </button>
                        <button onClick={() => setMethod('COD')} className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition ${method === 'COD' ? 'bg-white shadow ring-1 ring-saffron-500 text-saffron-700' : 'hover:bg-gray-200 text-gray-700'}`}>
                             <div className="bg-orange-100 p-1.5 rounded"><Truck size={16} className="text-orange-600"/></div>
                            <span className="font-bold text-sm">Cash on Delivery</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Complete Payment</h2>
                            <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
                        </div>

                        <div className="mb-6 p-4 bg-saffron-50 rounded-lg border border-saffron-100">
                             <div className="flex justify-between items-center">
                                 <span className="text-gray-600">Total Payable Amount</span>
                                 <span className="text-2xl font-bold text-saffron-700">₹{totalAmount}</span>
                             </div>
                        </div>

                        {/* UPI Form */}
                        {method === 'UPI' && (
                            <div className="space-y-4 animate-in fade-in">
                                <p className="text-sm text-gray-600 mb-2">Pay via UPI Apps (Google Pay, PhonePe, Paytm)</p>
                                <div className="flex gap-4 mb-4">
                                     <div className="h-8 w-12 bg-gray-100 rounded border flex items-center justify-center text-[10px] font-bold text-blue-500">GPay</div>
                                     <div className="h-8 w-12 bg-gray-100 rounded border flex items-center justify-center text-[10px] font-bold text-purple-500">Pe</div>
                                     <div className="h-8 w-12 bg-gray-100 rounded border flex items-center justify-center text-[10px] font-bold text-blue-800">Paytm</div>
                                </div>
                                <label className="block text-xs font-bold uppercase text-gray-500">Enter UPI ID</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 9876543210@upi" 
                                    value={vpa}
                                    onChange={(e) => setVpa(e.target.value)}
                                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" 
                                />
                                <p className="text-xs text-green-600 mt-1 flex items-center"><Check size={12} className="mr-1"/> Verified Merchant</p>
                            </div>
                        )}

                        {/* Card Form */}
                        {method === 'CARD' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Card Number</label>
                                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full border p-3 rounded-lg outline-none" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Expiry</label>
                                        <input type="text" placeholder="MM/YY" className="w-full border p-3 rounded-lg outline-none" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">CVV</label>
                                        <input type="password" placeholder="123" className="w-full border p-3 rounded-lg outline-none" />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Net Banking */}
                        {method === 'NET' && (
                             <div className="space-y-4 animate-in fade-in">
                                 <label className="block text-xs font-bold uppercase text-gray-500">Select Bank</label>
                                 <select className="w-full border p-3 rounded-lg outline-none bg-white">
                                     <option>State Bank of India</option>
                                     <option>HDFC Bank</option>
                                     <option>ICICI Bank</option>
                                     <option>Axis Bank</option>
                                 </select>
                             </div>
                        )}

                        {/* COD */}
                        {method === 'COD' && (
                             <div className="p-4 bg-orange-50 text-orange-800 rounded-lg text-sm animate-in fade-in">
                                 <p className="font-bold flex items-center"><Truck size={16} className="mr-2"/> Cash on Delivery</p>
                                 <p className="mt-2">Pay cash to the delivery agent when your order arrives.</p>
                             </div>
                        )}
                    </div>

                    <button 
                        onClick={handlePay}
                        disabled={isProcessing}
                        className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-4 rounded-xl shadow-lg mt-6 flex items-center justify-center transition-all disabled:opacity-70"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="animate-spin mr-2" /> Processing...
                            </>
                        ) : (
                            `Pay ₹${totalAmount}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Detail Modal
const ProductDetailModal = ({ product, isOpen, onClose, onAddToCart, onBuyNow, addToRecentlyViewed }: { product: Product | null, isOpen: boolean, onClose: () => void, onAddToCart: (p: Product, qty: number) => void, onBuyNow: (p: Product, qty: number) => void, addToRecentlyViewed: (id: string) => void }) => {
    const [qty, setQty] = useState(1);
    
    useEffect(() => { 
        if(product) {
            setQty(1); 
            addToRecentlyViewed(product.id);
        }
    }, [product]);

    if (!isOpen || !product) return null;
    const isOutOfStock = product.stock <= 0;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center relative p-8">
                    <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    <button onClick={onClose} className="absolute top-4 left-4 bg-white/50 p-2 rounded-full md:hidden"><X/></button>
                </div>
                <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                            <p className="text-saffron-600 font-bold text-sm flex items-center gap-1"><Store size={14}/> {product.shopName}</p>
                        </div>
                        <button onClick={onClose} className="hidden md:block p-2 hover:bg-gray-100 rounded-full"><X/></button>
                    </div>

                    <div className="mb-6 border-b pb-6">
                        <div className="flex items-center space-x-2 mb-4">
                             <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded uppercase tracking-wide">{product.category}</span>
                             {isOutOfStock ? (
                                 <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-bold">Out of Stock</span>
                             ) : (
                                 <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded font-bold">In Stock ({product.stock})</span>
                             )}
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
                        
                        {/* Delivery & Trust Badges */}
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Truck size={16} className="text-blue-600"/>
                                <span>Get it by <strong>Tomorrow, 7 PM</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Banknote size={16} className="text-blue-600"/>
                                <span>Cash on Delivery Available</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-blue-600"/>
                                <span>Quality Checked</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <RefreshCw size={16} className="text-blue-600"/>
                                <span>Easy Returns</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <span className="text-3xl font-bold text-gray-800">₹{product.price}</span>
                                <span className="text-gray-400 text-sm ml-1">/ {product.unit || 'unit'}</span>
                            </div>
                            <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg border">
                                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-1 hover:bg-gray-200 rounded"><Minus size={16}/></button>
                                <span className="font-bold w-8 text-center">{qty}</span>
                                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} disabled={isOutOfStock} className="p-1 hover:bg-gray-200 rounded"><Plus size={16}/></button>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                             <button 
                                onClick={() => { onAddToCart(product, qty); onClose(); }}
                                disabled={isOutOfStock}
                                className={`flex-1 py-3 rounded-xl font-bold shadow-sm border-2 border-saffron-500 text-saffron-600 hover:bg-saffron-50 transition ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Add to Cart
                            </button>
                            <button 
                                onClick={() => { onBuyNow(product, qty); }}
                                disabled={isOutOfStock}
                                className={`flex-1 py-3 rounded-xl font-bold shadow-lg text-white bg-saffron-600 hover:bg-saffron-700 transition ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                            >
                                {isOutOfStock ? 'Notify Me' : 'Buy Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomerView: React.FC = () => {
  const { products, cart, addToCart, removeFromCart, placeOrder, clearCart, orders, currentUser, reviews, addReview, sendOrderMessage, riderAvailability, updateOrderStatus, headerCategory, toggleFollowShop, reorder, recentlyViewed, addToRecentlyViewed } = useApp();
  
  // --- States ---
  const [activeTab, setActiveTab] = useState<'shop' | 'shops' | 'cart' | 'chat' | 'history'>('shop');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({ min: 0, max: 5000 });
  const [filterByAvailableDelivery, setFilterByAvailableDelivery] = useState(false);
  const [shopRatingFilter, setShopRatingFilter] = useState(0);
  const [minOrderFilter, setMinOrderFilter] = useState(0);

  // Shop Selection
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  // Recommendations
  const [recommendations, setRecommendations] = useState<string[]>([]); // Array of shop names

  // Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Chat / AI States
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<{id: string, name: string} | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Rider Chat Modal State
  const [riderChatOpen, setRiderChatOpen] = useState(false);
  const [activeOrderChat, setActiveOrderChat] = useState<Order | null>(null);
  const [riderMessageInput, setRiderMessageInput] = useState('');

  // Order History Toggle & Filter
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [historyShopFilter, setHistoryShopFilter] = useState('');
  const [historyDeliveryFilter, setHistoryDeliveryFilter] = useState('');

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Derived Data
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const shopkeepers = SAMPLE_USERS.filter(u => u.role === UserRole.SHOPKEEPER);
  const riders = SAMPLE_USERS.filter(u => u.role === UserRole.RIDER);
  const areRidersAvailable = riders.some(r => riderAvailability[r.id] !== false);

  // --- Effects ---
  useEffect(() => {
     if (headerCategory) {
         setSelectedCategory(headerCategory);
         if(headerCategory !== 'All') {
            setActiveTab('shop'); 
         }
     }
  }, [headerCategory]);

  useEffect(() => {
      // Get Recommendations on mount
      const fetchRecs = async () => {
          if(!currentUser) return;
          const pastOrders = orders
            .filter(o => o.customerId === currentUser.id)
            .map(o => o.items.map(i => i.name).join(", "));
          
          if(pastOrders.length > 0) {
              const available = shopkeepers.map(s => s.shopName || '');
              const recs = await getPersonalizedRecommendations(pastOrders, available);
              setRecommendations(recs);
          }
      };
      fetchRecs();
  }, [currentUser, orders]);

  // Load chat sessions
  useEffect(() => {
      const storedSessions = localStorage.getItem('desimart_chat_sessions');
      if (storedSessions) {
          setChatSessions(JSON.parse(storedSessions));
      }
  }, []);

  useEffect(() => {
      localStorage.setItem('desimart_chat_sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
         setIsSearchingAI(true);
         // AI Search Analysis
         const analysis = await analyzeSearchQuery(searchTerm);
         
         if (analysis.category && analysis.category !== 'General') {
             setSelectedCategory(analysis.category);
         }
         
         // Set AI keywords for filtering
         if (analysis.keywords && analysis.keywords.length > 0) {
             setAiKeywords(analysis.keywords);
         } else {
             setAiKeywords([searchTerm]); // Fallback
         }
         setIsSearchingAI(false);
      }
  };
  
  const clearSearch = () => {
      setSearchTerm('');
      setAiKeywords([]);
      setSelectedCategory('All');
  };

  const filteredProducts = products.filter(p => {
    // Basic Keyword Search / Intelligent Search
    let matchesSearch = true;
    if (aiKeywords.length > 0) {
        // Check if ANY keyword is in name, description or category (case-insensitive)
        const text = `${p.name} ${p.description} ${p.category}`.toLowerCase();
        matchesSearch = aiKeywords.some(kw => text.includes(kw.toLowerCase()));
    } else if (searchTerm) {
        // Fallback for real-time typing if Enter not pressed
        matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // Hide inactive
    if (p.isActive === false) matchesSearch = false;
    
    // Category
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory || p.category.includes(selectedCategory);
    
    // Price
    const matchesPrice = p.price >= priceRange.min && p.price <= priceRange.max;
    // Shop
    const matchesShop = selectedShopId ? p.shopId === selectedShopId : true;
    
    // Delivery
    const matchesDelivery = filterByAvailableDelivery ? areRidersAvailable : true;

    return matchesSearch && matchesCategory && matchesPrice && matchesShop && matchesDelivery;
  });

  const filteredShops = shopkeepers.filter(s => {
      const matchesName = (s.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) || s.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRating = (s.shopRating || 0) >= shopRatingFilter;
      const matchesMinOrder = (s.minOrderValue || 0) <= (minOrderFilter || 100000); // If 0/undefined, ignore constraint
      return matchesName && matchesRating && matchesMinOrder;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Order History Filter Logic
  const myOrders = orders.filter(o => o.customerId === currentUser?.id).sort((a,b) => b.createdAt - a.createdAt);
  const filteredMyOrders = myOrders.filter(o => {
      const matchesShop = o.shopName.toLowerCase().includes(historyShopFilter.toLowerCase());
      // Simple text filter for delivery estimate or status
      const matchesTime = historyDeliveryFilter 
        ? (o.status === OrderStatus.PICKED_UP && '30-45 mins'.includes(historyDeliveryFilter)) || o.status.toLowerCase().includes(historyDeliveryFilter.toLowerCase())
        : true;
      return matchesShop && matchesTime;
  });

  const displayedOrders = showAllHistory ? filteredMyOrders : filteredMyOrders.slice(0, 5);

  const getProductRating = (prodId: string) => {
    const prodReviews = reviews.filter(r => r.productId === prodId);
    if (prodReviews.length === 0) return 0;
    const sum = prodReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / prodReviews.length).toFixed(1);
  };

  // --- Handlers ---
  const handleChat = async (inputOverride?: string) => {
    const query = inputOverride || chatInput;
    if (!query.trim()) return;
    
    if(!inputOverride) setChatInput('');
    
    setChatHistory(prev => [...prev, { role: 'user', text: query }]);
    setIsTyping(true);

    const contextData = products.map(p => `${p.name} (₹${p.price})`).join(', ');
    
    // Build user Context
    const viewedNames = recentlyViewed.map(id => products.find(p => p.id === id)?.name).filter(Boolean).join(", ");
    const cartNames = cart.map(c => c.name).join(", ");
    const userContextStr = `Recently Viewed: [${viewedNames}], Cart: [${cartNames}]`;

    const response = await chatWithAssistant(query, contextData, userContextStr);
    
    setIsTyping(false);
    setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
  };

  const clearChat = () => {
      if(chatHistory.length > 0) {
          // Archive
          const newSession: ChatSession = {
              id: `chat_${Date.now()}`,
              date: Date.now(),
              preview: chatHistory[0].text.substring(0, 30) + '...',
              messages: chatHistory
          };
          setChatSessions(prev => [newSession, ...prev]);
      }
      setChatHistory([]);
  };

  const loadSession = (session: ChatSession) => {
      // Archive current if not empty
      if(chatHistory.length > 0) {
           const newSession: ChatSession = {
              id: `chat_${Date.now()}`,
              date: Date.now(),
              preview: chatHistory[0].text.substring(0, 30) + '...',
              messages: chatHistory
          };
          setChatSessions(prev => [newSession, ...prev]);
      }
      setChatHistory(session.messages);
      setShowHistoryPanel(false);
  };

  const openReviewModal = (productId: string, productName: string) => {
    setSelectedProductForReview({ id: productId, name: productName });
    setReviewModalOpen(true);
    setRating(5);
    setReviewComment('');
  };

  const submitReview = () => {
    if (!selectedProductForReview || !currentUser) return;
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      productId: selectedProductForReview.id,
      userId: currentUser.id,
      userName: currentUser.name,
      rating,
      comment: reviewComment,
      timestamp: Date.now()
    };
    addReview(newReview);
    setReviewModalOpen(false);
    alert('Thank you for your review!');
  };

  const openRiderChat = (order: Order) => {
    setActiveOrderChat(order);
    setRiderChatOpen(true);
  };

  const sendRiderMessage = () => {
    if(!activeOrderChat || !riderMessageInput.trim()) return;
    sendOrderMessage(activeOrderChat.id, riderMessageInput);
    setRiderMessageInput('');
  };

  const handleSelectShop = (shopId: string) => {
      setSelectedShopId(shopId);
      setActiveTab('shop');
      setSearchTerm('');
  };

  const handleCancelOrder = (orderId: string) => {
      if (window.confirm("Are you sure you want to cancel this order?")) {
          updateOrderStatus(orderId, OrderStatus.CANCELLED);
      }
  };

  const handlePaymentSuccess = () => {
      placeOrder(cart, cartTotal);
      setShowPaymentModal(false);
      setActiveTab('history');
  };

  const handleAddToCartModal = (p: Product, qty: number) => {
      // Add 'qty' times
      for(let i=0; i<qty; i++) addToCart(p);
  };

  const handleBuyNow = (p: Product, qty: number) => {
      // Add to cart then open payment
      handleAddToCartModal(p, qty);
      setSelectedProduct(null); // Close modal
      setShowPaymentModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200 overflow-x-auto">
        <button 
          onClick={() => { setActiveTab('shop'); setSelectedShopId(null); }} 
          className={`pb-2 px-4 whitespace-nowrap font-medium ${activeTab === 'shop' ? 'text-saffron-600 border-b-2 border-saffron-600' : 'text-gray-500'}`}
        >
          All Products
        </button>
        <button 
          onClick={() => setActiveTab('shops')} 
          className={`pb-2 px-4 whitespace-nowrap font-medium flex items-center space-x-2 ${activeTab === 'shops' ? 'text-saffron-600 border-b-2 border-saffron-600' : 'text-gray-500'}`}
        >
          <Store size={16} />
          <span>Shops</span>
        </button>
        <button 
          onClick={() => setActiveTab('cart')} 
          className={`pb-2 px-4 whitespace-nowrap font-medium flex items-center space-x-2 ${activeTab === 'cart' ? 'text-saffron-600 border-b-2 border-saffron-600' : 'text-gray-500'}`}
        >
          <span>Cart</span>
          {cart.length > 0 && <span className="bg-saffron-500 text-white text-xs px-2 py-0.5 rounded-full">{cart.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`pb-2 px-4 whitespace-nowrap font-medium flex items-center space-x-2 ${activeTab === 'history' ? 'text-saffron-600 border-b-2 border-saffron-600' : 'text-gray-500'}`}
        >
          <span>My Orders</span>
        </button>
        <button 
          onClick={() => setActiveTab('chat')} 
          className={`pb-2 px-4 whitespace-nowrap font-medium flex items-center space-x-2 ${activeTab === 'chat' ? 'text-saffron-600 border-b-2 border-saffron-600' : 'text-gray-500'}`}
        >
          <Sparkles size={16} />
          <span>AI Assistant</span>
        </button>
      </div>

      {activeTab === 'shop' && (
        <>
           {/* Sponsored Ads */}
           <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Sponsored</span>
                        <h3 className="text-2xl font-bold mt-2">Diwali Mega Sale!</h3>
                        <p className="text-sm opacity-90 mt-1">Up to 50% off on Sweets & Dry Fruits.</p>
                        <button className="mt-4 bg-white text-red-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-100">Shop Now</button>
                    </div>
                    <Sparkles className="absolute right-4 top-4 text-white/30 h-24 w-24" />
                </div>
                {/* AI Recommendations Section */}
                {recommendations.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                         <div className="relative z-10">
                            <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex w-fit items-center gap-1"><Sparkles size={10}/> Recommended For You</span>
                            <h3 className="text-lg font-bold mt-2">Based on your taste</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {recommendations.map(r => (
                                    <span key={r} onClick={() => { setSearchTerm(r); }} className="bg-white/20 hover:bg-white/30 cursor-pointer px-3 py-1 rounded-full text-xs border border-white/30 transition">
                                        {r}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
           </div>

          {/* Search & Filter Bar */}
          <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
               {selectedShopId && (
                   <div className="flex items-center space-x-2 bg-saffron-50 text-saffron-700 px-3 py-2 rounded-lg border border-saffron-200">
                       <Store size={16} />
                       <span className="font-bold">{shopkeepers.find(s => s.id === selectedShopId)?.shopName}</span>
                       <button onClick={() => setSelectedShopId(null)}><X size={14} /></button>
                   </div>
               )}

               <div className="flex-1 relative">
                 <input 
                   type="text" 
                   placeholder="Search products... (Try 'snacks for party')" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   onKeyDown={handleSearch}
                   className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-400 focus:outline-none"
                 />
                 <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                 {isSearchingAI ? (
                     <div className="absolute right-3 top-3"><Loader2 size={16} className="animate-spin text-saffron-500" /></div>
                 ) : (
                     searchTerm && <button onClick={clearSearch} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"><X size={16}/></button>
                 )}
               </div>
               
               <div className="flex gap-4 items-center overflow-x-auto">
                  <label className="flex items-center space-x-2 whitespace-nowrap bg-gray-50 px-3 py-2 rounded border cursor-pointer hover:bg-gray-100">
                      <input 
                        type="checkbox" 
                        checked={filterByAvailableDelivery}
                        onChange={(e) => setFilterByAvailableDelivery(e.target.checked)}
                        className="rounded text-saffron-600 focus:ring-saffron-500"
                      />
                      <Zap size={16} className={filterByAvailableDelivery ? 'text-yellow-500' : 'text-gray-400'} />
                      <span className="text-sm font-medium">Express</span>
                  </label>

                  <div className="flex items-center space-x-2">
                     <Filter size={18} className="text-gray-500" />
                     <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border rounded-lg p-2 focus:outline-none focus:border-saffron-500 bg-white"
                     >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                      <input 
                        type="number" 
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                        className="w-16 border rounded p-1"
                        placeholder="Min"
                      />
                      <span className="text-gray-400">-</span>
                      <input 
                        type="number" 
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                        className="w-16 border rounded p-1"
                        placeholder="Max"
                      />
                  </div>
               </div>
            </div>
            {aiKeywords.length > 0 && (
                <div className="mt-2 flex gap-2 items-center text-xs text-gray-500">
                    <Sparkles size={12} className="text-saffron-500"/>
                    <span>Found results for:</span>
                    {aiKeywords.map(k => (
                        <span key={k} className="bg-saffron-50 text-saffron-700 px-2 py-0.5 rounded-full">{k}</span>
                    ))}
                </div>
            )}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const rating = getProductRating(product.id);
              const isOutOfStock = product.stock <= 0;
              return (
              <div 
                key={product.id} 
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${isOutOfStock ? 'opacity-70' : ''}`}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="h-48 overflow-hidden bg-gray-100 relative">
                  <img src={product.imageUrl} alt={product.name} className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale' : ''}`} />
                  <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 text-xs font-bold rounded text-gray-700">
                    {product.shopName}
                  </span>
                  {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <span className="bg-red-600 text-white px-3 py-1 font-bold rounded shadow">Out of Stock</span>
                      </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                    {Number(rating) > 0 && (
                        <div className="flex items-center bg-green-100 px-1.5 py-0.5 rounded text-xs font-bold text-green-800 space-x-1">
                            <span className="flex">{rating}</span>
                            <Star size={12} className="text-green-700 fill-green-700" />
                        </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-saffron-600">₹{product.price}</span>
                        {product.unit && <span className="text-xs text-gray-400">per {product.unit}</span>}
                    </div>
                    {/* Visual Button only - Card Click opens modal */}
                    <div className="bg-gray-100 p-2 rounded-lg text-navy-900">
                        <Plus size={20} />
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
          {filteredProducts.length === 0 && (
             <div className="text-center py-12 text-gray-500">
               No products found in this category.
             </div>
          )}
        </>
      )}

      {activeTab === 'shops' && (
          <div>
              <div className="mb-6 bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4">
                 <div className="flex-1 relative">
                    <input 
                    type="text" 
                    placeholder="Search shops..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-400 focus:outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                 </div>
                 
                 <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Min Rating:</span>
                    <select value={shopRatingFilter} onChange={e => setShopRatingFilter(Number(e.target.value))} className="border rounded p-1 text-sm">
                        <option value="0">Any</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                    </select>
                 </div>
                 <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Min Order &lt;:</span>
                    <input 
                        type="number" 
                        value={minOrderFilter} 
                        onChange={e => setMinOrderFilter(Number(e.target.value))}
                        className="w-20 border rounded p-1 text-sm"
                        placeholder="Amt"
                    />
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShops.map(shop => {
                    const isFollowing = currentUser?.following?.includes(shop.id);
                    return (
                    <div key={shop.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-transparent hover:border-saffron-300 group relative">
                        <div className="flex items-start space-x-4 cursor-pointer" onClick={() => handleSelectShop(shop.id)}>
                            {shop.shopImageUrl ? (
                                <img src={shop.shopImageUrl} alt={shop.shopName} className="w-16 h-16 rounded-full object-cover border-2 border-saffron-100" />
                            ) : (
                                <div className="bg-saffron-100 p-4 rounded-full text-saffron-600 group-hover:bg-saffron-600 group-hover:text-white transition-colors">
                                    <Store size={32} />
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800">{shop.shopName}</h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <UserIcon size={12} className="mr-1" /> 
                                    <span>{shop.name}</span>
                                </div>
                                {shop.shopRating && (
                                    <div className="flex items-center text-xs text-orange-500 font-bold mt-1">
                                        <Star size={10} className="fill-current mr-1"/> {shop.shopRating}
                                    </div>
                                )}
                                {shop.shopDescription && (
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2 italic">
                                        "{shop.shopDescription}"
                                    </p>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleFollowShop(shop.id); }}
                            className={`absolute top-4 right-4 p-2 rounded-full transition ${isFollowing ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400 hover:text-pink-600'}`}
                            title={isFollowing ? "Unfollow" : "Follow for Updates"}
                        >
                            <Heart size={18} className={isFollowing ? 'fill-current' : ''} />
                        </button>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center cursor-pointer" onClick={() => handleSelectShop(shop.id)}>
                            <span className="text-xs text-gray-400">View Products</span>
                            <div className="bg-gray-50 p-1 rounded-full group-hover:bg-saffron-100">
                                <Plus size={16} className="text-gray-400 group-hover:text-saffron-600"/>
                            </div>
                        </div>
                    </div>
                )})}
              </div>
          </div>
      )}

      {activeTab === 'cart' && (
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Cart</h2>
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Your cart is empty.</div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-4">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                    <div>
                      <h4 className="font-bold text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-500">₹{item.price} x {item.quantity}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                  >
                    <Minus size={20} />
                  </button>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-100">
                <span className="text-lg font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-saffron-600">₹{cartTotal}</span>
              </div>
              
              <button 
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-saffron-500 text-white py-4 rounded-xl font-bold text-lg mt-6 hover:bg-saffron-600 transition-colors shadow-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Order History</h2>
            
            {/* History Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 mb-4">
                <input 
                    type="text" 
                    placeholder="Filter by Shop..." 
                    value={historyShopFilter}
                    onChange={e => setHistoryShopFilter(e.target.value)}
                    className="flex-1 border rounded p-2 text-sm"
                />
                <input 
                    type="text" 
                    placeholder="Filter by Delivery Time/Status..." 
                    value={historyDeliveryFilter}
                    onChange={e => setHistoryDeliveryFilter(e.target.value)}
                    className="flex-1 border rounded p-2 text-sm"
                />
            </div>

            {displayedOrders.length === 0 && <p className="text-gray-500">No orders found.</p>}
            {displayedOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-saffron-500">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 border-b pb-4">
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="font-bold text-lg">{order.shopName}</h3>
                                {(order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED) && (
                                    <span className="flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
                            {order.status === OrderStatus.PICKED_UP && (
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2 font-semibold animate-pulse">
                                    <Radio size={10} className="inline mr-1"/> Live Tracking: Rider En Route
                                </span>
                            )}
                        </div>
                        <div className="text-right mt-2 md:mt-0">
                            <p className="text-xl font-bold text-saffron-600">₹{order.totalAmount}</p>
                        </div>
                    </div>

                    {/* Order Details & Tracking Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                             <MapPin size={16} className="text-gray-500" />
                             <span className="text-gray-700">{order.address}</span>
                        </div>
                        {order.riderName && (
                            <div className="flex items-center space-x-2">
                                <UserIcon size={16} className="text-gray-500" />
                                <span className="text-gray-700">Rider: {order.riderName}</span>
                            </div>
                        )}
                        {order.pickedUpAt && (
                             <div className="flex items-center space-x-2">
                                 <Clock size={16} className="text-gray-500" />
                                 <span className="text-gray-700">Picked Up: {new Date(order.pickedUpAt).toLocaleTimeString()}</span>
                             </div>
                        )}
                    </div>

                    {/* Progress Tracker */}
                    <div className="mb-6">
                        <OrderProgress status={order.status} />
                    </div>
                    
                    <div className="space-y-2 mb-4 bg-gray-50 p-4 rounded-lg">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <span>{item.quantity}x {item.name}</span>
                                <div className="flex items-center space-x-3">
                                   <span>₹{item.price * item.quantity}</span>
                                   {order.status === OrderStatus.DELIVERED && (
                                       <button 
                                         onClick={() => openReviewModal(item.productId, item.name)}
                                         className="text-xs text-blue-600 hover:underline"
                                       >
                                           Review
                                       </button>
                                   )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 flex-wrap gap-2">
                         <div className="text-sm text-gray-500 flex-1">
                             {order.riderName ? (
                                 <span className="flex items-center">
                                     <Truck size={14} className="mr-1" />
                                     Delivery by: {order.riderName}
                                 </span>
                             ) : order.status === OrderStatus.READY ? (
                                 <span className="text-saffron-600 font-medium">Looking for a rider...</span>
                             ) : order.status === OrderStatus.CANCELLED ? (
                                 <span className="text-red-500">Order was cancelled.</span>
                             ) : (
                                 <span>Processing...</span>
                             )}
                         </div>
                         
                         {/* Action Buttons */}
                         <div className="flex items-center space-x-2">
                             {(order.status === OrderStatus.DELIVERED) && (
                                 <button 
                                     onClick={() => reorder(order)}
                                     className="flex items-center space-x-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                 >
                                     <RefreshCw size={14} /> <span>Order Again</span>
                                 </button>
                             )}

                             {(order.status === OrderStatus.PENDING || order.status === OrderStatus.ACCEPTED) && (
                                 <button 
                                     onClick={() => handleCancelOrder(order.id)}
                                     className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                                 >
                                     Cancel Order
                                 </button>
                             )}

                             {(order.status === OrderStatus.PICKED_UP || order.status === OrderStatus.ACCEPTED || order.status === OrderStatus.READY) && order.riderId && (
                                 <button 
                                    onClick={() => openRiderChat(order)}
                                    className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
                                 >
                                     <MessageCircle size={18} />
                                     <span>Chat with Rider</span>
                                 </button>
                             )}
                         </div>
                    </div>
                </div>
            ))}
            
            {myOrders.length > 5 && !showAllHistory && (
                <button 
                    onClick={() => setShowAllHistory(true)}
                    className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                >
                    View All Past Orders
                </button>
            )}
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="max-w-4xl mx-auto flex h-[600px] bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Sidebar History */}
            <div className={`md:w-64 w-full md:relative absolute z-10 bg-gray-50 h-full border-r transition-transform duration-300 ${showHistoryPanel ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 flex items-center"><History size={16} className="mr-2"/> History</h3>
                    <button onClick={() => setShowHistoryPanel(false)} className="md:hidden"><X size={16}/></button>
                </div>
                <div className="overflow-y-auto h-full p-2 space-y-2 pb-20">
                     <button 
                        onClick={clearChat} 
                        className="w-full text-left p-3 rounded-lg bg-saffron-100 text-saffron-700 font-bold text-sm flex items-center hover:bg-saffron-200"
                    >
                        <MessageSquare size={16} className="mr-2"/> New Chat
                     </button>
                    {chatSessions.length === 0 && <p className="text-xs text-gray-400 text-center mt-4">No past chats.</p>}
                    {chatSessions.map(session => (
                        <div key={session.id} onClick={() => loadSession(session)} className="p-3 bg-white border rounded-lg cursor-pointer hover:bg-gray-100 shadow-sm">
                            <p className="text-xs font-medium text-gray-800 line-clamp-2">{session.preview}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(session.date).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col relative w-full">
                <div className="bg-saffron-500 p-4 text-white font-bold flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                         <button onClick={() => setShowHistoryPanel(!showHistoryPanel)} className="md:hidden"><History size={20}/></button>
                         <Sparkles size={20} />
                         <span>DesiMart Assistant</span>
                    </div>
                    {chatHistory.length > 0 && (
                        <button onClick={clearChat} className="text-xs bg-saffron-600 hover:bg-saffron-700 px-2 py-1 rounded flex items-center">
                            <Trash2 size={12} className="mr-1"/> Clear
                        </button>
                    )}
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                    {chatHistory.length === 0 && (
                        <div className="text-center mt-10">
                            <div className="bg-saffron-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-saffron-600">
                                <Sparkles size={32} />
                            </div>
                            <p className="text-gray-500 font-medium mb-6">Ask me anything about products, recipes, or DesiMart services!</p>
                            
                            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                                {["Best rice for Biryani?", "Organic vegetables?", "Suggest party snacks", "Latest offers?"].map(prompt => (
                                    <button 
                                        key={prompt}
                                        onClick={() => handleChat(prompt)}
                                        className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm hover:bg-saffron-50 hover:border-saffron-200 transition"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-saffron-100 text-saffron-900 rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                        {msg.text}
                        </div>
                    </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none text-gray-500 text-sm italic">
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t bg-white">
                    <div className="flex space-x-2">
                    <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-saffron-400"
                    />
                    <button 
                        onClick={() => handleChat()}
                        className="bg-saffron-600 text-white p-2 rounded-full hover:bg-saffron-700"
                    >
                        <Send size={20} />
                    </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">Review {selectedProductForReview?.name}</h3>
                      <button onClick={() => setReviewModalOpen(false)}><X size={24} className="text-gray-400"/></button>
                  </div>
                  <div className="flex justify-center space-x-2 mb-6">
                      {[1,2,3,4,5].map(star => (
                          <button key={star} onClick={() => setRating(star)}>
                              <Star 
                                size={32} 
                                className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                          </button>
                      ))}
                  </div>
                  <textarea 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full border p-3 rounded-lg mb-4 focus:ring-2 focus:ring-saffron-400 focus:outline-none"
                    rows={3}
                  ></textarea>
                  <button 
                    onClick={submitReview}
                    className="w-full bg-navy-900 text-white py-3 rounded-lg font-bold hover:bg-opacity-90"
                  >
                      Submit Review
                  </button>
              </div>
          </div>
      )}

      {/* Rider Chat Modal */}
      {riderChatOpen && activeOrderChat && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[500px] flex flex-col">
                  <div className="bg-blue-600 p-4 rounded-t-xl text-white flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                          <MessageCircle size={20} />
                          <span className="font-bold">Chat with {activeOrderChat.riderName}</span>
                      </div>
                      <button onClick={() => setRiderChatOpen(false)}><X size={20}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                      {(!activeOrderChat.chatHistory || activeOrderChat.chatHistory.length === 0) && (
                          <p className="text-center text-gray-400 text-sm mt-4">Start chatting with your rider.</p>
                      )}
                      {activeOrderChat.chatHistory?.map((msg, idx) => {
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
                              value={riderMessageInput}
                              onChange={(e) => setRiderMessageInput(e.target.value)}
                              placeholder="Type a message..."
                              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
                              onKeyDown={(e) => e.key === 'Enter' && sendRiderMessage()}
                          />
                          <button 
                            onClick={sendRiderMessage}
                            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                          >
                              <Send size={18} />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Payment Modal */}
      <PaymentModal 
         isOpen={showPaymentModal} 
         onClose={() => setShowPaymentModal(false)} 
         totalAmount={cartTotal}
         onConfirm={handlePaymentSuccess}
      />
      
      {/* Product Detail Modal */}
      <ProductDetailModal 
         product={selectedProduct}
         isOpen={!!selectedProduct}
         onClose={() => setSelectedProduct(null)}
         onAddToCart={handleAddToCartModal}
         onBuyNow={handleBuyNow}
         addToRecentlyViewed={addToRecentlyViewed}
      />
    </div>
  );
};

export default CustomerView;