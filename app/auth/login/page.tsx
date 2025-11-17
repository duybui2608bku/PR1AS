"use client";

import { Button, Form, Input, Typography, Divider, ConfigProvider } from "antd";
import {
  GoogleOutlined,
  MailOutlined,
  LockOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { showMessage } from "@/lib/utils/toast";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import styles from "./page.module.css";

const { Title, Text } = Typography;

export default function LoginPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleGoogleLogin = () => {
    showMessage.info(t("auth.login.googleLoginComingSoon"));
  };

  const handleEmailLogin = (values: { email: string; password: string }) => {
    void values;
    showMessage.success(t("auth.login.loginSuccess"));
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#690f0f",
          borderRadius: 8,
        },
      }}
    >
      <div className={styles.container}>
        {/* Language Switcher and Back to Home */}
        <div className={styles.languageSwitcher}>
          <Link href="/">
            <Button
              type="text"
              icon={<HomeOutlined />}
              style={{ marginRight: "8px" }}
            >
              {t("common.homeButton")}
            </Button>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className={styles.card}>
          {/* Logo/Brand */}
          <div className={styles.logoContainer}>
            <div className={styles.logo}>PR</div>
            <Title level={2} className={styles.title}>
              {t("auth.login.title")}
            </Title>
            <Text type="secondary" className={styles.subtitle}>
              {t("auth.login.subtitle")}
            </Text>
          </div>

          {/* Google Login Button */}
          <Button
            type="default"
            size="large"
            icon={<GoogleOutlined />}
            block
            onClick={handleGoogleLogin}
            className={styles.googleButton}
          >
            {t("auth.login.continueWithGoogle")}
          </Button>

          <Divider className={styles.divider}>
            <Text type="secondary" className={styles.dividerText}>
              {t("auth.login.orLoginWithEmail")}
            </Text>
          </Divider>

          {/* Login Form */}
          <Form form={form} onFinish={handleEmailLogin} layout="vertical">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: t("auth.login.emailRequired") },
                { type: "email", message: t("auth.login.emailInvalid") },
              ]}
            >
              <Input
                prefix={<MailOutlined className={styles.inputIcon} />}
                placeholder={t("auth.login.emailPlaceholder")}
                size="large"
                className={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: t("auth.login.passwordRequired") },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className={styles.inputIcon} />}
                placeholder={t("auth.login.passwordPlaceholder")}
                size="large"
                className={styles.input}
              />
            </Form.Item>

            <div className={styles.rememberForgot}>
              <div></div>
              <Link href="/auth/forgot-password" className={styles.forgotLink}>
                {t("auth.login.forgotPassword")}
              </Link>
            </div>

            <Form.Item className={styles.submitFormItem}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                className={styles.submitButton}
              >
                {t("auth.login.loginButton")}
              </Button>
            </Form.Item>
          </Form>

          {/* Sign Up Link */}
          <div className={styles.signupLinkContainer}>
            <Text type="secondary" className={styles.signupText}>
              {t("auth.login.noAccount")}{" "}
              <Link href="/auth/signup" className={styles.signupLink}>
                {t("auth.login.signupLink")}
              </Link>
            </Text>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}
