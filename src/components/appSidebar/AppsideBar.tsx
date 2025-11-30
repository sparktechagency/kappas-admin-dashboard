"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Bell,
  ChevronDown,
  FileText,
  Grid3x3,
  Lock,
  LogOut,
  Settings,
  Shield,
  ShoppingBag,
  User,
  Users,
  Wallet,
} from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { removeToken } from '../../utils/storage';

type SidebarSubItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
};

type SidebarItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SidebarSubItem[];
};

const sidebars: SidebarItem[] = [
  { name: "Overview", path: "/", icon: Grid3x3 },
  { name: "Vendor", path: "/vendor", icon: ShoppingBag },
  { name: "User", path: "/user", icon: User },
  { name: "Category", path: "/category", icon: Users },
  { name: "Sub Category", path: "/subCategory", icon: Users },
  { name: "Brand", path: "/brand", icon: Users },
  // { name: "Slider", path: "/slider", icon: Users },
  { name: "Faq", path: "/faq", icon: Users },
  { name: "Transaction", path: "/transaction", icon: Wallet },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
    subItems: [
      { name: "Change Password", path: "/settings/change-password", icon: Lock },
      { name: "Admin", path: "/settings/admin", icon: Shield },
    ]
  },
  {
    name: "CMS",
    path: "/cms",
    icon: FileText,
    subItems: [
      { name: "Terms and Conditions", path: "/cms/terms-condition", icon: Shield },
      { name: "Privacy Policy", path: "/cms/privacy-policy", icon: Shield },
    ]
  },
  { name: "Push Notification", path: "/push-notification", icon: Bell },
];

export default function MainlandSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname === path || pathname.startsWith(path + "/");
  };

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isExpanded = (itemName: string) => expandedItems.includes(itemName);


  const handleLogout = () => {
    removeToken();
  }

  return (
    <Sidebar className="border-none">
      <SidebarContent className="bg-[#2d1b2e] flex flex-col h-screen">
        {/* Logo Section */}
        <div className="flex items-center justify-start py-6 px-6">
          <div className="flex items-center gap-2">
            <Image
              src={'/icons/logo.png'}
              width={300}
              height={10}
              className='w-full h-10`'
              alt='The Canuck Mall'
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <SidebarGroup className="flex-1 mt-4">
          <SidebarGroupContent className="px-0">
            <SidebarMenu className="space-y-0">
              {sidebars.map((item, index) => (
                <React.Fragment key={`${item.name}-${index}`}>
                  <SidebarMenuItem className="px-0">
                    {item.subItems ? (
                      <SidebarMenuButton
                        onClick={() => toggleExpand(item.name)}
                        className={`h-12 px-6 rounded-none transition-all duration-200 ${isActive(item.path)
                          ? "bg-[#AF1500] text-white hover:bg-[#AF1500] hover:text-white border-l-4 border-[#ff5722]"
                          : "text-gray-300 hover:bg-[#3d2a3e] hover:text-white border-l-4 border-transparent"
                          }`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span className="text-sm font-normal flex-1">{item.name}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${isExpanded(item.name) ? "rotate-180" : ""
                              }`}
                          />
                        </div>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        className={`h-12 px-6 rounded-none transition-all duration-200 ${isActive(item.path)
                          ? "bg-[#AF1500] text-white hover:bg-[#AF1500] hover:text-white border-l-4 border-[#ff5722]"
                          : "text-gray-300 hover:bg-[#3d2a3e] hover:text-white border-l-4 border-transparent"
                          }`}
                      >
                        <Link href={item.path} className="flex items-center gap-3 w-full">
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span className="text-sm font-normal">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>

                  {/* Submenu Items */}
                  {item.subItems && isExpanded(item.name) && (
                    <SidebarMenuSub className="mx-0 px-0 border-l-0">
                      {item.subItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.name} className="px-0">
                          <SidebarMenuSubButton
                            asChild
                            className={`h-12 px-6 pl-12 rounded-none transition-all duration-200 ${isActive(subItem.path)
                              ? "bg-[#4a2d3e] text-white hover:bg-[#4a2d3e] border-l-4 border-[#ff5722]"
                              : "bg-[#3d2535] text-white hover:bg-[#4a2d3e] hover:text-white border-l-4 border-transparent"
                              }`}
                          >
                            <Link href={subItem.path} className="flex items-center gap-3 w-full text-white">
                              <subItem.icon className="h-4 w-4 flex-shrink-0 side" />
                              <span className="text-sm font-normal">{subItem.name}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button */}
        <div className="px-0 pb-6">
          <SidebarMenuButton
            onClick={handleLogout}
            asChild
            className="h-12 px-6 rounded-none text-gray-300 hover:bg-[#3d2a3e] hover:text-white transition-all duration-200 border-l-4 border-transparent"
          >
            <Link href="/auth/login" className="flex items-center gap-3 w-full">
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-normal">Logout</span>
            </Link>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}