import { Rect, PartialRect } from "@app/utils";

export type VerticalPlacementType =
    | "aboveTarget"
    | "belowTarget"
    | "centerWindow";
export type HorizontalPlacementType =
    | "centerTarget"
    | "leftTarget"
    | "rightTarget"
    | "centerWindow";
export type MenuPlacement = {
    top: number;
    vType: VerticalPlacementType;
    left: number;
    hType: HorizontalPlacementType;
};

export function placeMenu(target: Rect, menu: PartialRect, win: PartialRect, offset: number): MenuPlacement {
    function calcTop(): [number, VerticalPlacementType] {
        function verticalFit(suggestedValue: number): boolean {
            return suggestedValue + menu.height < win.height
                && suggestedValue > 0;
        }

        if (menu.height > win.height) {
            throw "Cannot display menu with height greater than window";
        }
        const below = target.top + target.height + offset;
        if (verticalFit(below)) {
            return [below, "belowTarget"];
        }
        const above = target.top - menu.height - offset;
        if (verticalFit(above)) {
            return [above, "aboveTarget"];
        }
        const center = 0.5 * (win.height - menu.height);
        if (!verticalFit(center)) {
            throw "";
        }
        return [center, "centerWindow"];
    }

    function calcLeft(): [number, HorizontalPlacementType] {
        function leftFit(suggestedValue: number): boolean {
            return suggestedValue > 0;
        }
        function rightFit(suggestedValue: number): boolean {
            return suggestedValue + menu.width < win.width;
        }
        function horizontalFit(suggestedValue: number): boolean {
            return leftFit(suggestedValue) && rightFit(suggestedValue);
        }

        if (menu.width > win.width) {
            throw "Cannot display menu with width greater than window";
        }
        const targetCenter = target.left + (0.5 * target.width) - (0.5 * menu.width);
        if (horizontalFit(targetCenter)) {
            return [targetCenter, "centerTarget"];
        }
        if (!leftFit(targetCenter)) {
            const output = offset;
            if (horizontalFit(output)) {
                return [output, "leftTarget"];
            }
        } else {
            const output = win.width - (menu.width + offset);
            if (horizontalFit(output)) {
                return [output, "rightTarget"];
            }
        }
        const center = 0.5 * (win.width - menu.width);
        return [center, "centerWindow"];
    }

    const top = calcTop();
    const left = calcLeft();
    return {
        top: top[0],
        vType: top[1],
        left: left[0],
        hType: left[1]
    };
}