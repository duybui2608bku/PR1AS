/**
 * Deposit Modal Component
 * Allows users to deposit money via Bank Transfer or PayPal
 * Usage: <DepositModal open={open} onClose={onClose} />
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Modal,
  Tabs,
  Form,
  InputNumber,
  Button,
  message,
  Space,
  Alert,
} from "antd";
import { BankOutlined, CreditCardOutlined } from "@ant-design/icons";
import { walletAPI, walletHelpers } from "@/lib/wallet/api-client";
import type { BankDeposit } from "@/lib/wallet/types";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DepositModal({
  open,
  onClose,
  onSuccess,
}: DepositModalProps) {
  const [loading, setLoading] = useState(false);
  const [bankDeposit, setBankDeposit] = useState<BankDeposit | null>(null);
  const [form] = Form.useForm();

  const handleBankDeposit = async (values: { amount_usd: number }) => {
    try {
      setLoading(true);
      const amountVND = values.amount_usd * 24000;
      const result = await walletAPI.depositBankTransfer(
        values.amount_usd,
        amountVND
      );

      setBankDeposit(result.deposit);
      message.success("QR code generated! Please scan to complete payment.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create deposit";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalDeposit = async (values: { amount_usd: number }) => {
    try {
      setLoading(true);
      const result = await walletAPI.depositPayPal(values.amount_usd);

      window.location.href = result.approval_url;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create PayPal deposit";
      message.error(errorMessage);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBankDeposit(null);
    form.resetFields();
    onClose();
  };

  const handleSuccess = () => {
    setBankDeposit(null);
    form.resetFields();
    onSuccess?.();
    onClose();
  };

  return (
    <Modal
      title="Deposit Money"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
    >
      {!bankDeposit ? (
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
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleBankDeposit}
                >
                  <Form.Item
                    label="Amount (USD)"
                    name="amount_usd"
                    rules={[
                      { required: true, message: "Please enter amount" },
                      {
                        type: "number",
                        min: 10,
                        message: "Minimum deposit is $10",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      prefix="$"
                      placeholder="Enter amount"
                      min={10}
                      step={10}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Alert
                      message="Bank Transfer via QR Code"
                      description="You will receive a QR code to scan with your banking app. Payment is confirmed automatically within minutes."
                      type="info"
                      showIcon
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      size="large"
                    >
                      Generate QR Code
                    </Button>
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
                  onFinish={handlePayPalDeposit}
                >
                  <Form.Item
                    label="Amount (USD)"
                    name="amount_usd"
                    rules={[
                      { required: true, message: "Please enter amount" },
                      {
                        type: "number",
                        min: 10,
                        message: "Minimum deposit is $10",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      prefix="$"
                      placeholder="Enter amount"
                      min={10}
                      step={10}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Alert
                      message="PayPal Payment"
                      description="You will be redirected to PayPal to complete your payment securely."
                      type="info"
                      showIcon
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      size="large"
                    >
                      Pay with PayPal
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Alert
            message="Scan QR Code to Pay"
            description={`Please transfer ${walletHelpers.formatVND(
              bankDeposit.amount_vnd || 0
            )} to complete your deposit.`}
            type="success"
            showIcon
          />

          <div
            style={{
              textAlign: "center",
              position: "relative",
              width: "100%",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            <Image
              src={bankDeposit.qr_code_url}
              alt="QR Code for Bank Transfer"
              width={400}
              height={400}
              style={{
                width: "100%",
                height: "auto",
              }}
              unoptimized // Sepay URL is external, disable Next.js optimization
            />
          </div>

          <div
            style={{
              padding: "16px",
              background: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            <p>
              <strong>Bank:</strong> {bankDeposit.bank_name}
            </p>
            <p>
              <strong>Account:</strong> {bankDeposit.bank_account}
            </p>
            <p>
              <strong>Amount:</strong>{" "}
              {walletHelpers.formatVND(bankDeposit.amount_vnd || 0)}
            </p>
            <p>
              <strong>Transfer Content:</strong>{" "}
              <code
                style={{
                  background: "#fff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                {bankDeposit.transfer_content}
              </code>
            </p>
            <p
              style={{ fontSize: "12px", color: "#8c8c8c", marginTop: "12px" }}
            >
              ⚠️ Important: Please include the transfer content exactly as shown
              above.
            </p>
          </div>

          <Alert
            message="Auto-confirmation"
            description="Your deposit will be automatically confirmed within 1-5 minutes after we receive your transfer. The page will refresh automatically."
            type="info"
          />

          <Space style={{ width: "100%", justifyContent: "center" }}>
            <Button onClick={handleClose}>Close</Button>
            <Button type="primary" onClick={handleSuccess}>
              I&apos;ve Completed the Transfer
            </Button>
          </Space>
        </Space>
      )}
    </Modal>
  );
}
