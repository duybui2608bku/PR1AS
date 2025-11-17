"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Modal,
  message,
  Avatar,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;
const { confirm } = Modal;

interface User {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    role?: string;
    full_name?: string;
  };
  banned_until?: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const supabase = getSupabaseClient();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.admin.listUsers();

      if (error) throw error;

      setUsers(data.users as unknown as User[]);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBanUser = (userId: string, email: string) => {
    confirm({
      title: "Ban User",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to ban ${email}?`,
      okText: "Yes, Ban",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const banUntil = new Date();
          banUntil.setFullYear(banUntil.getFullYear() + 100); // Ban for 100 years

          const { error } = await supabase.auth.admin.updateUserById(userId, {
            ban_duration: "876000h", // 100 years in hours
          });

          if (error) throw error;

          message.success("User banned successfully");
          fetchUsers();
        } catch (error) {
          console.error("Error banning user:", error);
          message.error("Failed to ban user");
        }
      },
    });
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        ban_duration: "none",
      });

      if (error) throw error;

      message.success("User unbanned successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error unbanning user:", error);
      message.error("Failed to unban user");
    }
  };

  const handleDeleteUser = (userId: string, email: string) => {
    confirm({
      title: "Delete User",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to permanently delete ${email}? This action cannot be undone.`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const { error } = await supabase.auth.admin.deleteUser(userId);

          if (error) throw error;

          message.success("User deleted successfully");
          fetchUsers();
        } catch (error) {
          console.error("Error deleting user:", error);
          message.error("Failed to delete user");
        }
      },
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: "User",
      dataIndex: "email",
      key: "email",
      render: (email: string, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.user_metadata?.full_name || "No name"}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>{email}</div>
          </div>
        </Space>
      ),
      filteredValue: [searchText],
      onFilter: (value, record) =>
        record.email.toLowerCase().includes((value as string).toLowerCase()) ||
        (record.user_metadata?.full_name || "")
          .toLowerCase()
          .includes((value as string).toLowerCase()),
    },
    {
      title: "Role",
      dataIndex: ["user_metadata", "role"],
      key: "role",
      render: (role: string) => {
        const roleColors: Record<string, string> = {
          admin: "red",
          worker: "blue",
          client: "green",
        };
        return (
          <Tag color={roleColors[role] || "default"}>
            {role?.toUpperCase() || "USER"}
          </Tag>
        );
      },
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Worker", value: "worker" },
        { text: "Client", value: "client" },
      ],
      filteredValue: roleFilter === "all" ? null : [roleFilter],
      onFilter: (value, record) =>
        (record.user_metadata?.role || "user") === value,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record: User) => {
        const isBanned =
          record.banned_until && new Date(record.banned_until) > new Date();
        return isBanned ? (
          <Tag color="error">Banned</Tag>
        ) : (
          <Tag color="success">Active</Tag>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record: User) => {
        const isBanned =
          record.banned_until && new Date(record.banned_until) > new Date();
        const isAdmin = record.user_metadata?.role === "admin";

        return (
          <Space>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => message.info("Edit feature coming soon")}
            >
              Edit
            </Button>
            {!isAdmin && (
              <>
                {isBanned ? (
                  <Button
                    type="link"
                    onClick={() => handleUnbanUser(record.id)}
                  >
                    Unban
                  </Button>
                ) : (
                  <Button
                    type="link"
                    danger
                    onClick={() => handleBanUser(record.id, record.email)}
                  >
                    Ban
                  </Button>
                )}
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteUser(record.id, record.email)}
                >
                  Delete
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      (user.user_metadata?.full_name || "")
        .toLowerCase()
        .includes(searchText.toLowerCase());
    const matchesRole =
      roleFilter === "all" ||
      (user.user_metadata?.role || "user") === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <Title level={2}>User Management</Title>

      <Card style={{ marginTop: 24 }}>
        <Space style={{ marginBottom: 16, width: "100%" }} wrap>
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            style={{ width: 150 }}
            value={roleFilter}
            onChange={setRoleFilter}
          >
            <Select.Option value="all">All Roles</Select.Option>
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="worker">Worker</Select.Option>
            <Select.Option value="client">Client</Select.Option>
          </Select>
          <Button onClick={fetchUsers}>Refresh</Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} users`,
          }}
        />
      </Card>
    </div>
  );
}
