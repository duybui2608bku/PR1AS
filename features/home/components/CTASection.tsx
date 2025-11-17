import { Typography, Button, Row, Col } from "antd";
import { UserOutlined, CheckCircleOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title, Paragraph } = Typography;

export default function CTASection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-[#690F0F] to-[#8B1818] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Title
          level={2}
          className="!text-white !text-3xl sm:!text-4xl md:!text-5xl !font-bold !mb-4 sm:!mb-6"
        >
          Sẵn Sàng Bắt Đầu?
        </Title>
        <Paragraph className="!text-white !text-base sm:!text-lg md:!text-xl !mb-6 sm:!mb-8 opacity-90 px-4">
          Tham gia cùng hàng ngàn người dùng đã tin tưởng PR1AS. Đăng ký miễn
          phí ngay hôm nay!
        </Paragraph>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          <Link href="/auth/signup" className="w-full sm:w-auto">
            <Button
              type="primary"
              size="large"
              icon={<UserOutlined />}
              className="!h-12 sm:!h-14 !px-8 sm:!px-10 !text-base sm:!text-lg !font-semibold !bg-white !text-[#690F0F] hover:!bg-gray-100 w-full sm:w-auto"
            >
              Đăng Ký Miễn Phí
            </Button>
          </Link>
          <Link href="/auth/login" className="w-full sm:w-auto">
            <Button
              size="large"
              className="!h-12 sm:!h-14 !px-8 sm:!px-10 !text-base sm:!text-lg !font-semibold !bg-transparent !text-white !border-white hover:!bg-white/10 w-full sm:w-auto"
            >
              Đăng Nhập
            </Button>
          </Link>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/20">
          <Row
            gutter={[12, 12]}
            justify="center"
            className="text-xs sm:text-sm opacity-80"
          >
            <Col xs={24} sm={8}>
              <CheckCircleOutlined /> Miễn phí đăng ký
            </Col>
            <Col xs={24} sm={8}>
              <CheckCircleOutlined /> Không cần thẻ tín dụng
            </Col>
            <Col xs={24} sm={8}>
              <CheckCircleOutlined /> Hủy bất cứ lúc nào
            </Col>
          </Row>
        </div>
      </div>
    </section>
  );
}
