import React from "react";

interface INotFoundProps {
    onNavigateHome?: () => void;
}

export default function NotFound({ onNavigateHome }: INotFoundProps): React.JSX.Element {
    return (
        <div id="not-found" className="d-flex flex-column justify-content-center align-items-center">
            <i className="bi bi-rocket-takeoff-fill" />
            <p className="mb-0">Sorry, no form found with that name.</p>
            <a
                href="/"
                onClick={onNavigateHome ? (event) => {
                    event.preventDefault();
                    onNavigateHome();
                } : undefined}
            >
                Go back to home
            </a>
        </div>
    );
}
