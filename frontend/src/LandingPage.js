import React from "react"
import "./LandingPage.css"
import { Button, Space, Tag, Typography, theme } from "antd"
import {
    BgColorsOutlined,
    DashboardOutlined,
    LineChartOutlined,
    LoginOutlined,
    SlidersOutlined,
    ThunderboltOutlined,
    UserAddOutlined,
} from "@ant-design/icons"

const { Paragraph, Title } = Typography

// Each entry mirrors a screen that already ships in the app:
// Home (OverallStats + MyCalendar), Chart (LogChart + LapChart), and Add (StrategyCreate + LogCreate + LapCreate).
const FEATURES = [
    {
        icon: <DashboardOutlined aria-hidden="true" />,
        title: "Daily Dashboard",
        body: "See the total distance travelled, the total time spent, and the average speed of the strategy you pick, next to a calendar that summarises the month.",
    },
    {
        icon: <LineChartOutlined aria-hidden="true" />,
        title: "Progress Charts",
        body: "Plot the distance of every run against its date in a histogram, then compare the time taken for each lap of a session.",
    },
    {
        icon: <SlidersOutlined aria-hidden="true" />,
        title: "Strategies, Logs & Laps",
        body: "Group your runs into strategies to compare training plans. Add or remove strategies, logs, and laps in bulk from one screen.",
    },
    {
        icon: <BgColorsOutlined aria-hidden="true" />,
        title: "Light & Dark Themes",
        body: "The interface matches your browser theme on the first visit, and the sidebar switch flips it whenever you prefer to run dark.",
    },
]

const STEPS = [
    {
        title: "Create a Strategy",
        body: "Name a training plan and describe what you are working towards.",
    },
    {
        title: "Log Each Session",
        body: "Record the date, distance, and duration, then add the time taken for every lap.",
    },
    {
        title: "Review Your Progress",
        body: "Switch between strategies to compare totals, calendars, and charts side by side.",
    },
]

const CAPABILITIES = ["JWT Secured", "Multiple Strategies", "Lap Splits", "Follows Browser Theme"]

const TECHNOLOGIES = ["React", "Ant Design", "Bootstrap 5", "Django REST Framework", "SimpleJWT"]

function LandingPage({ onSignUp, onSignIn }) {
    const { token } = theme.useToken()

    // Hand the antd palette to CSS so the page keeps its contrast in dark mode.
    const themeVariables = {
        "--landing-surface": token.colorFillQuaternary,
        "--landing-surface-strong": token.colorFillTertiary,
        "--landing-border": token.colorBorderSecondary,
        "--landing-text": token.colorText,
        "--landing-text-secondary": token.colorTextSecondary,
        "--landing-accent": token.colorPrimary,
    }

    return (
        <div className="landing" style={themeVariables}>
            <a className="landing-skip-link" href="#landing-main">
                Skip to main content
            </a>
            <main id="landing-main" className="landing-main" tabIndex={-1}>
                <section className="landing-hero" aria-labelledby="landing-hero-title">
                    <Tag color="blue" className="landing-hero__eyebrow" icon={<ThunderboltOutlined aria-hidden="true" />}>
                        Strategy-based running log
                    </Tag>
                    <Title id="landing-hero-title" level={1} className="landing-hero__title">
                        Running Log
                    </Title>
                    <Paragraph className="landing-hero__subtitle">
                        Log every session, split every lap, and watch your pace improve. Running Log keeps the numbers for each of your
                        training strategies in one place.
                    </Paragraph>
                    <Space size="middle" wrap className="landing-hero__actions">
                        <Button type="primary" size="large" icon={<UserAddOutlined aria-hidden="true" />} onClick={onSignUp}>
                            Create Free Account
                        </Button>
                        <Button size="large" icon={<LoginOutlined aria-hidden="true" />} onClick={onSignIn}>
                            Sign In
                        </Button>
                    </Space>
                    <ul className="landing-hero__tags" aria-label="Core capabilities">
                        {CAPABILITIES.map((capability) => (
                            <li key={capability}>
                                <Tag>{capability}</Tag>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="landing-section" aria-labelledby="landing-features-heading">
                    <Title id="landing-features-heading" level={2} className="landing-section__heading">
                        Everything Your Training Log Needs
                    </Title>
                    <Paragraph className="landing-section__lead">
                        Three screens cover the whole loop: plan a strategy, log the runs, then review how the numbers move.
                    </Paragraph>
                    <div className="landing-features">
                        {FEATURES.map((feature) => (
                            <article className="landing-feature" key={feature.title}>
                                <span className="landing-feature__icon">{feature.icon}</span>
                                <Title level={3} className="landing-card__title">
                                    {feature.title}
                                </Title>
                                <Paragraph className="landing-card__body">{feature.body}</Paragraph>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="landing-section" aria-labelledby="landing-steps-heading">
                    <Title id="landing-steps-heading" level={2} className="landing-section__heading">
                        How It Works
                    </Title>
                    <Paragraph className="landing-section__lead">From a blank account to your first set of charts in three steps.</Paragraph>
                    <ol className="landing-steps">
                        {STEPS.map((step, index) => (
                            <li className="landing-step" key={step.title}>
                                <span className="landing-step__index" aria-hidden="true">
                                    {index + 1}
                                </span>
                                <Title level={3} className="landing-card__title">
                                    {step.title}
                                </Title>
                                <Paragraph className="landing-card__body">{step.body}</Paragraph>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="landing-section" aria-labelledby="landing-technologies-heading">
                    <Title id="landing-technologies-heading" level={2} className="landing-section__heading">
                        Built With
                    </Title>
                    <ul className="landing-tags" aria-label="Technologies used">
                        {TECHNOLOGIES.map((technology) => (
                            <li key={technology}>
                                <Tag>{technology}</Tag>
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    )
}

export default LandingPage
