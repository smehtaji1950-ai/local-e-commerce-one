export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SHOPKEEPER = 'SHOPKEEPER',
  RIDER = 'RIDER',
  ADMIN = 'ADMIN'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  shopName?: string; // For shopkeepers
  shopDescription?: string; // For shopkeepers
  shopImageUrl?: string; // For shopkeepers
  shopRating?: number; // 1-5
  minOrderValue?: number; // Minimum order amount
  isSuspended?: boolean;
  following?: string[]; // Array of shopIds this user follows
  riderRating?: number; // For riders
  coordinates?: Coordinates; // For map
}

export interface Product {
  id: string;
  shopId: string;
  shopName: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  unit?: string; // e.g., 'kg', 'L', 'pkt'
  isActive?: boolean; // For moderation
}

export enum OrderStatus {
  PENDING = 'PENDING',        // Customer placed order
  ACCEPTED = 'ACCEPTED',      // Shopkeeper accepted
  READY = 'READY',            // Shopkeeper packed it
  PICKED_UP = 'PICKED_UP',    // Rider picked it up
  DELIVERED = 'DELIVERED',    // Rider delivered
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ChatMessage {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  shopId: string;
  shopName: string;
  riderId?: string;
  riderName?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: number;
  address: string;
  chatHistory: ChatMessage[]; // Chat between customer and rider
  pickedUpAt?: number;
  deliveredAt?: number;
  deliveryFee?: number;
  platformFee?: number; // Admin income
  taxes?: number;
  pickupCoordinates?: Coordinates;
  deliveryCoordinates?: Coordinates;
}

export interface CartItem extends OrderItem {
  imageUrl: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  timestamp: number;
  type: 'ORDER' | 'SYSTEM';
}

export interface RiderExperience {
  id: string;
  riderId: string;
  orderId: string;
  rating: number; // 1-5
  comment?: string;
  timestamp: number;
}