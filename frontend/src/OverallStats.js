import React from 'react';
import './index.css';
import { Col, Row, Statistic } from 'antd';
import CountUp from 'react-countup';

const formatter = (value) => <CountUp end={value} separator="," />;

function OverallStats({ logs }) {
    const [stats, setStats] = React.useState({ 'distance': 0, 'time': 0 });
    React.useEffect(() => {
        calculateTDistanceTravelled();
    }, [logs])
    const calculateTDistanceTravelled = () => {
        let distance = 0;
        let time = 0;
        logs.map((log) => {
            distance += log.distance;
            time += log.duration;
        })
        setStats({
            'distance': distance,
            'time': time,
        });
    }

    return (
        <Row gutter={16}>
            <Col span={8}>
                <Statistic title="Total distance travelled (m)" value={stats.distance} formatter={formatter} />
            </Col>
            <Col span={8}>
                <Statistic title="Total time spent (mins)" value={stats.time} precision={2} formatter={formatter} />
            </Col>
            <Col span={8}>
                <Statistic title="Average speed (km/h)" value={stats.distance / 1000 / (stats.time / 60)} precision={2} formatter={formatter} />
            </Col>
        </Row>
    );
};

export default OverallStats;