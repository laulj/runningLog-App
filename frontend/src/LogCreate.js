import React from 'react';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, DatePicker, Space, Form, Input, InputNumber, Select, Typography, Empty, Divider, List, Tag } from 'antd';
import { MinusCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

// Destructure
const { Option } = Select;
const { Title } = Typography;

function LogCreate({ strategies, activeStrat, logs, updateStates, handleStratChange }) {
    const [form] = Form.useForm();
    const [logForm, setLogForm] = React.useState([]);
    const [logDateStatus, setLogDateStatus] = React.useState([{
        validateStatus: 'success',
        errorMsg: null,
    }]);

    React.useEffect(() => {
        // Set the first queried strategy as the default
        form.setFieldsValue({ Strategy: strategies.length === 0 ? strategies[0].id : activeStrat });
    }, [])

    const validateLogDate = (date) => {
        let validity = true;
        let msg = {};

        logs.map((log) => {
            if (log.date.split("T")[0] === date) {
                validity = false;
                msg = {
                    validateStatus: 'error',
                    errorMsg: `The record on ${date} already exists.`,
                };
            }
        })
        if (validity) {
            msg = {
                validateStatus: 'success',
                errorMsg: null,
            };
        }
        return msg;
    };
    React.useEffect(() => {
        /*  
            Compute the date and raise validation error if it is repeating.
            Only one record for each date.
         */
        let tempLogDate = structuredClone(logDateStatus);
        logForm.map((log, index) => {
            if (log.date !== null) {
                tempLogDate[index] = { ...validateLogDate(log.date) };
            } else {
                tempLogDate[index] = {
                    validateStatus: 'success',
                    errorMsg: null,
                };
            }
        })
        setLogDateStatus(tempLogDate);
    }, [logForm])

    const storeLogFormValues = (values) => {
        /* Pre-process the form values accordingly and store it */
        if ('logs' in values) {
            const tempLogForm = structuredClone(logForm);
            values.logs.forEach((item, index) => {

                if (tempLogForm[index] === undefined) {
                    // Insert new item
                    if (item !== undefined) {
                        if (!("date" in item)) {
                            tempLogForm[index] = { date: null };
                        } else {
                            tempLogForm[index] = { date: item.date.toISOString().split("T")[0] };
                        }
                    } else {
                        tempLogForm[index] = { date: null };
                    }
                } else {
                    // Update item
                    if (item !== undefined) {
                        if ("date" in item) {
                            tempLogForm[index].date = item.date.toISOString().split("T")[0];
                        }
                    }
                }
            })
            setLogForm(tempLogForm);
        }
    };

    const onValuesChange = (values) => {
        storeLogFormValues(values);
    };

    const createLog = async (strategy, values) => {
        let ignore = false;
        values.strategy = `http://127.0.0.1:8000/api/strategy/${strategy}/`;
        if (!ignore) {
            // Wait for response
            const response = await fetch('http://127.0.0.1:8000/api/log/', {
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
        const promises = values.logs.map(async value => {
            const response = validateLogDate(value.date.toISOString().split("T")[0]);
            if (response.validateStatus === 'success') {
                await createLog(values.Strategy, value);
            }
        })
        await Promise.all(promises);
        updateStates();
    };

    const deleteLog = async (log_id) => {
        let ignore = false;

        if (!ignore) {
            // Wait for response
            const response = await fetch(`http://127.0.0.1:8000/api/log/${log_id}`, {
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

    const enterLoading = (log_id) => {
        setLoadings((prevLoadings) => {
            const newLoadings = [...prevLoadings];
            newLoadings[log_id] = true;
            return newLoadings;
        });

        setTimeout(() => {
            setLoadings((prevLoadings) => {
                const newLoadings = [...prevLoadings];
                newLoadings[log_id] = false;
                return newLoadings;
            });
            deleteLog(log_id)
                .then(() => updateStates());
        }, 2000);

    };

    return (
        <>
            <Divider orientation="left"><Title level={3}>New Log</Title></Divider>
            <Form form={form} layout="horizontal" size="small" onFinish={onFinish} onValuesChange={onValuesChange} autoComplete="off">
                <List
                    header={
                        <>
                            <Divider orientation="left" className="pb-1 mb-0">
                                <Form.Item
                                    label="Strat"
                                    name='Strategy'
                                    rules={[{ required: true, message: 'Required' }]}
                                    className="py-0 my-0 pe-5"
                                >
                                    <Select disabled={!strategies.length === 0} style={{ width: 150 }} onChange={handleStratChange}>
                                        {strategies.map(strategy => (
                                            <Option key={strategy.id} value={strategy.id}>{strategy.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Divider>
                            {activeStrat !== null ? (
                                <div className="text-muted" style={{ fontSize: 12.5 }}>{
                                    strategies.map((strat) => (
                                        strat.id === activeStrat ? ("Description: " + strat.description) : null
                                    ))
                                }</div>) : null}
                        </>
                    }
                    footer={
                        <>
                            <Form.List name="logs">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field, index) => (
                                            <Space key={field.key} className="d-flex flex-row align-items-center justify-content-between py-1 my-1">
                                                <div className="d-flex flex-row flex-wrap flex-lg-nowrap align-items-center justify-content-start">
                                                    <Form.Item
                                                        {...field}
                                                        key={[field.name, 'date']}
                                                        name={[field.name, 'date']}
                                                        label="Date"
                                                        rules={[{ type: 'object', required: true, message: 'Required' }]}
                                                        help={logDateStatus.length - 1 >= index ? ("errorMsg" in logDateStatus[index] ? logDateStatus[index].errorMsg : null) : null}
                                                        validateStatus={logDateStatus.length - 1 >= index ? ("validateStatus" in logDateStatus[index] ? logDateStatus[index].validateStatus : null) : null}
                                                        className="py-0 my-1 me-1"
                                                    >
                                                        <DatePicker
                                                            size="small"
                                                        />
                                                    </Form.Item>

                                                    <Form.Item label="Record" className="py-0 my-1 me-1">
                                                        <Input.Group compact style={{ width: 210 }} className="py-0 my-0">
                                                            <Form.Item
                                                                {...field}
                                                                noStyle
                                                                key={[field.name, 'duration']}
                                                                label="Duration"
                                                                name={[field.name, 'duration']}
                                                                rules={[{ required: true, message: 'Required' }]}
                                                                className="py-0 my-0"
                                                            >
                                                                <InputNumber
                                                                    min={1}
                                                                    addonAfter="mins"
                                                                    style={{ width: '50%' }}
                                                                />
                                                            </Form.Item>

                                                            <Form.Item
                                                                {...field}
                                                                noStyle
                                                                key={[field.name, 'distance']}
                                                                label="Distance"
                                                                name={[field.name, 'distance']}
                                                                rules={[{ required: true, message: '' }]}
                                                                className="py-0 my-0"
                                                            >
                                                                <InputNumber
                                                                    min={1}
                                                                    addonAfter="m"
                                                                    style={{ width: '50%' }}
                                                                />
                                                            </Form.Item>
                                                        </Input.Group>
                                                    </Form.Item>

                                                    <Form.Item
                                                        {...field}
                                                        key={[field.name, 'note']}
                                                        label="Note"
                                                        name={[field.name, 'note']}
                                                        className="py-0 my-1 me-1"
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                </div>
                                                <MinusCircleOutlined className="py-0 my-0 pb-2" onClick={() => remove(field.name)} />
                                            </Space>
                                        ))}

                                        <Form.Item className="">
                                            <Button type="dashed" className="d-flex justify-content-center mt-3" onClick={() => add()} block>
                                                <PlusOutlined className="pt-1" /> Add Log
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
                    dataSource={logs}
                    renderItem={
                        (item) => (
                            <List.Item key={item.id} className="d-flex flex-nowrap align-items-center justify-content-between">
                                {item.length !== 0 ? (
                                    <>
                                        <div className="d-flex flex-wrap align-items-center justify-content-between">
                                            <Tag color="blue" style={{ fontSize: 12 }}>{item.date.split("T")[0]}</Tag>
                                            <Typography.Text style={{ fontSize: 12 }}>Completed {item.distance}m in {item.duration}mins.</Typography.Text>
                                        </div>
                                        <div className="text-muted text-truncate" style={{ fontSize: 12 }}>{item.note ? "Note: " + item.note : null}</div>
                                        <Button danger id={item.id} type="text" size="small" icon={<DeleteOutlined />} loading={loadings[item.id]} onClick={() => enterLoading(item.id)} />
                                    </>
                                ) : null
                                }
                            </List.Item>
                        )}
                    className="mb-4"
                />
                {strategies.length === 0 ? <Empty /> : null}

            </Form>
        </>
    );
};

export default LogCreate;