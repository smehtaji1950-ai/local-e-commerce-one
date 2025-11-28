import { Product, User, UserRole } from './types';

export const SAMPLE_USERS: User[] = [
  { id: 'u1', name: 'Rahul Sharma', role: UserRole.CUSTOMER, coordinates: { lat: 12.9716, lng: 77.5946 } },
  { id: 'u2', name: 'Priya Patel', role: UserRole.CUSTOMER, coordinates: { lat: 12.9279, lng: 77.6271 } },
  { 
    id: 's1', 
    name: 'Amit Gupta', 
    role: UserRole.SHOPKEEPER, 
    shopName: 'Gupta Kirana Store',
    shopDescription: 'Your trusted neighborhood grocery store serving fresh staples since 1995. We specialize in high-quality rice and pulses.',
    coordinates: { lat: 12.9352, lng: 77.6245 }
  },
  { 
    id: 's2', 
    name: 'Sneha Reddy', 
    role: UserRole.SHOPKEEPER, 
    shopName: 'Reddy Organics',
    shopDescription: 'Certified organic spices and farm-fresh produce directly from local farmers. No pesticides, just pure flavor.',
    coordinates: { lat: 12.9784, lng: 77.6408 }
  },
  { id: 'r1', name: 'Vikram Singh', role: UserRole.RIDER, coordinates: { lat: 12.9500, lng: 77.6000 } },
  { id: 'r2', name: 'Mohammed Ali', role: UserRole.RIDER, coordinates: { lat: 12.9600, lng: 77.6100 } },
  { id: 'a1', name: 'Admin User', role: UserRole.ADMIN },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    shopId: 's1',
    shopName: 'Gupta Kirana Store',
    name: 'Basmati Rice (India Gate) - 5kg',
    description: 'Premium aged aromatic Basmati rice perfect for Biryani.',
    price: 650,
    category: 'Groceries',
    imageUrl: 'https://picsum.photos/300/300?random=1',
    stock: 50
  },
  {
    id: 'p2',
    shopId: 's1',
    shopName: 'Gupta Kirana Store',
    name: 'Tata Tea Gold - 500g',
    description: 'Rich and aromatic tea blend for the perfect Chai.',
    price: 320,
    category: 'Beverages',
    imageUrl: 'https://picsum.photos/300/300?random=2',
    stock: 100
  },
  {
    id: 'p3',
    shopId: 's2',
    shopName: 'Reddy Organics',
    name: 'Organic Turmeric Powder',
    description: '100% pure Haldi with high curcumin content.',
    price: 180,
    category: 'Spices',
    imageUrl: 'https://picsum.photos/300/300?random=3',
    stock: 30
  },
  {
    id: 'p4',
    shopId: 's2',
    shopName: 'Reddy Organics',
    name: 'Kashmiri Saffron (1g)',
    description: 'Authentic Kesar strands for sweets and milk.',
    price: 450,
    category: 'Spices',
    imageUrl: 'https://picsum.photos/300/300?random=4',
    stock: 10
  }
];