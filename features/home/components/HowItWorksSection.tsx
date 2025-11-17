import { Typography, Row, Col } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { STEPS } from "../constants";

const { Title, Paragraph } = Typography;

export default function HowItWorksSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <Title
            level={2}
            className="!text-3xl sm:!text-4xl md:!text-5xl !font-bold !mb-3 sm:!mb-4"
          >
            Cách Thức Hoạt Động
          </Title>
          <Paragraph className="!text-base sm:!text-lg md:!text-xl !text-gray-600 max-w-2xl mx-auto px-4">
            Chỉ 4 bước đơn giản để có được dịch vụ hoàn hảo
          </Paragraph>
        </div>

        <Row gutter={[16, 32]}>
          {STEPS.map((step, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <div className="relative text-center px-2">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#690F0F] to-[#8B1818] rounded-full mb-4 sm:mb-6 relative z-10">
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {step.number}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 sm:top-12 left-1/2 w-full h-1 bg-gradient-to-r from-[#690F0F] to-[#8B1818] opacity-30"></div>
                )}
                <Title
                  level={4}
                  className="!text-lg sm:!text-xl !mb-2 sm:!mb-3"
                >
                  {step.title}
                </Title>
                <Paragraph className="!text-gray-600 !text-sm sm:!text-base">
                  {step.description}
                </Paragraph>
              </div>
            </Col>
          ))}
        </Row>

        <div className="text-center mt-8 sm:mt-12">
          <CheckCircleOutlined className="text-5xl sm:text-6xl text-green-500 mb-3 sm:mb-4" />
          <Title level={4} className="!text-xl sm:!text-2xl !text-gray-700">
            Đơn giản, nhanh chóng và hiệu quả!
          </Title>
        </div>
      </div>
    </section>
  );
}
