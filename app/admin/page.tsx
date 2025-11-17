"use client";

import { Card, Row, Col, Statistic, Typography } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

export default function AdminDashboard() {
  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={1234}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Workers"
              value={456}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Jobs"
              value={789}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={93256}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
