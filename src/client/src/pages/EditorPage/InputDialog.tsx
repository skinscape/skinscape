import React from "react";
import { forwardRef } from "react";

import { Input } from "../../components/Input";
import { useDialog } from "../../hooks/useDialog/useDialog";
import { Dialog } from "../../components/Dialog";

type InputDialogProps = {
    title?: string,
    label?: string,
    onEnter: (input: string) => void,
};

export const InputDialog = forwardRef<
    HTMLInputElement, InputDialogProps & React.ComponentProps<typeof Input>
>(({ title, label, onEnter, ...props }, ref) => {
    const { hideDialog } = useDialog();

    return (
        <Dialog title={title}>
            {label && <p>{label}:</p>}
            <Input
                ref={ref}
                {...props}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                    if (event.key != "Enter") return;

                    hideDialog();
                    onEnter(event.currentTarget.value);
                }} 
            />
        </Dialog>
    );
});