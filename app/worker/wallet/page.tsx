"use client";

import React, { useState } from "react";
import { Row, Col, Typography, Space } from "antd";
import WalletBalance from "@/components/wallet/WalletBalance";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import DepositModal from "@/components/wallet/DepositModal";
import WithdrawModal from "@/components/wallet/WithdrawModal";

const { Title } = Typography;

export default function WorkerWalletPage() {
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDepositSuccess = () => {
    // Refresh wallet balance and transaction history
    setRefreshKey((prev) => prev + 1);
  };

  const handleWithdrawSuccess = () => {
    // Refresh wallet balance and transaction history
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <Title level={2}>My Wallet</Title>

      <Space direction="vertical" style={{ width: "100%" }} size="large">
        {/* Wallet Balance */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12} xl={10}>
            <WalletBalance
              key={`wallet-${refreshKey}`}
              onDeposit={() => setDepositModalOpen(true)}
              onWithdraw={() => setWithdrawModalOpen(true)}
            />
          </Col>
          <Col xs={24} lg={12} xl={14}>
            <div
              style={{
                padding: "24px",
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                borderRadius: "12px",
                color: "#fff",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Title level={3} style={{ color: "#fff", marginTop: 0 }}>
                💰 Your Earnings
              </Title>
              <Space direction="vertical" size="small">
                <p style={{ fontSize: "16px", margin: 0 }}>
                  💸 <strong>Withdraw:</strong> Transfer your earnings to your
                  bank account
                </p>
                <p style={{ fontSize: "16px", margin: 0 }}>
                  🔒 <strong>Protected:</strong> All payments are held in escrow
                  for your safety
                </p>
                <p style={{ fontSize: "16px", margin: 0 }}>
                  ⚡ <strong>Fast:</strong> Withdrawals processed within 1-3
                  business days
                </p>
                <p style={{ fontSize: "16px", margin: 0 }}>
                  📊 <strong>Track:</strong> View all your earnings and
                  transaction history
                </p>
              </Space>
            </div>
          </Col>
        </Row>

        {/* Transaction History */}
        <TransactionHistory key={`history-${refreshKey}`} />
      </Space>

      {/* Modals */}
      <DepositModal
        open={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onSuccess={handleDepositSuccess}
      />
      <WithdrawModal
        open={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        onSuccess={handleWithdrawSuccess}
      />
    </div>
  );
}
