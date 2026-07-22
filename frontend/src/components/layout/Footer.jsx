import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("You're subscribed! Watch your inbox for offers.");
    setEmail('');
  };

  return (
    <footer className="bg-ink text-cream/80 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Newsletter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-12 border-b border-cream/10">
          <div>
            <h3 className="font-display text-2xl text-cream mb-1">Stay in the loop</h3>
            <p className="text-sm text-cream/50">Early access to drops, sales, and restocks. No spam.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/40" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-full bg-cream/5 border border-cream/15 text-cream text-sm
                  placeholder:text-cream/30 focus:outline-none focus:border-amber transition-colors"
              />
            </div>
            <button type="submit" className="bg-amber text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-amber-dark transition-colors flex-shrink-0">
              Subscribe
            </button>
          </form>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          <div>
            <h4 className="font-display text-lg italic text-cream mb-4">ShopNest</h4>
            <p className="text-sm text-cream/50 leading-relaxed">
              Thoughtfully curated goods, delivered with care. Est. 2026.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-cream/5 flex items-center justify-center hover:bg-amber transition-colors"><FiInstagram size={14} /></a>
              <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-full bg-cream/5 flex items-center justify-center hover:bg-amber transition-colors"><FiTwitter size={14} /></a>
              <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-cream/5 flex items-center justify-center hover:bg-amber transition-colors"><FiFacebook size={14} /></a>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-cream/40 mb-4">Shop</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/products" className="hover:text-cream transition-colors">All Products</Link></li>
              <li><Link to="/categories" className="hover:text-cream transition-colors">Categories</Link></li>
              <li><Link to="/products?sort=priceLowToHigh" className="hover:text-cream transition-colors">Today's Deals</Link></li>
              <li><Link to="/wishlist" className="hover:text-cream transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-cream/40 mb-4">Support</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/contact" className="hover:text-cream transition-colors">Contact Us</Link></li>
              <li><Link to="/orders/track" className="hover:text-cream transition-colors">Track Order</Link></li>
              <li><Link to="/returns" className="hover:text-cream transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/faq" className="hover:text-cream transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-cream/40 mb-4">Company</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-cream transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-cream transition-colors">Careers</Link></li>
              <li><Link to="/privacy" className="hover:text-cream transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-cream transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-cream/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-cream/40">
          <p>&copy; {new Date().getFullYear()} ShopNest. All rights reserved.</p>
          <p>Built with React, Node.js & MongoDB</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
