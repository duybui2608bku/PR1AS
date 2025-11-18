/**
 * Withdraw Modal Component
 * Allows users to withdraw money to Bank Account or PayPal
 * Usage: <WithdrawModal open={open} onClose={onClose} />
 */

"use client";

import { useState } from "react";
import {
  Modal,
  Tabs,
  Form,
  InputNumber,
  Input,
  Button,
  message,
  Alert,
  Space,
} from "antd";
import { BankOutlined, CreditCardOutlined } from "@ant-design/icons";
import { walletAPI } from "@/lib/wallet/api-client";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WithdrawModal({
  open,
  onClose,
  onSuccess,
}: WithdrawModalProps) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleBankWithdraw = async (values: {
    amount_usd: number;
    bank_account: string;
    bank_name: string;
    account_holder: string;
  }) => {
    try {
      setLoading(true);
      await walletAPI.withdrawBank(
        values.amount_usd,
        values.bank_account,
        values.bank_name,
        values.account_holder
      );

      message.success("Withdrawal request submitted successfully!");
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      message.error((error as Error).message ?? "Failed to process withdrawal");
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalWithdraw = async (values: {
    amount_usd: number;
    paypal_email: string;
  }) => {
    try {
      setLoading(true);
      await walletAPI.withdrawPayPal(values.amount_usd, values.paypal_email);

      message.success("Withdrawal request submitted successfully!");
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      message.error((error as Error).message ?? "Failed to process withdrawal");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Withdraw Money"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
    >
      <Tabs
        items={[
          {
            key: "bank",
            label: (
              <span>
                <BankOutlined /> Bank Transfer
              </span>
            ),
            children: (
              <Form form={form} layout="vertical" onFinish={handleBankWithdraw}>
                <Form.Item
                  label="Amount (USD)"
                  name="amount_usd"
                  rules={[
                    { required: true, message: "Please enter amount" },
                    {
                      type: "number",
                      min: 50,
                      message: "Minimum withdrawal is $50",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    prefix="$"
                    placeholder="Enter amount"
                    min={50}
                    step={10}
                  />
                </Form.Item>

                <Form.Item
                  label="Bank Name"
                  name="bank_name"
                  rules={[
                    { required: true, message: "Please enter bank name" },
                  ]}
                >
                  <Input placeholder="e.g., Vietcombank, BIDV, Techcombank" />
                </Form.Item>

                <Form.Item
                  label="Bank Account Number"
                  name="bank_account"
                  rules={[
                    { required: true, message: "Please enter account number" },
                    {
                      pattern: /^[0-9]+$/,
                      message: "Account number must contain only digits",
                    },
                  ]}
                >
                  <Input placeholder="Enter your account number" />
                </Form.Item>

                <Form.Item
                  label="Account Holder Name"
                  name="account_holder"
                  rules={[
                    {
                      required: true,
                      message: "Please enter account holder name",
                    },
                  ]}
                >
                  <Input placeholder="Enter full name as shown on bank account" />
                </Form.Item>

                <Form.Item>
                  <Alert
                    message="Bank Transfer Withdrawal"
                    description="Your withdrawal will be processed within 1-3 business days. Make sure your bank details are correct."
                    type="info"
                    showIcon
                  />
                </Form.Item>

                <Form.Item>
                  <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                    >
                      Submit Withdrawal Request
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: "paypal",
            label: (
              <span>
                <CreditCardOutlined /> PayPal
              </span>
            ),
            children: (
              <Form
                form={form}
                layout="vertical"
                onFinish={handlePayPalWithdraw}
              >
                <Form.Item
                  label="Amount (USD)"
                  name="amount_usd"
                  rules={[
                    { required: true, message: "Please enter amount" },
                    {
                      type: "number",
                      min: 50,
                      message: "Minimum withdrawal is $50",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    prefix="$"
                    placeholder="Enter amount"
                    min={50}
                    step={10}
                  />
                </Form.Item>

                <Form.Item
                  label="PayPal Email"
                  name="paypal_email"
                  rules={[
                    { required: true, message: "Please enter PayPal email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input placeholder="your.email@example.com" />
                </Form.Item>

                <Form.Item>
                  <Alert
                    message="PayPal Withdrawal"
                    description="Your withdrawal will be sent to your PayPal account within 1-2 business days. Make sure your PayPal email is correct."
                    type="info"
                    showIcon
                  />
                </Form.Item>

                <Form.Item>
                  <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                    >
                      Submit Withdrawal Request
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
    </Modal>
  );
}
