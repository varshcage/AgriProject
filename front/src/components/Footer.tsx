import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, Sprout } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AgriSmart</span>
            </div>
            <p className="text-sm mb-4">
              Empowering agriculture students with AI-powered tools and modern farming knowledge for a sustainable future.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-400 transition">About Us</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Our Mission</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Courses</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Blog</a></li>
              <li><a href="#" className="hover:text-green-400 transition">FAQ</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-400 transition">Documentation</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Tutorials</a></li>
              <li><a href="#" className="hover:text-green-400 transition">API Reference</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Community Forum</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Support Center</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <Mail className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                <span>support@agrismart.edu</span>
              </li>
              <li className="flex items-start">
                <Phone className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                <span>123 Agriculture Ave, Farm City, FC 12345</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; 2025 AgriSmart. All rights reserved.</p>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <a href="#" className="hover:text-green-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-green-400 transition">Terms of Service</a>
              <a href="#" className="hover:text-green-400 transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
