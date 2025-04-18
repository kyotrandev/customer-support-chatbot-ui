"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";
import { signOut } from "next-auth/react";
import { User, LogOut } from "lucide-react";

type AvatarDropdownProps = {
  image: string;
  name: string;
};

const AvatarDropdown = ({ image, name }: AvatarDropdownProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle profile navigation
  const handleProfileClick = () => {
    router.push("/private/profile");
    setIsDropdownOpen(false);
  };

  // Handle logout
  const handleLogoutClick = async () => {
    logout();
    signOut();
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-indigo-500/50 overflow-hidden ring-offset-2 ring-offset-black focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      >
        <Image
          src={image}
          alt={name}
          width={40}
          height={40}
          className="object-cover"
        />
      </button>
      
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg z-10 overflow-hidden">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-medium text-white">{name}</p>
          </div>
          
          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={handleProfileClick}
              className="flex items-center w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 transition-colors"
            >
              <User className="h-4 w-4 mr-2 text-indigo-300" />
              Profile
            </button>
            <button
              onClick={handleLogoutClick}
              className="flex items-center w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2 text-indigo-300" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarDropdown;