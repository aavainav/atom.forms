import { useLayoutEffect, useRef, useState } from "react";

/** The narrowest a page is ever shrunk to automatically; a container narrower than this scrolls instead of the page shrinking further. */
const minScale = 0.7;

/**
 * Measures the given page element against its own container on every resize, and answers the factor it should be
 * scaled by so the page never runs wider than the space available -- down to `minScale`, past which the container
 * scrolls rather than the page shrinking further, and never past 1, so a page already narrower than its container
 * is never blown up to fill it.
 *
 * The page's own current width is divided by the scale already applied to recover its natural, unscaled width,
 * rather than trusting a fixed constant for it: the natural width differs by form type, and the browser's own
 * measurement of the element already reflects whatever scale is currently in effect.
 */
export function usePageScale(pageRef: React.RefObject<HTMLElement | null>): number {
    const [scale, setScale] = useState(1);
    const appliedScale = useRef(1);

    useLayoutEffect(() => {
        const page = pageRef.current;
        const container = page?.parentElement;

        if (!page || !container) {
            return;
        }

        const measure = (): void => {
            const containerWidth = container.clientWidth;
            const naturalWidth = page.offsetWidth / appliedScale.current;

            if (containerWidth === 0 || naturalWidth === 0) {
                return;
            }

            const next = Math.min(Math.max(containerWidth / naturalWidth, minScale), 1);

            appliedScale.current = next;
            setScale(next);
        };

        measure();

        if (typeof ResizeObserver === "undefined") {
            return;
        }

        const observer = new ResizeObserver(measure);
        observer.observe(container);

        return () => observer.disconnect();
    }, [pageRef]);

    return scale;
}
