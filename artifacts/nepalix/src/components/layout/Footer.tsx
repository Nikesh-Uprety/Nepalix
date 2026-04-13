import { Link } from "wouter";
import { Twitter, Linkedin, Github, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[rgba(148,163,184,0.18)] bg-[#070B14] pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Logo & Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-5">
              <img
                src="/nepalix-logo.png"
                alt="Nepalix"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              The definitive commerce operating system built for Nepal's rapidly digitizing economy. Enterprise-ready, ambitious, and global standard.
            </p>
            <div className="flex items-center gap-4 text-gray-400">
              <a href="#" className="hover:text-primary transition-colors"><Twitter size={20} /></a>
              <a href="#" className="hover:text-primary transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="hover:text-primary transition-colors"><Github size={20} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Product</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/product#store" className="text-gray-400 hover:text-white transition-colors">Online Store</Link></li>
              <li><Link href="/product#pos" className="text-gray-400 hover:text-white transition-colors">Point of Sale</Link></li>
              <li><Link href="/product#inventory" className="text-gray-400 hover:text-white transition-colors">Inventory</Link></li>
              <li><Link href="/product#payments" className="text-gray-400 hover:text-white transition-colors">Payments</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Resources</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/plugins" className="text-gray-400 hover:text-white transition-colors">Plugins & APIs</Link></li>
              <li><Link href="/case-studies" className="text-gray-400 hover:text-white transition-colors">Case Studies</Link></li>
              <li><Link href="/compare" className="text-gray-400 hover:text-white transition-colors">Compare</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Company</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li className="flex items-start gap-2 text-gray-400 mt-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span className="text-sm">12th Floor, Trade Tower<br />Thapathali, Kathmandu</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[rgba(148,163,184,0.18)] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Nepalix Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
