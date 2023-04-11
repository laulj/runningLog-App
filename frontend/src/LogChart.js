import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import faker from 'faker';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function LogChart({ logs }) {
    const [logDataset, setLogDataset] = React.useState([]);
    React.useEffect(() => {
        buildDatasets();
    }, [logs])
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Distance (m)'
                }
            },
            x: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'day'
                }
            }
        },
        plugins: {
            legend: false,
            title: {
                display: true,
                text: 'Log Statistics',
            },
        },
    };

    const formatDate = (date) => {
        date = new Date(date);
        const year = String(date.getUTCFullYear()).slice(2, 4);
        const month = date.getUTCMonth();
        const day = date.getUTCDay();
        date = `${day}/${month}/${year}`
        return date;
    }
    const labels = logs.map((log) => { return formatDate(log.date) });

    function ChartData(data) {
        const rgb = [faker.datatype.number({ min: 0, max: 255 }), faker.datatype.number({ min: 0, max: 255 }), faker.datatype.number({ min: 0, max: 255 })];
        this.data = data;
        this.borderColor = `rgb(${rgb[0]},${rgb[1]},${rgb[2]},0.5)`;
        this.backgroundColor = `rgb(${rgb[0]},${rgb[1]},${rgb[2]},0.35)`;
    }

    const buildDatasets = async () => {
        let Dataset = new ChartData([]);
        logs.map((log) => {
            Dataset.data.push(log.distance);
        })
        //return Datasets
        setLogDataset(Dataset);
    }

    const data = {
        labels,
        datasets: [logDataset],
    };

    return (
        <div className="chart-container">
            <Bar options={options} data={data} />
        </div>
    );
}

export default LogChart;