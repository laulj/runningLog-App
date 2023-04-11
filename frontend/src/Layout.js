import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import React from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import OverallStats from './OverallStats';
import MyCalendar from './Calendar';
import LogChart from './LogChart';
import LapChart from './LapChart';
import StrategyCreate from './StrategyCreate';
import LogCreate from './LogCreate';
import LapCreate from './LapCreate';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, HomeOutlined, LineChartOutlined, FormOutlined } from '@ant-design/icons';
import { Layout, Menu, Switch, Button, theme, Typography, Dropdown, Select, Result, Skeleton, } from "antd";

// Destructuring
const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;
const { Option } = Select;

function MyLayout({ currentTheme, changeTheme, configCSSManually }) {
    const { token } = theme.useToken();
    const [collapsed, setCollapsed] = React.useState(false);
    const [current, setCurrent] = React.useState('1');
    const [loginStatus, setLoginStatus] = React.useState(() => {
        if (localStorage.getItem('access') === null) {
            return ({
                status: false,
                remember: true,
                username: null,
                validateStatus: 'success',
                errorMsg: null,
            })
        }
        return ({
            status: true,
            remember: true,
            username: localStorage.username,
            validateStatus: 'success',
            errorMsg: null,
        })
    });
    React.useEffect(() => {
        if (!loginStatus.status) {
            // Modify the css when dropdown changes from logout -> login
            configCSSManually();
        } else { updateStates(); }

    }, [loginStatus])

    const menuOnClick = (e) => {
        setCurrent(e.key);
    };

    const items = [{ label: 'Logout', key: '1', },];
    const handleAuthData = (authData) => {
        localStorage.setItem('access', authData.access)
        localStorage.setItem('refresh', authData.refresh)
    };
    const logIn = async (values) => {
        let ignore = false;
        if (!ignore) {

            // Wait for response
            const response = await fetch('http://127.0.0.1:8000/api/token/', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(values)
            });
            const data = await response.json();
            // Store access and refresh tokens
            handleAuthData(data);
            if (response.status !== 200) {
                setLoginStatus({
                    status: false,
                    remember: loginStatus.remember,
                    username: null,
                    validateStatus: "error",
                    errorMsg: "Wrong username or password.",
                })
                // Return null if the response is an error
                return () => {
                    ignore = true;
                    return null;
                };
            }
            setLoginStatus({
                status: true,
                remember: loginStatus.remember,
                username: values.username,
                validateStatus: "success",
                errorMsg: null,
            })
            if (loginStatus.remember) {
                localStorage.setItem('username', values.username);
            }

            const dropdown_menu = document.querySelector('.dropdown-login-menu');
            // Close the login dropdown menu once the form is submitted
            if (dropdown_menu) { dropdown_menu.classList.remove('show'); }

            return () => {
                ignore = true;
                return data;
            };
        }
        return;
    };
    const logOut = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        // Remove 'username' if remember is false
        if (!loginStatus.remember && localStorage.getItem('username') !== null) {
            localStorage.removeItem("username");
        }
        setLoginStatus({
            status: false,
            remember: loginStatus.remember,
            username: null,
            validateStatus: 'success',
            errorMsg: null,
        })
    };
    const onClick = () => {
        logOut();
    };

    const validCodeReg = /20[0-9]/;
    const invalidServerCodeReg = /50[0-9]/;

    const [fetchInfo, setFetchInfo] = React.useState({
        strategy: {
            state: 400,
            errorMsg: {},
        },
        log: {
            state: 400,
            errorMsg: {},
        },
        lap: {
            state: 400,
            errorMsg: {},
        },
    });
    const [strategies, setStrategies] = React.useState([]);
    const [activeStrat, setActiveStrat] = React.useState(null);
    const [logs, setLogs] = React.useState([]);
    const [activeLog, setActiveLog] = React.useState({
        "id": null,
        "distance": null,
        "duration": null,
    });
    const [laps, setLaps] = React.useState([]);
    React.useEffect(() => {
        if (loginStatus.status !== false) {
            getStrategies();
        }
    }, []);

    React.useEffect(() => {
        if (loginStatus.status !== false) {
            updateStates();
        }
    }, [activeStrat]);

    React.useEffect(() => {
        // If 'access' and 'refresh' tokens are expired, log user out
        if (fetchInfo.strategy.errorMsg.detail !== undefined || fetchInfo.log.errorMsg.detail !== undefined || fetchInfo.lap.errorMsg.detail !== undefined) {
            logOut();
        } else if (localStorage.getItem('access') === null || localStorage.getItem('access') === undefined) {
            logOut();
        }
    }, [fetchInfo]);

    const updateStates = async () => {
        // Since the query states are chained, updater functions are used
        await getStrategies();
        if (activeStrat !== null) {
            // Query all logs respected with $activeStrat
            await getLogs();
            await getLaps();
        }
    };

    const handleStratChange = (value) => {
        setActiveStrat(value);
    };

    const getLaps = async () => {
        let ignore = false;

        if (!ignore) {
            // Wait for response
            const response = await fetch(`http://127.0.0.1:8000/api/lap?strategy=${activeStrat}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem('access')}`
                }
            });
            const data = await response.json();

            setFetchInfo(prevfetchInfo => ({
                ...prevfetchInfo,
                lap: {
                    ...prevfetchInfo.lap,
                    state: response.status,
                },
            }));
            if (response.status !== 200) {
                setFetchInfo(prevfetchInfo => ({
                    ...prevfetchInfo,
                    lap: {
                        state: response.status,
                        errorMsg: data
                    },
                }));
                // Return null if the response is an error
                return () => {
                    ignore = true;
                    return null;
                };
            } else {
                // Sort by data.order in ascending order
                data.sort((a, b) => { return a.order - b.order });
                setLaps(data);
            }

            return () => {
                ignore = true;
                return data;
            };
        }
        return;
    };
    const getLogs = async () => {
        let ignore = false;

        if (!ignore) {
            // Wait for response
            const response = await fetch(`http://127.0.0.1:8000/api/log?strategy=${activeStrat}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem('access')}`
                }
            });
            const data = await response.json();

            setFetchInfo(prevfetchInfo => ({
                ...prevfetchInfo,
                log: {
                    ...prevfetchInfo.log,
                    state: response.status,
                },
            }));
            if (response.status !== 200) {
                // Reset activeLog if fetch fails
                setActiveLog(prevActiveLog => ({
                    "id": null,
                    "distance": null,
                    "duration": null,
                }));

                setFetchInfo(prevfetchInfo => ({
                    ...prevfetchInfo,
                    log: {
                        state: response.status,
                        errorMsg: data
                    }
                }));

                // Return null if the response is an error
                return () => {
                    ignore = true;
                    return null;
                };
            } else {
                // Set the default selected log for the first time
                if (data.length === 0) {
                    // Reset activeLog if fetch fails
                    setActiveLog(prevActiveLog => ({
                        "id": null,
                        "distance": null,
                        "duration": null,
                    }));
                } else if (activeLog.id === null && data.length !== 0) {
                    setActiveLog(prevActiveLog => ({
                        "id": data[0].id,
                        "distance": data[0].distance,
                        "duration": data[0].duration,
                    }));
                }
                // Sort by data.order in ascending order
                data.sort((a, b) => { return new Date(b.date) - new Date(a.date) });
                setLogs(data);
            }

            return () => {
                ignore = true;
                return data;
            };
        }
        return;
    };
    const getStrategies = async () => {
        let ignore = false;

        if (!ignore) {
            // Wait for response
            const response = await fetch('http://127.0.0.1:8000/api/strategy/', {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem('access')}`,
                }
            });
            const data = await response.json();

            setFetchInfo(prevfetchInfo => ({
                ...prevfetchInfo,
                strategy: {
                    ...prevfetchInfo.strategy,
                    state: response.status,
                }
            }));
            if (response.status !== 200) {
                setFetchInfo(prevfetchInfo => ({
                    ...prevfetchInfo,
                    strategy: {
                        state: response.status,
                        errorMsg: data
                    }
                }));
                // Return null if the response is an error
                return () => {
                    ignore = true;
                    return null;
                };
            } else {
                setStrategies(data);
                // Set the first queried strategy as the default for the first time
                if (data.length === 0) {
                    // Reset activeLog if no data
                    setActiveStrat(null);
                }
                else if (activeStrat === null && data.length !== 0) {
                    setActiveStrat(data[0].id);
                }
            }

            return () => {
                ignore = true;
                return data;
            };
        }
        return;
    };

    // ----------Menu Variables----------
    const [menu, setMenu] = React.useState('1');
    const SiderItems = [
        {
            key: String(1),
            icon: React.createElement(HomeOutlined),
            label: 'Home',
        },
        {
            key: String(2),
            icon: React.createElement(LineChartOutlined),
            label: 'Chart',
        },
        {
            key: String(3),
            icon: React.createElement(FormOutlined),
            label: 'Add',
        },
    ];
    const menuOnSelect = (values) => {
        setMenu(values.key);
    };
    return (
        <Layout>
            <Sider
                trigger={null} collapsible collapsed={collapsed}
                breakpoint="lg"
                onBreakpoint={(broken) => { setCollapsed(true); }}
                theme={currentTheme === theme.darkAlgorithm ? 'dark' : 'light'}
            >
                <div className="d-flex flex-row align-items-center justify-content-around py-2" >
                    {!collapsed ? (
                        <>
                            <Title level={5} className="pt-2">Logger</Title>
                            <Switch
                                checked={currentTheme.algorithm === theme.darkAlgorithm}
                                onChange={changeTheme}
                                checkedChildren="Dark"
                                unCheckedChildren="Light"
                            />
                        </>
                    ) : null
                    }
                </div>
                <Menu
                    theme={currentTheme === theme.darkAlgorithm ? 'dark' : 'light'}
                    mode="inline"
                    onClick={menuOnClick}
                    defaultSelectedKeys={['1']}
                    selectedKeys={[current]}
                    items={SiderItems}
                    onSelect={menuOnSelect}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: token.colorBgContainer }}>
                    <div className={loginStatus.status === true ? 'd-flex flex-row justify-content-between align-items-center pt-3' : 'd-flex flex-row justify-content-between align-items-center'}>
                        {
                            // Menu collapse button
                            React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                className: 'trigger',
                                onClick: () => setCollapsed(!collapsed),
                            })
                        }
                        {
                            // If the user is not logged in, show "login"
                            loginStatus.status === false ? (
                                <div className="dropdown dropdown-login me-4">
                                    <button
                                        className="btn btn-sm btn-primary dropdown-toggle"
                                        type="button"
                                        id="dropdownLoginMenuButton1"
                                        data-bs-toggle="dropdown"
                                        data-bs-auto-close="outside"
                                        aria-expanded="false"
                                    >
                                        <UserOutlined className="me-2" />{loginStatus.status === false ? "Login" : localStorage.username}
                                    </button>
                                    <ul className="dropdown-menu dropdown-login-menu px-2" aria-labelledby="dropdownLoginMenuButton1">
                                        <li className="login-item-list">
                                            <span className="dropdown-item dropdown-login-item">
                                                <LoginForm logIn={logIn} loginStatus={loginStatus} setLoginStatus={setLoginStatus} />
                                            </span>
                                        </li>

                                    </ul>
                                </div>) : (
                                <Dropdown menu={{ items, onClick }} placement="bottomRight" className="me-4">
                                    <Button type="primary" value="small">{localStorage.username}</Button>
                                </Dropdown>)
                        }
                    </div>
                </Header>
                <Content style={{ margin: '24px 16px 0', }}>
                    <div style={{ padding: 24, minHeight: 480, background: token.colorBgContainer, }}>
                        {/*Main Content*/}
                        {
                            // If the user is login, show the app content
                            loginStatus.status !== false ? (
                                <>
                                    {/*validate lap duration(using max)*/}
                                    {
                                        // If the either of data fetching has failed, 
                                        validCodeReg.test(fetchInfo.strategy.state) ? (
                                            menu === '1' ? (
                                                <>
                                                    <div className="mb-3" >
                                                        <Select disabled={!strategies.length === 0} style={{ width: 150 }} onChange={handleStratChange} defaultValue={activeStrat === null ? null : activeStrat}>
                                                            {strategies.length !== 0 ? (strategies.map(strategy => (
                                                                <Option key={strategy.id} value={strategy.id}>{strategy.name}</Option>
                                                            ))) : null}
                                                        </Select>
                                                    </div>
                                                    <div className="mb-3" >
                                                        <OverallStats logs={logs} />
                                                    </div>
                                                    <div className="p-lg-3" >
                                                        <MyCalendar logs={logs} />
                                                    </div>
                                                </>) : (
                                                menu === '2' ? (validCodeReg.test(fetchInfo.log.state) && activeStrat !== null ? (
                                                    <>
                                                        <Select disabled={!strategies.length === 0} style={{ width: 150 }} onChange={handleStratChange} defaultValue={strategies.length === 0 ? strategies[0].id : activeStrat}>
                                                            {strategies.map(strategy => (
                                                                <Option key={strategy.id} value={strategy.id}>{strategy.name}</Option>
                                                            ))}
                                                        </Select>
                                                        <div className="mb-3">
                                                            <LogChart strategies={strategies} setStrategies={setStrategies} activeStrat={activeStrat} setActiveStrat={setActiveStrat} logs={logs} setLogs={setLogs} laps={laps} setLaps={setLaps} />
                                                        </div>
                                                        <div className="mb-3">
                                                            <LapChart strategies={strategies} setStrategies={setStrategies} activeStrat={activeStrat} setActiveStrat={setActiveStrat} logs={logs} setLogs={setLogs} laps={laps} setLaps={setLaps} />
                                                        </div>
                                                    </>
                                                ) : <Result status="info" title="Add some strategies and logs before the data can be plotted." />
                                                ) : (
                                                    menu === '3' ? (
                                                        <>
                                                            <StrategyCreate strategies={strategies} setStrategies={setStrategies} activeStrat={activeStrat} setActiveStrat={setActiveStrat} logs={logs} setLogs={setLogs} laps={laps} setLaps={setLaps} updateStates={updateStates} handleStratChange={handleStratChange} />
                                                            {validCodeReg.test(fetchInfo.strategy.state) && activeStrat !== null ? (
                                                                <div className="mb-3">
                                                                    <LogCreate strategies={strategies} setStrategies={setStrategies} activeStrat={activeStrat} setActiveStrat={setActiveStrat} logs={logs} setLogs={setLogs} laps={laps} setLaps={setLaps} updateStates={updateStates} handleStratChange={handleStratChange} />
                                                                </div>) : null
                                                            }
                                                            {validCodeReg.test(fetchInfo.log.state) && activeLog.id !== null ? (
                                                                <div className="mb-3">
                                                                    <LapCreate strategies={strategies} setStrategies={setStrategies} activeStrat={activeStrat} setActiveStrat={setActiveStrat} logs={logs} setLogs={setLogs} activeLog={activeLog} setActiveLog={setActiveLog} laps={laps} setLaps={setLaps} getLaps={getLaps} updateStates={updateStates} />
                                                                </div>) : null
                                                            }
                                                        </>
                                                    ) : <Skeleton active paragraph={{ rows: 5 }} />
                                                )
                                            )
                                        ) : (
                                            // If the HTTP code is 500 or server error, display the corresponding warnings
                                            invalidServerCodeReg.test(fetchInfo.strategy.state) || invalidServerCodeReg.test(fetchInfo.log.state) || invalidServerCodeReg.test(fetchInfo.lap.state) ?
                                                <Result status="warning" title="There are some problems on the server-side." /> : <Result status="warning" title="There are some problems with your internet connection." />
                                        )
                                    }
                                </>
                            ) : (<>
                                <RegisterForm logIn={logIn} />
                            </>
                            )
                        }
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center', }}>
                    Running Log ©2023 Created by <a href="https://www.instagram.com/lokjing/">laulj</a>
                </Footer>
            </Layout>
        </Layout >
    );
};
export default MyLayout;