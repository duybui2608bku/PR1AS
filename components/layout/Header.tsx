"use client";

import { useState, useEffect } from "react";
import { Layout, Button, Avatar, Drawer } from "antd";
import { UserOutlined, MenuOutlined } from "@ant-design/icons";
import Link from "next/link";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import UserMenu from "@/components/common/UserMenu";
import { useTranslation } from "react-i18next";
import { authAPI } from "@/lib/auth/api-client";

const { Header: AntHeader } = Layout;

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const profile = await authAPI.getProfile();
        if (mounted) {
          setIsAuthenticated(!!profile);
        }
      } catch {
        if (mounted) {
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <AntHeader
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          width: "100%",
          backgroundColor: "#fff",
          borderBottom: "1px solid #f0f0f0",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
          height: "64px",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#FF385C",
              letterSpacing: "-0.5px",
            }}
            className="sm:text-2xl"
          >
            PR1AS
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            type="text"
            style={{
              fontWeight: 500,
              color: "#222",
              borderRadius: "22px",
            }}
          >
            {t("header.becomeWorker")}
          </Button>

          <LanguageSwitcher />

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "5px 5px 5px 12px",
                border: "1px solid #ddd",
                borderRadius: "21px",
                cursor: "pointer",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Link
                href="/auth/login"
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <MenuOutlined style={{ fontSize: "16px", color: "#222" }} />
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#717171" }}
                />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <LanguageSwitcher />
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
            style={{ fontSize: "20px" }}
          />
        </div>
      </AntHeader>

      {/* Mobile Drawer Menu */}
      <Drawer
        title={t("header.menu")}
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
      >
        <div className="flex flex-col gap-4">
          <Button
            type="text"
            block
            size="large"
            style={{
              fontWeight: 500,
              color: "#222",
              textAlign: "left",
            }}
          >
            {t("header.becomeWorker")}
          </Button>

          {isAuthenticated ? (
            <>
              <Link href="/profile">
                <Button
                  type="text"
                  block
                  size="large"
                  style={{ textAlign: "left" }}
                >
                  {t("header.userMenu.profile")}
                </Button>
              </Link>
              <Link href="/bookings">
                <Button
                  type="text"
                  block
                  size="large"
                  style={{ textAlign: "left" }}
                >
                  {t("header.userMenu.bookings")}
                </Button>
              </Link>
              <Button
                type="text"
                block
                size="large"
                danger
                style={{ textAlign: "left" }}
              >
                {t("header.userMenu.logout")}
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button type="primary" block size="large">
                  {t("header.login")}
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button block size="large">
                  {t("header.signup")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
}
