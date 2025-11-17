import { Typography, Row, Col, Card } from "antd";
import {
  SafetyOutlined,
  ThunderboltOutlined,
  StarOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function FeaturesSection() {
  const features = [
    {
      icon: <SafetyOutlined className="text-4xl text-[#690F0F]" />,
      title: "An Toàn Tuyệt Đối",
      description:
        "Tất cả worker đều được xác minh danh tính, kiểm tra lý lịch và đánh giá nghiêm ngặt. Hệ thống thanh toán bảo mật với cơ chế giữ tiền an toàn.",
      colorClass: "purple",
    },
    {
      icon: <ThunderboltOutlined className="text-4xl text-[#690F0F]" />,
      title: "Nhanh Chóng & Tiện Lợi",
      description:
        "Đặt lịch chỉ trong vài giây, worker phản hồi nhanh chóng. Theo dõi tiến độ công việc realtime ngay trên ứng dụng.",
      colorClass: "pink",
    },
    {
      icon: <StarOutlined className="text-4xl text-[#690F0F]" />,
      title: "Chất Lượng Đảm Bảo",
      description:
        "Đánh giá minh bạch từ hàng ngàn khách hàng thực. Cam kết hoàn tiền 100% nếu không hài lòng về dịch vụ.",
      colorClass: "red",
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <Title
            level={2}
            className="!text-3xl sm:!text-4xl md:!text-5xl !font-bold !mb-3 sm:!mb-4"
          >
            Tại Sao Chọn PR1AS?
          </Title>
          <Paragraph className="!text-base sm:!text-lg md:!text-xl !text-gray-600 max-w-2xl mx-auto px-4">
            Nền tảng kết nối hàng đầu với những tính năng vượt trội
          </Paragraph>
        </div>

        <Row gutter={[16, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={24} md={8} key={index}>
              <Card
                hoverable
                className={`!h-full !border-2 hover:!border-[#690F0F] !transition-all !duration-300 hover:!shadow-xl`}
              >
                <div className="text-center p-2 sm:p-4">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-[#fef2f2] rounded-full mb-4 sm:mb-6`}
                  >
                    {feature.icon}
                  </div>
                  <Title
                    level={3}
                    className="!text-xl sm:!text-2xl !mb-3 sm:!mb-4"
                  >
                    {feature.title}
                  </Title>
                  <Paragraph className="!text-gray-600 !text-sm sm:!text-base">
                    {feature.description}
                  </Paragraph>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}
