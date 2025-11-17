"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Tabs,
  Space,
  message,
  Spin,
} from "antd";
import { SaveOutlined, GlobalOutlined } from "@ant-design/icons";
import { getSupabaseClient } from "@/lib/supabase/client";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SEOSettings {
  // General SEO
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  ogImage: string;

  // Header Settings
  headerLogo: string;
  headerTagline: string;
  headerContactPhone: string;
  headerContactEmail: string;

  // Footer Settings
  footerCompanyName: string;
  footerAddress: string;
  footerPhone: string;
  footerEmail: string;
  footerCopyright: string;
  footerAbout: string;

  // Social Media
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
}

export default function SEOSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const supabase = getSupabaseClient();

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "seo_settings")
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data?.value) {
        form.setFieldsValue(data.value);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      message.warning("Could not load existing settings. Using defaults.");
    } finally {
      setFetchLoading(false);
    }
  }, [form, supabase]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (values: SEOSettings) => {
    setLoading(true);
    try {
      // Try to update first
      const { error: updateError } = await supabase
        .from("site_settings")
        .update({ value: values, updated_at: new Date().toISOString() })
        .eq("key", "seo_settings");

      // If update fails (no rows), insert
      if (
        updateError?.code === "PGRST116" ||
        updateError?.message?.includes("0 rows")
      ) {
        const { error: insertError } = await supabase
          .from("site_settings")
          .insert({
            key: "seo_settings",
            value: values,
          });

        if (insertError) throw insertError;
      } else if (updateError) {
        throw updateError;
      }

      message.success("SEO settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      message.error("Failed to save settings: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const tabItems = [
    {
      key: "general",
      label: (
        <span>
          <GlobalOutlined /> General SEO
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Form.Item
            label="Site Name"
            name="siteName"
            rules={[{ required: true, message: "Please enter site name" }]}
          >
            <Input placeholder="PR1AS" />
          </Form.Item>

          <Form.Item
            label="Site Title"
            name="siteTitle"
            rules={[{ required: true, message: "Please enter site title" }]}
          >
            <Input placeholder="PR1AS - Nền tảng kết nối Client & Worker" />
          </Form.Item>

          <Form.Item
            label="Site Description"
            name="siteDescription"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea
              rows={3}
              placeholder="Tìm kiếm và thuê Worker chuyên nghiệp..."
            />
          </Form.Item>

          <Form.Item label="Keywords (comma separated)" name="siteKeywords">
            <TextArea
              rows={2}
              placeholder="worker, client, dịch vụ, tìm việc, thuê người"
            />
          </Form.Item>

          <Form.Item label="Open Graph Image URL" name="ogImage">
            <Input placeholder="https://example.com/og-image.jpg" />
          </Form.Item>
        </Space>
      ),
    },
    {
      key: "header",
      label: "Header Settings",
      children: (
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Form.Item label="Logo URL" name="headerLogo">
            <Input placeholder="/logo.png" />
          </Form.Item>

          <Form.Item label="Tagline" name="headerTagline">
            <Input placeholder="Connect. Work. Succeed." />
          </Form.Item>

          <Form.Item label="Contact Phone" name="headerContactPhone">
            <Input placeholder="+84 xxx xxx xxx" />
          </Form.Item>

          <Form.Item label="Contact Email" name="headerContactEmail">
            <Input type="email" placeholder="contact@pr1as.com" />
          </Form.Item>
        </Space>
      ),
    },
    {
      key: "footer",
      label: "Footer Settings",
      children: (
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Form.Item label="Company Name" name="footerCompanyName">
            <Input placeholder="PR1AS Company Ltd." />
          </Form.Item>

          <Form.Item label="Address" name="footerAddress">
            <TextArea rows={2} placeholder="123 Street, City, Country" />
          </Form.Item>

          <Form.Item label="Phone" name="footerPhone">
            <Input placeholder="+84 xxx xxx xxx" />
          </Form.Item>

          <Form.Item label="Email" name="footerEmail">
            <Input type="email" placeholder="info@pr1as.com" />
          </Form.Item>

          <Form.Item label="About Text" name="footerAbout">
            <TextArea
              rows={3}
              placeholder="Short description about your company..."
            />
          </Form.Item>

          <Form.Item label="Copyright Text" name="footerCopyright">
            <Input placeholder="© 2024 PR1AS. All rights reserved." />
          </Form.Item>

          <Title level={5} style={{ marginTop: 24 }}>
            Social Media Links
          </Title>

          <Form.Item label="Facebook URL" name="facebookUrl">
            <Input placeholder="https://facebook.com/pr1as" />
          </Form.Item>

          <Form.Item label="Twitter URL" name="twitterUrl">
            <Input placeholder="https://twitter.com/pr1as" />
          </Form.Item>

          <Form.Item label="Instagram URL" name="instagramUrl">
            <Input placeholder="https://instagram.com/pr1as" />
          </Form.Item>

          <Form.Item label="LinkedIn URL" name="linkedinUrl">
            <Input placeholder="https://linkedin.com/company/pr1as" />
          </Form.Item>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>SEO & Site Settings</Title>
      <Text type="secondary">
        Configure SEO metadata, header, and footer settings for your website
      </Text>

      <Card style={{ marginTop: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            siteName: "PR1AS",
            siteTitle: "PR1AS - Nền tảng kết nối Client & Worker",
            siteDescription:
              "Tìm kiếm và thuê Worker chuyên nghiệp hoặc cung cấp dịch vụ và kiếm thu nhập",
            siteKeywords:
              "worker, client, dịch vụ, tìm việc, thuê người, PR1AS",
            footerCopyright: "© 2024 PR1AS. All rights reserved.",
          }}
        >
          <Tabs items={tabItems} />

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
            >
              Save All Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
