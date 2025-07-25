import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Input, DatePicker, TimePicker, message } from 'antd';

const AdminSeminarSettings = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchSeminarSettings();
    }
  }, [visible]);

  const fetchSeminarSettings = async () => {
    try {
      const response = await axios.get('/api/admin/seminar-settings');
      form.setFieldsValue(response.data);
    } catch (error) {
      message.error('Failed to fetch seminar settings');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await axios.put('/api/admin/seminar-settings', values);
      message.success('Seminar settings updated successfully');
      onClose();
    } catch (error) {
      message.error('Failed to update seminar settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      title="Edit Seminar Settings"
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ date: null, time: null }}
      >
        <Form.Item name="title" label="Seminar Title" rules={[{ required: true, message: 'Please enter the seminar title' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select a date' }]}>
          <DatePicker />
        </Form.Item>
        <Form.Item name="time" label="Time" rules={[{ required: true, message: 'Please select a time' }]}>
          <TimePicker />
        </Form.Item>
        <Form.Item name="location" label="Location" rules={[{ required: true, message: 'Please enter the location' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="instructor" label="Instructor">
          <Input />
        </Form.Item>
        <Form.Item name="maxParticipants" label="Max Participants" rules={[{ type: 'number', min: 1, message: 'Please enter a valid number' }]}>
          <Input type="number" />
        </Form.Item>
        <Form.Item name="registrationDeadline" label="Registration Deadline">
          <DatePicker />
        </Form.Item>
        <Form.Item name="whatsappNumber" label="WhatsApp Number">
          <Input />
        </Form.Item>
        <Form.Item name="whatsappGroupLink" label="WhatsApp Group Link">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminSeminarSettings;
