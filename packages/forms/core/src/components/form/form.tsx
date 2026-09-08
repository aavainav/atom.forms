import React from "react";
import { FormModel } from "../../models/form";

interface IFFormProps {
    readonly form: FormModel;
}

export default function FForm({ form, children }: React.PropsWithChildren<IFFormProps>): React.JSX.Element {
    return (
        <div id={form.id} className="f-form container-fluid min-vh-100">
            <div className="d-flex flex-column align-items-center">{children}</div>
        </div>
    );
}
