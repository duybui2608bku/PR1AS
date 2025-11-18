/**
 * Wallet Balance Component
 * Displays user's wallet balance and quick actions
 * Usage: <WalletBalance />
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, Statistic, Button, Space, message } from 'antd';
import { 
  WalletOutlined, 
  PlusOutlined, 
  MinusOutlined, 
  SyncOutlined 
} from '@ant-design/icons';
import { walletAPI, walletHelpers } from '@/lib/wallet/api-client';
import type { Wallet, WalletSummary } from '@/lib/wallet/types';

interface WalletBalanceProps {
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

export default function WalletBalance({ onDeposit, onWithdraw }: WalletBalanceProps) {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [summary, setSummary] = useState<WalletSummary | null>(null);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const data = await walletAPI.getBalance();
      setWallet(data.wallet);
      setSummary(data.summary);
    } catch (error: any) {
      console.error('Wallet error:', error);
      if (error.message === 'Not authenticated') {
        message.error('Please login to view your wallet');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      } else {
        message.error(error.message || 'Failed to load wallet balance');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  if (loading) {
    return (
      <Card loading={true}>
        <Statistic title="Wallet Balance" value="Loading..." />
      </Card>
    );
  }

  if (!wallet || !summary) {
    return (
      <Card>
        <p>Failed to load wallet</p>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <WalletOutlined />
          <span>My Wallet</span>
        </Space>
      }
      extra={
        <Button
          icon={<SyncOutlined />}
          onClick={loadWalletData}
          loading={loading}
          type="text"
        >
          Refresh
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Available Balance */}
        <Statistic
          title="Available Balance"
          value={summary.available_balance}
          precision={2}
          prefix="$"
          valueStyle={{ color: '#3f8600', fontSize: '2em', fontWeight: 'bold' }}
        />

        {/* Additional Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <Statistic
            title="Pending"
            value={summary.pending_balance}
            precision={2}
            prefix="$"
            valueStyle={{ fontSize: '1.2em' }}
          />
          <Statistic
            title="Total Earned"
            value={summary.total_earned}
            precision={2}
            prefix="$"
            valueStyle={{ fontSize: '1.2em', color: '#52c41a' }}
          />
          <Statistic
            title="Active Escrows"
            value={summary.active_escrows}
            valueStyle={{ fontSize: '1.2em' }}
          />
          <Statistic
            title="Total Spent"
            value={summary.total_spent}
            precision={2}
            prefix="$"
            valueStyle={{ fontSize: '1.2em', color: '#8c8c8c' }}
          />
        </div>

        {/* Actions */}
        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={onDeposit}
          >
            Deposit
          </Button>
          <Button
            icon={<MinusOutlined />}
            size="large"
            onClick={onWithdraw}
            disabled={summary.available_balance <= 0}
          >
            Withdraw
          </Button>
        </Space>

        {/* Wallet Status */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#8c8c8c' }}>
          Status: <strong style={{ color: wallet.status === 'active' ? '#52c41a' : '#ff4d4f' }}>
            {wallet.status.toUpperCase()}
          </strong>
        </div>
      </Space>
    </Card>
  );
}

