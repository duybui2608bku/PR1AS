"use client";

import React, { useState } from "react";
import { Layout, Button, Avatar, Dropdown, Drawer } from "antd";
import { UserOutlined, MenuOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import Link from "next/link";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const { Header: AntHeader } = Layout;

export default function Header() {
  const [isAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: <Link href="/profile">Hồ sơ của tôi</Link>,
    },
    {
      key: "bookings",
      label: <Link href="/bookings">Đặt chỗ</Link>,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      danger: true,
    },
  ];

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
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
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
                  e.currentTarget.style.boxShadow =
                    "0 2px 4px rgba(0,0,0,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <MenuOutlined style={{ fontSize: "16px" }} />
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#717171" }}
                />
              </div>
            </Dropdown>
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
        title="Menu"
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
                  Hồ sơ của tôi
                </Button>
              </Link>
              <Link href="/bookings">
                <Button
                  type="text"
                  block
                  size="large"
                  style={{ textAlign: "left" }}
                >
                  Đặt chỗ
                </Button>
              </Link>
              <Button
                type="text"
                block
                size="large"
                danger
                style={{ textAlign: "left" }}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button type="primary" block size="large">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button block size="large">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
}
