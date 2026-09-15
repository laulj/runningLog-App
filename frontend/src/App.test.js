import React from "react"
import { act, render, screen } from "@testing-library/react"
import App from "./App"

describe("App", () => {
    beforeEach(() => {
        // The layout branch is chosen from the stored tokens
        localStorage.clear()
    })

    afterEach(() => {
        delete global.fetch
    })

    test("shows the landing page to a visitor without an account", () => {
        render(<App />)

        expect(screen.getByRole("heading", { level: 1, name: "Running Log" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /create free account/i })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
        // The app menu stays hidden until the user is logged in
        expect(screen.queryByRole("menuitem", { name: /home/i })).not.toBeInTheDocument()
        expect(screen.queryByRole("menuitem", { name: /chart/i })).not.toBeInTheDocument()
        expect(screen.queryByRole("menuitem", { name: /add/i })).not.toBeInTheDocument()
    })

    test("opens the login form when the visitor presses Sign In", async () => {
        render(<App />)

        const loginMenu = document.querySelector(".dropdown-login-menu")
        const loginToggle = document.getElementById("dropdownLoginMenuButton1")
        expect(loginMenu).not.toHaveClass("show")

        await act(async () => {
            screen.getByRole("button", { name: /sign in/i }).click()
        })

        // Bootstrap clears an open dropdown on any click that lands outside of it, so the
        // dropdown has to survive the very click that opened it
        expect(loginMenu).toHaveClass("show")
        expect(loginToggle).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByRole("checkbox", { name: /remember me/i })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument()

        // Pressing Sign In again keeps the login form open instead of toggling it away
        await act(async () => {
            screen.getByRole("button", { name: /sign in/i }).click()
        })
        expect(loginMenu).toHaveClass("show")
    })

    test("shows the app menu and the account name to a logged in user", async () => {
        localStorage.setItem("access", "test-access")
        localStorage.setItem("refresh", "test-refresh")
        localStorage.setItem("username", "runner")
        // The app shell queries strategies, logs, and laps as soon as it mounts
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: async () => [],
            })
        )

        // Rendering inside act lets the queries of the app shell settle before the assertions
        await act(async () => {
            render(<App />)
        })

        // antd icons expose their own aria-labels, so a menu item reads like "home Home"
        expect(screen.getByRole("menuitem", { name: /home/i })).toBeInTheDocument()
        expect(screen.getByRole("menuitem", { name: /chart/i })).toBeInTheDocument()
        expect(screen.getByRole("menuitem", { name: /add/i })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "runner" })).toBeInTheDocument()
        // The landing page gives way to the app views
        expect(screen.queryByRole("heading", { level: 1, name: "Running Log" })).not.toBeInTheDocument()
    })
})
