import React from "react";

interface IFAccordionProps {
    readonly id: string;
    readonly heading?: string;
    readonly icon?: string;
}

export default function FAccordion({ id, heading, icon, children }: React.PropsWithChildren<IFAccordionProps>): React.JSX.Element {
    return (
        <div className="accordion mt-3">
            <div className="accordion-item border-dark rounded-0">
                <h2 id={id} className="accordion-header">
                    <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#accordion-collapse-${id}`}
                        aria-expanded="false"
                        aria-controls={`accordion-collapse-${id}`}
                    >
                        {icon && <i className={`bi bi-${icon} me-2`} />}
                        {heading && <span>{heading}</span>}
                    </button>
                </h2>
                <div id={`accordion-collapse-${id}`} className="accordion-collapse collapse" aria-labelledby={`heading-${id}`} data-bs-parent=".accordion">
                    <div className="accordion-body">{children}</div>
                </div>
            </div>
        </div>
    );
}
