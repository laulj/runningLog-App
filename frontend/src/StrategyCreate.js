import React from 'react';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Space, Form, Input, Typography, Divider, List, Tag } from 'antd';
import { MinusCircleOutlined, PlusOutlined, DeleteOutlined, } from '@ant-design/icons';

// Destructure
const { Title } = Typography;
const { TextArea } = Input;

function StrategyCreate({ strategies, updateStates }) {
    const [form] = Form.useForm();

    const createStrategy = async (values) => {
        let ignore = false;
        if (!ignore) {
            // Wait for response
            const response = await fetch('http://127.0.0.1:8000/api/strategy/', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('access')}`,
                },
                body: JSON.stringify(values),
            });
            const data = await response.json();
            if (response.status !== 200) {
                // Return null if the response is an error
                return () => {
                    ignore = true;
                    return null;
                };
            }

            return () => {
                ignore = true;
                return data;
            };
        }
        return;
    };

    const onFinish = async (values) => {
        const promises = values.strategies.map(async value => {
            await createStrategy(value);
        })
        await Promise.all(promises);
        await updateStates();
    };

    const deleteStrategy = async (strategy_id) => {
        let ignore = false;

        if (!ignore) {
            // Wait for response
            const response = await fetch(`http://127.0.0.1:8000/api/strategy/${strategy_id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('access')}`,
                },
            });
            if (response.status !== 200) {
                // Return null if the response is an error
                return () => {
                    ignore = true;
                };
            }

            return () => {
                ignore = true;
            };
        }
        return;
    };

    const [loadings, setLoadings] = React.useState([]);

    const enterLoading = (strategy_id) => {
        setLoadings((prevLoadings) => {
            const newLoadings = [...prevLoadings];
            newLoadings[strategy_id] = true;
            return newLoadings;
        });

        setTimeout(() => {
            setLoadings((prevLoadings) => {
                const newLoadings = [...prevLoadings];
                newLoadings[strategy_id] = false;
                return newLoadings;
            });
            deleteStrategy(strategy_id)
                .then(() => updateStates());
        }, 2000);

    };


    return (
        <>
            <Divider orientation="left"><Title level={3}>New Strategy</Title></Divider>
            <Form form={form} layout="horizontal" size="small" onFinish={onFinish} autoComplete="off">
                <List
                    header={
                        <>
                            <Divider orientation="left" className="pb-1 mb-0">
                                Strategy
                            </Divider>
                        </>
                    }
                    footer={
                        <>
                            <Form.List name="strategies">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field) => (
                                            <Space key={field.key} className="d-flex flex-row align-items-center justify-content-between py-1 my-1">
                                                <div className="d-flex flex-row flex-wrap flex-lg-nowrap align-items-center justify-content-around">
                                                    <Form.Item
                                                        {...field}
                                                        key={[field.name, 'name']}
                                                        label="Name"
                                                        name={[field.name, 'name']}
                                                        className="pe-3"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...field}
                                                        key={[field.name, 'description']}
                                                        label="Description"
                                                        name={[field.name, 'description']}
                                                    >
                                                        <TextArea rows={2} />
                                                    </Form.Item>
                                                </div>
                                                <MinusCircleOutlined className="py-0 my-0 pb-2" onClick={() => remove(field.name)} />
                                            </Space>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" className="d-flex justify-content-center mt-3" onClick={() => { add() }} block>
                                                <PlusOutlined className="pt-1" /> Add Strategy
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                            <Button type="primary" size="big" htmlType="submit" block>
                                Submit
                            </Button>
                        </>
                    }
                    bordered
                    dataSource={strategies}
                    renderItem={
                        (item) => (
                            <List.Item className="d-flex flex-wrap justify-content-between">
                                {item.length !== 0 ? (
                                    <>
                                        <div className="d-flex flex-wrap align-items-center justify-content-between">
                                            <Tag color="blue" style={{ fontSize: 13 }}>{item.name}</Tag>
                                            <Typography.Text style={{ fontSize: 13 }}>{":  " + item.description}</Typography.Text>
                                        </div>
                                        <Button danger type="text" size="small" icon={<DeleteOutlined />} loading={loadings[item.id]} onClick={() => enterLoading(item.id)} />
                                    </>
                                ) : null
                                }
                            </List.Item>
                        )}
                    className="mb-4"
                />
            </Form>
        </>
    );
};

export default StrategyCreate;