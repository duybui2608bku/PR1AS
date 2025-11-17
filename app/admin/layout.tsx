"use client";

import { useEffect, useState, useCallback } from "react";
import { Layout, Menu, Button, Avatar, Dropdown, Space } from "antd";
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { MenuProps } from "antd";
import "./styles.css";

const { Header, Sider, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const menuItems: MenuItem[] = [
  getItem("Dashboard", "/admin", <DashboardOutlined />),
  getItem("SEO Settings", "/admin/seo", <GlobalOutlined />),
  getItem("Content Management", "content", <FileTextOutlined />, [
    getItem("Pages", "/admin/content/pages", <FileTextOutlined />),
    getItem("Categories", "/admin/content/categories", <TagsOutlined />),
  ]),
  getItem("User Management", "/admin/users", <TeamOutlined />),
  getItem("Settings", "/admin/settings", <SettingOutlined />),
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{
    email?: string;
    user_metadata?: { role?: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getSupabaseClient();

  const checkAuth = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Check if user is admin (demo check - will be replaced with proper role check)
      const isAdmin =
        user.email === "admin@pr1as.com" ||
        user.user_metadata?.role === "admin";

      if (!isAdmin) {
        router.push("/");
        return;
      }

      setUser(user);
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => router.push("/admin/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  const handleMenuClick = (e: { key: string }) => {
    router.push(e.key);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: collapsed ? 16 : 20,
            fontWeight: "bold",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {collapsed ? "PR1" : "PR1AS Admin"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout
        style={{ marginLeft: collapsed ? 80 : 200, transition: "all 0.2s" }}
      >
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: "pointer" }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.email}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
