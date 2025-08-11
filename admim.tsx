import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api/Api";
import type { AdminData } from "../Types/User";
import { Space, Table, Button, Select, Modal, Input, Form } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import dayjs from "dayjs";

const AdminView = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModelVisible, setIsCreateModelVisible] = useState(false);
  const [editTodo, setEditTodo] = React.useState<AdminData | null>(null);

  const queryClient = useQueryClient();
  // const [tabledata, setTableData] = React.useState();

  // Fetch Users-details----------------------
  const {
    data: userdata,
    isPending,
    error,
  } = useQuery({
    queryKey: ["userdata"],
    queryFn: async (): Promise<AdminData[]> => {
      const response = await API.get("/admin/get-users");
      return response.data;
    },
  });

  // Create Users------------------------------
  const createUsers = useMutation({
    mutationFn: (newUser: AdminData) => API.post("/admin/create-user", newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userdata"] });
      form.resetFields();
      setIsCreateModelVisible(false);
    },
  });

  // Update Users----------------------------
  const updateUsers = useMutation({
    mutationFn: (updateUser: AdminData) =>
      API.put(`/admin/update-user/${updateUser.id}`, updateUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userdata"] });
      form.resetFields();
      setIsModalVisible(false);
    },
  });

  // Delete Users-----------------------
  const deleteUser = useMutation({
    mutationFn: (id: string) => API.delete(`/admin/delete-user/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userdata"] });
    },
  });

  const onCreateFinish = (values: AdminData) => {
    createUsers.mutate(values);
  };

  const onUpdateFinish = (values: AdminData) => {
    if (!editTodo?.id) return;
    updateUsers.mutate({ ...editTodo, ...values });
  };

  const handleEdit = (todo: AdminData) => {
    form.setFieldsValue({
      name: todo.name,
      email: todo.email,
      role: todo.role,
      jdate: todo.createdAt,
    });
    setEditTodo(todo);
    setIsModalVisible(true);
  };

  const handleDelete = (id?: string) => {
    if (id) deleteUser.mutate(id);
  };

  const columns: TableProps<AdminData>["columns"] = [
    {
      title: "S.No.",
      dataIndex: "sno",
      key: "sno",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Joining Date",
      dataIndex: "jdate",
      key: "jdate",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <EditOutlined onClick={() => handleEdit(record)} />
          <DeleteOutlined
            style={{ color: "red" }}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];
  if (isPending) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "-20px",
        }}
      >
        <Button
          onClick={() => {
            setIsCreateModelVisible(true);
          }}
          style={{ background: "#004b8b", color: "#ffff" }}
        >
          <PlusOutlined /> Add User
        </Button>
      </div>
      <Table<AdminData>
        columns={columns}
        dataSource={userdata?.map((user, index) => ({
          ...user,
          key: user.id,
          sno: index + 1,
          email: user.email,
          role: user.role,
          jdate: dayjs(user.createdAt).format("DD MMM YYYY"),
        }))}
        pagination={{ pageSize: 10 }}
        size="small"
        style={{ marginTop: "10px", marginLeft: "20px" }}
      />
      {/* Create User====================================== */}
      <Modal
        title="Add a New User"
        open={isCreateModelVisible}
        onCancel={() => {
          form.resetFields();
          setIsCreateModelVisible(false);
        }}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onCreateFinish}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter the task!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter the task!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please enter the task!" }]}
          >
            <Select>
              <Select.Option value="Admin">Admin</Select.Option>
              <Select.Option value="User">User</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter the task!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createUsers.isPending}
            >
              Add User
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => {
                form.resetFields();
                setIsCreateModelVisible(false);
              }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {/* Edit Modal==============================  */}
      <Modal
        title="Edit User"
        open={isModalVisible}
        onCancel={() => {
          form.resetFields();
          setIsModalVisible(false);
        }}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onUpdateFinish}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter the task!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter the task!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please enter the task!" }]}
          >
            <Select>
              <Select.Option value="Admin">Admin</Select.Option>
              <Select.Option value="User">User</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Joining Date"
            name="jdate"
            rules={[{ required: true, message: "Please enter the task!" }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateUsers.isPending}
            >
              Update
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => {
                form.resetFields();
                setIsModalVisible(false);
              }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminView;
