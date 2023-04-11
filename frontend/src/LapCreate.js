import React from 'react';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Space, Form, Input, InputNumber, Select, Typography, Divider, List, Tag } from 'antd';
import { MinusCircleOutlined, PlusOutlined, DeleteOutlined, } from '@ant-design/icons';

// Destructure
const { Option } = Select;
const { Title } = Typography;

function LapCreate({ logs, activeLog, setActiveLog, laps, updateStates }) {
    const [form] = Form.useForm();
    const minusRef = React.useRef([]);
    const [lapDurationStat, setLapDurationStat] = React.useState({
        validateStatus: 'success',
        errorMsg: null,
    });
    const [lapForm, setLapForm] = React.useState([]);
    React.useEffect(() => {
        /* Compute the total duration and raise validation error if it exceeds the log duration */
        let totalDuration = 0;
        lapForm.map((lap) => {
            totalDuration += lap.duration;
        })
        if (totalDuration > activeLog.duration) {
            setLapDurationStat({
                validateStatus: "error",
                errorMsg: `The total duration must not exceed ${activeLog.duration}mins`,
            })
        } else if (totalDuration === 0) {
            setLapDurationStat({
                validateStatus: 'error',
                errorMsg: "The total duration should not be 0",
            })
        } else {
            setLapDurationStat({
                validateStatus: 'success',
                errorMsg: null,
            })
        }
    }, [lapForm])

    const storeLapFormValues = (values) => {
        /* Pre-process the form values accordingly and store it */
        if ('laps' in values) {
            const tempLapForm = structuredClone(lapForm);
            values.laps.forEach((item, index) => {

                if (tempLapForm[index] === undefined) {
                    // Insert new item
                    if (item !== undefined) {
                        if (!("duration" in item)) {
                            tempLapForm[index] = { order: item.order, duration: 1 };
                        } else {
                            if (!("order" in item)) {
                                tempLapForm[index] = { order: lapCount + 1, duration: item.duration };
                            } else {
                                tempLapForm[index] = item;
                            }
                        }
                    } else {
                        tempLapForm[index] = { order: lapCount + 1, duration: 1 };
                    }
                } else {
                    if (item !== undefined) {
                        if (!("duration" in item)) {
                            tempLapForm[index].order = item.order;
                        } else {
                            if ("order" in item) {
                                tempLapForm[index] = item;
                            } else {
                                tempLapForm[index].duration = item.duration;
                            }
                        }
                    }
                }
            })
            setLapForm(tempLapForm);
        }
    }
    const onValuesChange = (values) => {
        storeLapFormValues(values);
    }

    const getHighestLapOrder = () => {
        if (laps.filter(lap => lap.log === activeLog.id).length !== 0) {
            const highest_order = laps.filter(lap => lap.log === activeLog.id).sort((a, b) => { return new Date(b.order) - new Date(a.order) })[0].order;
            return highest_order;
        } else {
            return -1;
        }
    }
    const [lapCount, setLapCount] = React.useState(getHighestLapOrder);
    React.useEffect(() => {
        // Set the first queried strategy as the default
        form.setFieldsValue({ Log: logs.length === 0 ? logs[0].id : activeLog.id });
        let falses = [];
        laps.filter(lap => lap.log === activeLog.id).map(() => {
            falses.push(false);
        })
        setLoadings([...loadings, falses]);
    }, [])
    React.useEffect(() => {
        // Set the first queried strategy as the default
        setLapCount(getHighestLapOrder());
    }, [activeLog])
    const createLap = async (log, values) => {
        let ignore = false;
        values.log = log;

        if (!ignore) {
            // Wait for response
            const response = await fetch('http://127.0.0.1:8000/api/lap/', {
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

    const handleLogChange = (value) => {
        // Remove the uninitialized form
        for (let ref in minusRef.current) {
            if (minusRef.current[minusRef.current.length - 1 - ref] !== null) {
                minusRef.current[minusRef.current.length - 1 - ref].click();
            }
        }
        // Set the new activeLog
        logs.map((log) => {
            if (log.id === value) {
                setActiveLog({
                    "id": value,
                    "distance": log.distance,
                    "duration": log.duration,
                });
            }
        })
    }

    const onFinish = async (values) => {
        const promises = values.laps.map(async value => {
            await createLap(values.Log, value);
        })
        await Promise.all(promises);
        updateStates();
        logs.map((log) => {
            if (log.id === values.Log) {
                setActiveLog({
                    "id": values.Log,
                    "distance": log.distance,
                    "duration": log.duration,
                });
            }
        })
    };

    const deleteLap = async (lap_id) => {
        let ignore = false;

        if (!ignore) {
            // Wait for response
            const response = await fetch(`http://127.0.0.1:8000/api/lap/${lap_id}`, {
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

    const enterLoading = (lap_id) => {
        setLoadings((prevLoadings) => {
            const newLoadings = [...prevLoadings];
            newLoadings[lap_id] = true;
            return newLoadings;
        });

        setTimeout(() => {
            setLoadings((prevLoadings) => {
                const newLoadings = [...prevLoadings];
                newLoadings[lap_id] = false;
                return newLoadings;
            });
            deleteLap(lap_id)
                .then(() => updateStates());
        }, 2000);

    };

    return (
        <>
            <Divider orientation="left"><Title level={3}>New Lap</Title></Divider>
            <Form form={form} layout="horizontal" size="small" onFinish={onFinish} onValuesChange={onValuesChange} autoComplete="off">
                <List
                    header={
                        <>
                            <Divider orientation="left" className="pb-1 mb-0">
                                <Form.Item
                                    label="Log"
                                    name='Log'
                                    rules={[{ required: true, message: 'Required' }]}
                                    className="py-0 my-0 pe-5"
                                    initialValue={logs.length === 0 ? logs[0].id : (activeLog.id === null ? null : activeLog.id)}
                                >
                                    <Select disabled={!logs.length === 0} style={{ width: 120 }} onChange={handleLogChange}>
                                        {logs.map(log => (
                                            <Option key={log.id} value={log.id}>{log.date.split('T')[0]}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Divider>
                            {activeLog.id !== null ? (
                                <div className="text-muted" style={{ fontSize: 12.5 }}>
                                    Completed {activeLog.distance}m in {activeLog.duration}mins.
                                </div>) : null}
                        </>
                    }
                    footer={
                        <>
                            <Form.List name="laps">
                                {(fields, { add, remove }) => (
                                    <>
                                        <div className="lapAddFields">
                                            {fields.map((field, index) => (
                                                <Space key={field.key} className="d-flex flex-row align-items-center justify-content-start py-1 my-1">
                                                    <div className="d-flex flex-row flex-wrap flex-lg-nowrap align-items-center justify-content-start">
                                                        <Form.Item
                                                            {...field}
                                                            key={[field.name, 'order']}
                                                            label="Lap"
                                                            name={[field.name, 'order']}
                                                            className="py-0 my-1 me-1"
                                                            style={{ width: 75 }}
                                                            initialValue={lapCount}
                                                        >
                                                            <Input disabled={true} />
                                                        </Form.Item>

                                                        <Form.Item
                                                            {...field}
                                                            key={[field.name, 'duration per lap']}
                                                            label="Duration"
                                                            name={[field.name, 'duration']}
                                                            rules={[{ required: true, message: 'Required' }]}
                                                            help={lapDurationStat.errorMsg || null}
                                                            validateStatus={lapDurationStat.validateStatus}
                                                            initialValue={1}
                                                            className="py-0 my-0"
                                                        >
                                                            <InputNumber
                                                                min={1}
                                                                addonAfter="mins"
                                                                style={{ width: 150 }}
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                    <MinusCircleOutlined key={index} ref={el => minusRef.current[index] = el} className="py-0 my-0 pb-2" onClick={() => remove(field.name)} />
                                                </Space>
                                            ))}
                                        </div>
                                        <Form.Item>
                                            <Button type="dashed" className="d-flex justify-content-center mt-3" onClick={() => { add(); setLapCount(lapCount + 1); }} block>
                                                <PlusOutlined className="pt-1" /> Add Lap
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
                    dataSource={laps.filter(lap => lap.log === activeLog.id)}
                    renderItem={
                        (item) => (
                            <List.Item key={item.id} className="d-flex flex-wrap justify-content-between">
                                {item.length !== 0 ? (
                                    <>
                                        <Typography.Text style={{ fontSize: 13 }}>Lap <Tag color="blue" style={{ fontSize: 12 }}>{item.order}</Tag>{":  " + item.duration} min(s).</Typography.Text>
                                        <Button danger id={item.id} type="text" size="small" icon={<DeleteOutlined />} loading={loadings[item.id]} onClick={() => enterLoading(item.id)} />
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

export default LapCreate;