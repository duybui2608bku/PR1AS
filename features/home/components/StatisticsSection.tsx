import { Row, Col, Statistic } from "antd";
import { STATISTICS } from "../constants";

export default function StatisticsSection() {
  return (
    <section className="py-8 sm:py-12 bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Row gutter={[16, 24]} justify="center">
          {STATISTICS.map((stat, index) => (
            <Col xs={12} sm={6} md={6} key={index}>
              <div className="text-center">
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  suffix={stat.suffix}
                  valueStyle={{
                    color: "#690F0F",
                    fontWeight: "bold",
                    fontSize: "clamp(1.25rem, 4vw, 2rem)",
                  }}
                  className="statistic-responsive"
                />
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}
