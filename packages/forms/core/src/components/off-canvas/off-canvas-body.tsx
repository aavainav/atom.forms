import * as React from "react";

export interface IFOffCanvasBodyProps {

}

export const FOffCanvasBody = ({ children }: React.PropsWithChildren<IFOffCanvasBodyProps>): React.JSX.Element => {
    return (
        <div className="offcanvas-body">
            {children}
        </div>
    );
}
