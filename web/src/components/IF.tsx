import { memo, type ReactElement } from "react";

const IF = memo(
    function IF({ children, condition }: { children: ReactElement; condition: boolean }) {
        return condition ? children : null;
    },
    (props, oldProps) => props.condition === oldProps.condition
);

export default IF;
