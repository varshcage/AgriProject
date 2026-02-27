import { Bell, User } from 'lucide-react';

interface UserData {
  fullName: string;
  email: string;
  institution?: string;
  major?: string;
}

interface HeaderProps {
  user?: UserData | null;
}

export default function Header({ user }: HeaderProps) {
  const userName = user?.fullName || 'Guest';
  const userRole = user?.major || user?.institution || 'Agriculture Student';
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-soft border-b border-green-100 sticky top-0 z-30">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Branding */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <img 
                src="../Assets/agw.png" 
                alt="AgriSmart Logo" 
                className="h-16 w-auto"
              />
              <div className="hidden lg:block">
                <h1 className="text-xl font-bold bg-gradient-agri bg-clip-text text-transparent">
                  AgriSmart
                </h1>
                <p className="text-xs text-gray-600">Empowering Future Farmers</p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2.5 text-gray-600 hover:bg-green-50 rounded-xl transition-all duration-300 hover:scale-105 group">
              <Bell className="w-5 h-5 group-hover:text-green-600 transition-colors" />
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-green-600">{userRole}</p>
              </div>
              <div className="w-11 h-11 bg-gradient-agri rounded-full flex items-center justify-center text-white font-semibold shadow-agri hover:scale-105 transition-transform cursor-pointer">
                {user ? (
                  <span className="text-sm">{getInitials(userName)}</span>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
