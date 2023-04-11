// Client Login
import React from 'react';
import { Button, Checkbox, Form, Input } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

function LoginForm({ logIn, loginStatus, setLoginStatus }) {
    const onFinish = (values) => {
        // Try logging user in
        logIn(values);
    };
    const onCheckBoxChange = (value) => {
        setLoginStatus(prevLoginStatus => ({
            ...prevLoginStatus,
            remember: value.target.checked,
        }));
    };

    return (
        <Form
            name="basic"
            style={{ minWidth: 200 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
        >
            <Form.Item
                name="username"
                validateStatus={loginStatus.validateStatus}
                rules={[{ required: true, message: 'Please input your username!' }]}
                initialValue={loginStatus.remember ? (localStorage.getItem('username') === null ? null : localStorage.getItem('username')) : null}
            >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} />
            </Form.Item>

            <Form.Item
                name="password"
                validateStatus={loginStatus.validateStatus}
                help={loginStatus.errorMsg}
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" wrapperCol={{ offset: 5, span: 16 }} className="mb-2 pb-0">
                <Checkbox onChange={onCheckBoxChange}>Remember me</Checkbox>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    )
};

export default LoginForm;