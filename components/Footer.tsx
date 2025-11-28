import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 text-sm mt-auto">
      {/* Top Section: Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* About */}
        <div>
          <h3 className="text-gray-500 font-bold uppercase mb-4 text-xs tracking-wider">About</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Contact Us</a></li>
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Careers</a></li>
            <li><a href="#" className="hover:underline">DesiMart Stories</a></li>
            <li><a href="#" className="hover:underline">Press</a></li>
            <li><a href="#" className="hover:underline">Wholesale</a></li>
            <li><a href="#" className="hover:underline">Corporate Information</a></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="text-gray-500 font-bold uppercase mb-4 text-xs tracking-wider">Help</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Payments</a></li>
            <li><a href="#" className="hover:underline">Shipping</a></li>
            <li><a href="#" className="hover:underline">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
            <li><a href="#" className="hover:underline">Report Infringement</a></li>
          </ul>
        </div>

        {/* Policy */}
        <div>
          <h3 className="text-gray-500 font-bold uppercase mb-4 text-xs tracking-wider">Consumer Policy</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:underline">Terms of Use</a></li>
            <li><a href="#" className="hover:underline">Security</a></li>
            <li><a href="#" className="hover:underline">Privacy</a></li>
            <li><a href="#" className="hover:underline">Sitemap</a></li>
            <li><a href="#" className="hover:underline">Grievance Redressal</a></li>
            <li><a href="#" className="hover:underline">EPR Compliance</a></li>
          </ul>
        </div>

        {/* Mail Us / Registered Office */}
        <div className="border-l border-gray-700 pl-0 lg:pl-8 mt-8 lg:mt-0">
          <h3 className="text-gray-500 font-bold uppercase mb-4 text-xs tracking-wider">Mail Us:</h3>
          <p className="mb-4 text-xs leading-5">
            DesiMart Private Limited,<br/>
            Buildings Alyssa, Begonia &<br/>
            Clove Embassy Tech Village,<br/>
            Outer Ring Road, Devarabeesanahalli Village,<br/>
            Bengaluru, 560103,<br/>
            Karnataka, India
          </p>

          <h3 className="text-gray-500 font-bold uppercase mb-4 text-xs tracking-wider mt-6">Social:</h3>
          <div className="flex space-x-4">
             <a href="#" className="hover:text-white"><Facebook size={20}/></a>
             <a href="#" className="hover:text-white"><Twitter size={20}/></a>
             <a href="#" className="hover:text-white"><Instagram size={20}/></a>
             <a href="#" className="hover:text-white"><Youtube size={20}/></a>
          </div>
        </div>
      </div>

      {/* Middle Section: Stats/Safety */}
      <div className="border-t border-gray-800 py-6">
         <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center md:justify-between items-center text-xs gap-4">
            <div className="flex items-center gap-2">
                <div className="bg-saffron-500 text-white p-1 rounded-full"><MapPin size={12}/></div>
                <span>Track Orders</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="bg-saffron-500 text-white p-1 rounded-full"><Phone size={12}/></div>
                <span>24x7 Customer Support</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="bg-saffron-500 text-white p-1 rounded-full"><Mail size={12}/></div>
                <span>help@desimart.in</span>
            </div>
         </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-gray-950 py-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
             <div className="flex items-center text-white font-bold text-lg italic">
                <span className="text-saffron-500">Desi</span>Mart
             </div>
             <span className="text-gray-500">© 2024 DesiMart. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex gap-2">
                 {/* Simulated Payment Icons */}
                 <div className="bg-white px-2 py-1 rounded text-blue-800 font-bold text-[10px] tracking-tighter italic border">VISA</div>
                 <div className="bg-white px-2 py-1 rounded text-red-600 font-bold text-[10px] tracking-tighter italic border">MasterCard</div>
                 <div className="bg-white px-2 py-1 rounded text-orange-600 font-bold text-[10px] tracking-tighter border">RuPay</div>
                 <div className="bg-white px-2 py-1 rounded text-green-600 font-bold text-[10px] tracking-tighter border">UPI</div>
             </div>
             <span className="text-gray-500 text-xs">Made with ❤️ in India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
