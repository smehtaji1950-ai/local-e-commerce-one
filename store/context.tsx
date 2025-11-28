import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Product, Order, UserRole, CartItem, OrderStatus, Review, Notification, ChatMessage, RiderExperience } from '../types';
import { SAMPLE_USERS, INITIAL_PRODUCTS } from '../constants';

interface AppContextType {
  currentUser: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  toggleUserSuspension: (userId: string) => void;
  
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  toggleProductStatus: (productId: string) => void;

  orders: Order[];
  placeOrder: (cart: CartItem[], total: number) => void;
  reorder: (order: Order) => void; 
  updateOrderStatus: (orderId: string, status: OrderStatus, riderId?: string) => void;
  
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  reviews: Review[];
  addReview: (review: Review) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  sendOrderMessage: (orderId: string, text: string) => void;
  
  riderAvailability: Record<string, boolean>;
  toggleRiderAvailability: (riderId: string) => void;
  
  headerCategory: string;
  setHeaderCategory: (category: string) => void;

  toggleFollowShop: (shopId: string) => void;
  
  riderExperiences: RiderExperience[];
  addRiderExperience: (exp: RiderExperience) => void;

  recentlyViewed: string[]; // List of Product IDs
  addToRecentlyViewed: (productId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(SAMPLE_USERS); // Manage all users state for moderation
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [riderAvailability, setRiderAvailability] = useState<Record<string, boolean>>({});
  const [riderExperiences, setRiderExperiences] = useState<RiderExperience[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  
  // Header Filter State
  const [headerCategory, setHeaderCategory] = useState<string>('All');

  // --- Effects ---
  useEffect(() => {
    const storedOrders = localStorage.getItem('desimart_orders');
    const storedProducts = localStorage.getItem('desimart_products');
    const storedReviews = localStorage.getItem('desimart_reviews');
    const storedNotifications = localStorage.getItem('desimart_notifications');
    const storedAvailability = localStorage.getItem('desimart_availability');
    const storedUsers = localStorage.getItem('desimart_users');
    const storedExperiences = localStorage.getItem('desimart_rider_exp');
    const storedRecentlyViewed = localStorage.getItem('desimart_recently_viewed');
    
    if (storedOrders) setOrders(JSON.parse(storedOrders));
    if (storedProducts) setProducts(JSON.parse(storedProducts));
    if (storedReviews) setReviews(JSON.parse(storedReviews));
    if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
    if (storedAvailability) setRiderAvailability(JSON.parse(storedAvailability));
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    else setUsers(SAMPLE_USERS);
    if (storedExperiences) setRiderExperiences(JSON.parse(storedExperiences));
    if (storedRecentlyViewed) setRecentlyViewed(JSON.parse(storedRecentlyViewed));

    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
  }, []);

  useEffect(() => { localStorage.setItem('desimart_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('desimart_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('desimart_reviews', JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { localStorage.setItem('desimart_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('desimart_availability', JSON.stringify(riderAvailability)); }, [riderAvailability]);
  useEffect(() => { localStorage.setItem('desimart_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('desimart_rider_exp', JSON.stringify(riderExperiences)); }, [riderExperiences]);
  useEffect(() => { localStorage.setItem('desimart_recently_viewed', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);

  // --- Helper for Browser Notifications ---
  const sendBrowserNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  // --- Actions ---

  const login = (role: UserRole) => {
    // Find in the managed users array to respect persistence/updates
    const user = users.find(u => u.role === role && !u.isSuspended);
    if (user) {
         setCurrentUser(user);
    } else {
         const suspended = users.find(u => u.role === role && u.isSuspended);
         if(suspended) alert("This account has been suspended.");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
  };

  const updateUser = (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
  };

  const toggleUserSuspension = (userId: string) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isSuspended: !u.isSuspended } : u));
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
    
    // Notify followers
    const followers = users.filter(u => u.following?.includes(product.shopId));
    const newNotifs: Notification[] = followers.map(f => ({
        id: `notif_prod_${Date.now()}_${f.id}`,
        userId: f.id,
        message: `${product.shopName} added a new product: ${product.name}`,
        isRead: false,
        timestamp: Date.now(),
        type: 'SYSTEM'
    }));

    if (newNotifs.length > 0) {
        setNotifications(prev => [...newNotifs, ...prev]);
        // Simulate browser notification
        if (currentUser?.following?.includes(product.shopId)) {
            sendBrowserNotification("New Product Alert", `${product.shopName} added ${product.name}`);
        }
    }
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const toggleProductStatus = (productId: string) => {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, isActive: !p.isActive } : p));
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1,
        imageUrl: product.imageUrl 
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const addReview = (review: Review) => {
    setReviews(prev => [...prev, review]);
  };
  
  const addRiderExperience = (exp: RiderExperience) => {
      setRiderExperiences(prev => [...prev, exp]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const toggleRiderAvailability = (riderId: string) => {
    setRiderAvailability(prev => ({
      ...prev,
      [riderId]: !prev[riderId]
    }));
  };
  
  const toggleFollowShop = (shopId: string) => {
      if (!currentUser) return;
      const currentFollowing = currentUser.following || [];
      const isFollowing = currentFollowing.includes(shopId);
      
      let newFollowing;
      if (isFollowing) {
          newFollowing = currentFollowing.filter(id => id !== shopId);
      } else {
          newFollowing = [...currentFollowing, shopId];
      }
      
      updateUser({ ...currentUser, following: newFollowing });
  };

  const addToRecentlyViewed = (productId: string) => {
      setRecentlyViewed(prev => {
          const filtered = prev.filter(id => id !== productId);
          return [productId, ...filtered].slice(0, 5); // Keep last 5 unique
      });
  };

  const sendOrderMessage = (orderId: string, text: string) => {
    if (!currentUser) return;
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const newMessage: ChatMessage = {
          senderId: currentUser.id,
          senderName: currentUser.name,
          text,
          timestamp: Date.now()
        };
        return { 
          ...order, 
          chatHistory: [...(order.chatHistory || []), newMessage] 
        };
      }
      return order;
    }));
  };

  const placeOrder = (cartItems: CartItem[], total: number) => {
    if (!currentUser) return;
    
    const itemsByShop: Record<string, { shopName: string, items: CartItem[], shopId: string }> = {};
    
    cartItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        if (!itemsByShop[product.shopId]) {
          itemsByShop[product.shopId] = { shopName: product.shopName, items: [], shopId: product.shopId };
        }
        itemsByShop[product.shopId].items.push(item);
      }
    });

    const newOrders: Order[] = [];
    const newNotifications: Notification[] = [];

    Object.keys(itemsByShop).forEach(shopId => {
        const group = itemsByShop[shopId];
        const subTotal = group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Fee Calculation
        const deliveryFee = 40;
        const taxes = Math.round(subTotal * 0.05);
        const platformFee = Math.round(subTotal * 0.10); // Admin revenue
        const finalTotal = subTotal + deliveryFee + taxes;

        // Get Coordinates
        const shop = users.find(u => u.id === shopId);
        
        const orderId = `ord_${Date.now()}_${shopId}`;
        newOrders.push({
            id: orderId,
            customerId: currentUser.id,
            customerName: currentUser.name,
            shopId: shopId,
            shopName: group.shopName,
            items: group.items,
            totalAmount: finalTotal,
            deliveryFee,
            taxes,
            platformFee,
            status: OrderStatus.PENDING,
            createdAt: Date.now(),
            address: "123, MG Road, Bangalore, India",
            chatHistory: [],
            pickupCoordinates: shop?.coordinates || { lat: 12.9352, lng: 77.6245 }, // Default to mock shop location
            deliveryCoordinates: currentUser.coordinates || { lat: 12.9716, lng: 77.5946 } // Default to mock cust location
        });

        // Add Notification for Shopkeeper
        const shopkeeper = users.find(u => u.role === UserRole.SHOPKEEPER && u.id === shopId); 
        
        if (shopkeeper) {
          const msg = `New Order from ${currentUser.name} for ₹${finalTotal}`;
          newNotifications.push({
            id: `notif_${Date.now()}_${shopId}`,
            userId: shopkeeper.id,
            message: msg,
            isRead: false,
            timestamp: Date.now(),
            type: 'ORDER'
          });
        }
    });

    setOrders(prev => [...newOrders, ...prev]);
    setNotifications(prev => [...newNotifications, ...prev]);
    clearCart();
  };

  const reorder = (order: Order) => {
      order.items.forEach(item => {
           // We need the original product to get imageUrl and check current stock
           const originalProduct = products.find(p => p.id === item.productId);
           if (originalProduct) {
               // Add directly to cart 'quantity' times
               for(let i=0; i<item.quantity; i++) {
                   addToCart(originalProduct);
               }
           }
      });
      alert("Items added to cart!");
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, specificRiderId?: string) => {
    let assignedRiderId = specificRiderId;
    let assignedRiderName: string | undefined;

    // --- Automatic Rider Assignment Logic ---
    if (status === OrderStatus.READY && !assignedRiderId) {
        const allRiders = users.filter(u => u.role === UserRole.RIDER);
        const onlineRiders = allRiders.filter(r => riderAvailability[r.id] !== false);

        if (onlineRiders.length > 0) {
            const ridersWithLoad = onlineRiders.map(rider => {
                const load = orders.filter(o => o.riderId === rider.id && o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED).length;
                return { rider, load };
            });
            ridersWithLoad.sort((a, b) => a.load - b.load);
            const bestRider = ridersWithLoad[0].rider;
            assignedRiderId = bestRider.id;
            assignedRiderName = bestRider.name;
        }
    }
    
    if (assignedRiderId && !assignedRiderName) {
         assignedRiderName = users.find(u => u.id === assignedRiderId)?.name;
    }

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updates: Partial<Order> = { status };
        if (assignedRiderId) updates.riderId = assignedRiderId;
        if (assignedRiderName) updates.riderName = assignedRiderName;
        
        if (status === OrderStatus.PICKED_UP) updates.pickedUpAt = Date.now();
        if (status === OrderStatus.DELIVERED) updates.deliveredAt = Date.now();

        return { ...order, ...updates };
      }
      return order;
    }));

    // --- Notifications ---
    const targetOrder = orders.find(o => o.id === orderId);
    
    if (targetOrder) {
        const messageText = `Your order from ${targetOrder.shopName} is now ${status}.`;

        const custNotif: Notification = {
            id: `notif_cust_${Date.now()}`,
            userId: targetOrder.customerId,
            message: messageText,
            isRead: false,
            timestamp: Date.now(),
            type: 'ORDER'
        };

        if (currentUser?.id === targetOrder.customerId) {
            sendBrowserNotification("Order Update", messageText);
        }
        
        let riderNotif: Notification | null = null;
        if (status === OrderStatus.READY && assignedRiderId) {
            const riderMsg = `New Delivery Assigned! Pickup from ${targetOrder.shopName}.`;
            riderNotif = {
                id: `notif_rider_${Date.now()}`,
                userId: assignedRiderId,
                message: riderMsg,
                isRead: false,
                timestamp: Date.now(),
                type: 'ORDER'
            };
            if (currentUser?.id === assignedRiderId) {
                sendBrowserNotification("New Delivery", riderMsg);
            }
        }

        let shopNotif: Notification | null = null;
        if (status === OrderStatus.CANCELLED) {
             const cancelMsg = `Order #${targetOrder.id.slice(-6)} was cancelled by the customer.`;
             shopNotif = {
                id: `notif_shop_cancel_${Date.now()}`,
                userId: targetOrder.shopId,
                message: cancelMsg,
                isRead: false,
                timestamp: Date.now(),
                type: 'ORDER'
            };
            if (currentUser?.id === targetOrder.shopId) {
                sendBrowserNotification("Order Cancelled", cancelMsg);
            }
        }
        
        setNotifications(prev => {
            const arr = [custNotif, ...prev];
            if (riderNotif) arr.unshift(riderNotif);
            if (shopNotif) arr.unshift(shopNotif);
            return arr;
        });
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, logout, updateUser, toggleUserSuspension,
      products, addProduct, updateProduct, toggleProductStatus,
      orders, placeOrder, reorder, updateOrderStatus,
      cart, addToCart, removeFromCart, clearCart,
      reviews, addReview, notifications, markNotificationRead, sendOrderMessage,
      riderAvailability, toggleRiderAvailability,
      headerCategory, setHeaderCategory,
      toggleFollowShop,
      riderExperiences, addRiderExperience,
      recentlyViewed, addToRecentlyViewed
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};