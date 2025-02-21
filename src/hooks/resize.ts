import React from "react";

export default function useResize<T extends HTMLElement | null>(ref: React.RefObject<T>) {
    const [size, setSize] = React.useState({ height: 0, width: 0 });
    React.useEffect(() => {
        const current = ref.current;
        if (current) {
            const cb = () => {
                setSize({ height: current.clientHeight, width: current.clientWidth });
            };
            const ob = new ResizeObserver(cb);
            ob.observe(current);
            cb();
            return () => {
                ob.disconnect();
            };
        }
    }, [ref]);
    return size;
}
