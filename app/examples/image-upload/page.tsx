"use client";

import { useState } from "react";
import ImageUpload from "@/components/common/ImageUpload";
import { Card, Typography, Space, Divider, Form, Input, Button, message } from "antd";

const { Title, Paragraph, Text } = Typography;

/**
 * Example page demonstrating ImageUpload component usage
 * 
 * Access this page at: /examples/image-upload
 */
export default function ImageUploadExamplePage() {
  // Example 1: Avatar
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [avatarPath, setAvatarPath] = useState<string>();

  // Example 2: Product Image
  const [productImage, setProductImage] = useState<string>();

  // Example 3: Form with Image
  const [form] = Form.useForm();

  const handleFormSubmit = async (values: Record<string, unknown>) => {
    // Trong thực tế, bạn sẽ lưu vào database:
    // await updateProfile({ 
    //   name: values.name,
    //   avatar: avatarUrl,
    //   productImage: productImage
    // });
    
    message.success("Form submitted successfully!");
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Title level={2}>📸 Image Upload Examples</Title>
      <Paragraph>
        Trang này demo các cách sử dụng <Text code>ImageUpload</Text> component.
      </Paragraph>

      <Divider />

      {/* Example 1: Avatar Upload */}
      <Card 
        title="1. Avatar Upload" 
        style={{ marginBottom: 24 }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Paragraph>
            Sử dụng cho ảnh đại diện người dùng. Ảnh được lưu trong folder <Text code>avatar</Text>.
          </Paragraph>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <ImageUpload
              type="avatar"
              folder="avatar"
              value={avatarUrl}
              onChange={(url, path) => {
                setAvatarUrl(url);
                setAvatarPath(path);
              }}
              avatarSize={120}
              showDelete={true}
            />
          </div>

          {avatarUrl && (
            <div style={{ backgroundColor: "#f5f5f5", padding: 12, borderRadius: 4 }}>
              <Text strong>Current Avatar URL:</Text>
              <br />
              <Text copyable style={{ fontSize: 12, wordBreak: "break-all" }}>
                {avatarUrl}
              </Text>
              <br />
              <br />
              <Text strong>Storage Path:</Text>
              <br />
              <Text copyable style={{ fontSize: 12 }}>
                {avatarPath}
              </Text>
            </div>
          )}

          <Paragraph>
            <Text strong>Code:</Text>
          </Paragraph>
          <pre style={{ backgroundColor: "#f5f5f5", padding: 12, borderRadius: 4, overflow: "auto" }}>
{`<ImageUpload
  type="avatar"
  folder="avatar"
  value={avatarUrl}
  onChange={(url, path) => {
    setAvatarUrl(url);
    setAvatarPath(path);
  }}
  avatarSize={120}
  showDelete={true}
/>`}
          </pre>
        </Space>
      </Card>

      {/* Example 2: Product Image Upload */}
      <Card 
        title="2. Product/Service Image Upload" 
        style={{ marginBottom: 24 }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Paragraph>
            Sử dụng cho ảnh sản phẩm/dịch vụ. Ảnh được lưu trong folder <Text code>products</Text>.
          </Paragraph>

          <ImageUpload
            type="image"
            folder="products"
            value={productImage}
            onChange={(url) => {
              setProductImage(url);
            }}
            imageWidth={400}
            imageHeight={300}
            showDelete={true}
            buttonText="Chọn ảnh sản phẩm"
          />

          {productImage && (
            <div style={{ backgroundColor: "#f5f5f5", padding: 12, borderRadius: 4 }}>
              <Text strong>Current Image URL:</Text>
              <br />
              <Text copyable style={{ fontSize: 12, wordBreak: "break-all" }}>
                {productImage}
              </Text>
            </div>
          )}

          <Paragraph>
            <Text strong>Code:</Text>
          </Paragraph>
          <pre style={{ backgroundColor: "#f5f5f5", padding: 12, borderRadius: 4, overflow: "auto" }}>
{`<ImageUpload
  type="image"
  folder="products"
  value={productImage}
  onChange={(url) => setProductImage(url)}
  imageWidth={400}
  imageHeight={300}
  buttonText="Chọn ảnh sản phẩm"
/>`}
          </pre>
        </Space>
      </Card>

      {/* Example 3: Form Integration */}
      <Card 
        title="3. Integration with Ant Design Form" 
        style={{ marginBottom: 24 }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Paragraph>
            Ví dụ tích hợp với Form để cập nhật profile.
          </Paragraph>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            style={{ maxWidth: 600 }}
          >
            <Form.Item
              label="Tên của bạn"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder="Nhập tên của bạn" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" }
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item label="Ảnh đại diện">
              <ImageUpload
                type="avatar"
                folder="avatar"
                value={avatarUrl}
                onChange={(url) => setAvatarUrl(url)}
                avatarSize={100}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" size="large">
                Lưu thông tin
              </Button>
            </Form.Item>
          </Form>

          <Paragraph>
            <Text strong>Code:</Text>
          </Paragraph>
          <pre style={{ backgroundColor: "#f5f5f5", padding: 12, borderRadius: 4, overflow: "auto" }}>
{`const [avatarUrl, setAvatarUrl] = useState<string>();

<Form onFinish={handleSubmit}>
  <Form.Item label="Ảnh đại diện">
    <ImageUpload
      type="avatar"
      folder="avatar"
      value={avatarUrl}
      onChange={(url) => setAvatarUrl(url)}
    />
  </Form.Item>
  
  <Button htmlType="submit">Lưu</Button>
</Form>

const handleSubmit = async (values) => {
  // Lưu avatarUrl vào database
  await updateProfile({
    ...values,
    avatar: avatarUrl
  });
};`}
          </pre>
        </Space>
      </Card>

      {/* Features */}
      <Card title="✨ Features">
        <Space direction="vertical" size="small">
          <Text>✅ Tự động validate file type (JPEG, PNG, WebP, GIF)</Text>
          <Text>✅ Tự động validate file size (max 5MB)</Text>
          <Text>✅ Upload lên Supabase Storage</Text>
          <Text>✅ Tạo public URL tự động</Text>
          <Text>✅ Hỗ trợ xóa ảnh</Text>
          <Text>✅ Loading states</Text>
          <Text>✅ Error handling</Text>
          <Text>✅ Responsive design</Text>
          <Text>✅ Tích hợp i18n (VI/EN)</Text>
        </Space>
      </Card>

      <Divider />

      <Paragraph type="secondary" style={{ textAlign: "center" }}>
        📚 Xem thêm tài liệu chi tiết tại{" "}
        <Text code>docs/IMAGE_UPLOAD_GUIDE.md</Text>
      </Paragraph>
    </div>
  );
}

