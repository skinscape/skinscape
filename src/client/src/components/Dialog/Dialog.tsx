import "./style.scss";

import { useDialog } from "../../hooks/useDialog/useDialog";

type DialogProps = {
    children: React.ReactNode,
};

export const Dialog: React.FC<DialogProps> = ({
    children,
}) => {
    const { hideDialog } = useDialog();

    return (
        <div 
            className="dialog-container"
            onClick={hideDialog}
        >
            <div 
                className="dialog"
                onClick={e => e.stopPropagation()}
                onKeyDown={e => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};