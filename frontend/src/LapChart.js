import './index.css';
import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import faker from 'faker';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function LapChart({ logs, laps, }) {
    const [datasets, setDatasets] = React.useState([]);

    React.useEffect(() => {
        buildDatasets();
    }, [laps])
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Time (Mins)'
                }
            },
            x: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Lap (n-th)'
                }
            }
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    // This more specific font property overrides the global property
                    font: {
                        size: 11
                    },
                    boxHeight: 10,
                    boxWidth: 17.5,
                }
            },
            title: {
                display: true,
                text: 'Lap Statistics',
            },
        },
    };
    function ChartData(id, label, data) {
        const rgb = [faker.datatype.number({ min: 0, max: 255 }), faker.datatype.number({ min: 0, max: 255 }), faker.datatype.number({ min: 0, max: 255 })];
        this.id = id;
        this.label = label;
        this.data = data;
        this.borderColor = `rgb(${rgb[0]},${rgb[1]},${rgb[2]},0.5)`;
        this.backgroundColor = `rgb(${rgb[0]},${rgb[1]},${rgb[2]},0.35)`;
    }
    const labels = laps.map((lap) => { return lap.order });

    const buildDatasets = async () => {
        let Datasets = [];
        Datasets = logs.map((log) => { return new ChartData(log.id, log.date.split("T")[0], []) })
        Datasets.forEach(data => {
            laps.map((lap) => {
                if (parseInt(data.id) === parseInt(lap.log)) { data.data.push(lap.duration); }
            })
        })
        // return Datasets
        setDatasets(Datasets);
    }
    let data = {
        labels,
        datasets: datasets,
    };
    return (
        <div className="chart-container">
            <Line options={options} data={data} />
        </div>
    );
}

export default LapChart;