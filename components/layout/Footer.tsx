"use client";

import React from "react";
import { Layout, Row, Col, Space, Divider } from "antd";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Footer: AntFooter } = Layout;

export default function Footer() {
  return (
    <AntFooter
      style={{
        backgroundColor: "#f7f7f7",
        borderTop: "1px solid #e4e4e4",
        marginTop: "48px",
      }}
    >
      <div
        style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}
        className="sm:p-12"
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <div
              style={{
                marginBottom: "16px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Giới thiệu
            </div>
            <Space direction="vertical" size="small">
              <Link href="/about" style={{ color: "#717171" }}>
                Về chúng tôi
              </Link>
              <Link href="/careers" style={{ color: "#717171" }}>
                Tuyển dụng
              </Link>
              <Link href="/press" style={{ color: "#717171" }}>
                Báo chí
              </Link>
              <Link href="/blog" style={{ color: "#717171" }}>
                Blog
              </Link>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div
              style={{
                marginBottom: "16px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Cộng đồng
            </div>
            <Space direction="vertical" size="small">
              <Link href="/diversity" style={{ color: "#717171" }}>
                Đa dạng & Hòa nhập
              </Link>
              <Link href="/accessibility" style={{ color: "#717171" }}>
                Khả năng tiếp cận
              </Link>
              <Link href="/partners" style={{ color: "#717171" }}>
                Đối tác
              </Link>
              <Link href="/safety" style={{ color: "#717171" }}>
                An toàn
              </Link>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div
              style={{
                marginBottom: "16px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Worker
            </div>
            <Space direction="vertical" size="small">
              <Link href="/become-worker" style={{ color: "#717171" }}>
                Trở thành Worker
              </Link>
              <Link href="/worker-help" style={{ color: "#717171" }}>
                Trung tâm trợ giúp
              </Link>
              <Link href="/worker-resources" style={{ color: "#717171" }}>
                Tài nguyên
              </Link>
              <Link href="/community-forum" style={{ color: "#717171" }}>
                Diễn đàn
              </Link>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div
              style={{
                marginBottom: "16px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Hỗ trợ
            </div>
            <Space direction="vertical" size="small">
              <Link href="/help" style={{ color: "#717171" }}>
                Trung tâm trợ giúp
              </Link>
              <Link href="/cancellation" style={{ color: "#717171" }}>
                Chính sách hủy
              </Link>
              <Link href="/contact" style={{ color: "#717171" }}>
                Liên hệ
              </Link>
              <Link href="/faq" style={{ color: "#717171" }}>
                Câu hỏi thường gặp
              </Link>
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: "24px 0" }} className="sm:my-8" />

        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12} style={{ marginBottom: "16px" }}>
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start text-xs sm:text-sm text-gray-500">
              <span>© 2025 PR1AS</span>
              <Link href="/terms" style={{ color: "#717171" }}>
                Điều khoản
              </Link>
              <Link href="/privacy" style={{ color: "#717171" }}>
                Quyền riêng tư
              </Link>
              <Link href="/sitemap" style={{ color: "#717171" }}>
                Sơ đồ trang
              </Link>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div className="flex gap-4 sm:gap-6 justify-center md:justify-end">
              <FacebookOutlined
                style={{
                  fontSize: "20px",
                  color: "#717171",
                  cursor: "pointer",
                }}
              />
              <TwitterOutlined
                style={{
                  fontSize: "20px",
                  color: "#717171",
                  cursor: "pointer",
                }}
              />
              <InstagramOutlined
                style={{
                  fontSize: "20px",
                  color: "#717171",
                  cursor: "pointer",
                }}
              />
            </div>
          </Col>
        </Row>
      </div>
    </AntFooter>
  );
}
