import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import LandingPage from "./LandingPage"

describe("LandingPage", () => {
    test("renders the headline and both calls to action", () => {
        render(<LandingPage onSignUp={() => {}} onSignIn={() => {}} />)

        expect(screen.getByRole("heading", { level: 1, name: "Running Log" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /create free account/i })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
        expect(screen.getByText(/skip to main content/i)).toBeInTheDocument()
    })

    test("summarises the screens that ship in the app", () => {
        render(<LandingPage onSignUp={() => {}} onSignIn={() => {}} />)

        expect(screen.getByRole("heading", { level: 2, name: /everything your training log needs/i })).toBeInTheDocument()
        expect(screen.getByRole("heading", { level: 2, name: /how it works/i })).toBeInTheDocument()
        expect(screen.getByRole("heading", { level: 2, name: /built with/i })).toBeInTheDocument()
        expect(screen.getByRole("heading", { level: 3, name: /daily dashboard/i })).toBeInTheDocument()
        expect(screen.getByRole("heading", { level: 3, name: /create a strategy/i })).toBeInTheDocument()
    })

    test("calls the matching handler when a call to action is pressed", () => {
        const onSignUp = jest.fn()
        const onSignIn = jest.fn()
        render(<LandingPage onSignUp={onSignUp} onSignIn={onSignIn} />)

        fireEvent.click(screen.getByRole("button", { name: /create free account/i }))
        expect(onSignUp).toHaveBeenCalledTimes(1)
        expect(onSignIn).not.toHaveBeenCalled()

        fireEvent.click(screen.getByRole("button", { name: /sign in/i }))
        expect(onSignIn).toHaveBeenCalledTimes(1)
    })
})
