/**
 * Worker Card Component
 * Displays a worker profile card in the marketplace
 */

"use client";

import { Card, Tag, Typography, Space, Button, Avatar } from "antd";
import {
  UserOutlined,
  DollarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { WorkerMarketProfile } from "@/lib/market/types";
import Link from "next/link";

const { Text, Paragraph, Title } = Typography;

interface WorkerCardProps {
  worker: WorkerMarketProfile;
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  const { t } = useTranslation();

  // Get display name
  const displayName = worker.nickname || worker.full_name;

  // Get avatar URL
  const avatarUrl = worker.avatar?.image_url;

  // Calculate price range
  const priceRange =
    worker.min_price && worker.max_price
      ? worker.min_price === worker.max_price
        ? `$${worker.min_price}/hr`
        : `$${worker.min_price} - $${worker.max_price}/hr`
      : t("market.priceNotSet");

  // Get top 3 services
  const topServices = worker.services?.slice(0, 3) || [];

  return (
    <Card
      hoverable
      className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl border-0"
      cover={
        <div className="relative h-64 bg-gradient-to-br from-pink-50 to-rose-100 overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-pink-100 to-rose-100">
              <UserOutlined className="text-6xl text-gray-300" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Tag
              color="success"
              className="text-xs font-semibold border-0 shadow-sm"
              style={{ backgroundColor: '#52c41a' }}
            >
              {t("market.available")}
            </Tag>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-3">
          <Title level={4} className="mb-1">
            {displayName}
          </Title>
          <Space size="small" className="text-gray-500">
            <UserOutlined />
            <Text type="secondary">
              {worker.age} {t("market.yearsOld")}
            </Text>
          </Space>
        </div>

        {/* Bio */}
        {worker.bio && (
          <Paragraph
            ellipsis={{ rows: 2 }}
            className="text-gray-600 mb-3 flex-grow"
          >
            {worker.bio}
          </Paragraph>
        )}

        {/* Services */}
        <div className="mb-3">
          <Text className="text-xs text-gray-500 block mb-2">
            {t("market.services")}:
          </Text>
          <Space size={[0, 8]} wrap>
            {topServices.map((service) => (
              <Tag
                key={service.id}
                className="text-xs border-0"
                style={{
                  backgroundColor: '#fff1f0',
                  color: '#FF385C',
                  fontWeight: 500
                }}
              >
                {t(service.service.name_key)}
              </Tag>
            ))}
            {worker.services && worker.services.length > 3 && (
              <Tag
                className="text-xs border-0"
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#666'
                }}
              >
                +{worker.services.length - 3} {t("market.more")}
              </Tag>
            )}
          </Space>
        </div>

        {/* Price */}
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#fff7e6' }}>
          <Space>
            <DollarOutlined style={{ color: '#FF385C', fontSize: 18 }} />
            <Text strong style={{ color: '#FF385C', fontSize: 16 }}>
              {priceRange}
            </Text>
          </Space>
        </div>

        {/* Action Button */}
        <Link href={`/worker/profile/${worker.id}`} className="w-full">
          <Button
            type="primary"
            block
            size="large"
            className="font-semibold"
            style={{
              backgroundColor: '#FF385C',
              borderColor: '#FF385C',
              height: 48
            }}
          >
            {t("market.viewProfile")}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
