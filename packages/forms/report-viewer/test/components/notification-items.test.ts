import { describe, expect, it } from "vitest";

import { addNotification, defaultDurations, maxNotifications } from "../../src/components/notification/notification-items";
import type { IReportViewerNotificationItem } from "../../src/components/notification/notification-items";

describe("addNotification", () => {
    it("adds a notification once, with its type's default duration", () => {
        expect(addNotification([], { message: "Saved.", type: "success" }))
            .toEqual([{ count: 1, duration: defaultDurations.success, key: "success:Saved.", message: "Saved.", type: "success" }]);
    });

    it("takes the duration a notification names, 0 included", () => {
        expect(addNotification([], { duration: 1234, message: "A", type: "info" })[0].duration).toBe(1234);
        expect(addNotification([], { duration: 0, message: "B", type: "danger" })[0].duration).toBe(0);
    });

    it("counts a repeat rather than adding another, leaving it where it was", () => {
        let items: Array<IReportViewerNotificationItem> = [];
        items = addNotification(items, { message: "First", type: "danger" });
        items = addNotification(items, { message: "Second", type: "info" });
        items = addNotification(items, { message: "First", type: "danger" });

        expect(items.map(item => [item.message, item.count])).toEqual([["First", 2], ["Second", 1]]);
    });

    it("keeps the same message under a different type apart", () => {
        let items: Array<IReportViewerNotificationItem> = [];
        items = addNotification(items, { message: "Same", type: "info" });
        items = addNotification(items, { message: "Same", type: "danger" });

        expect(items).toHaveLength(2);
    });

    it("keeps only the newest few, pushing the oldest out", () => {
        let items: Array<IReportViewerNotificationItem> = [];
        for (let index = 0; index <= maxNotifications; index++) {
            items = addNotification(items, { message: `Message ${index}`, type: "info" });
        }

        expect(items).toHaveLength(maxNotifications);
        expect(items[0].message).toBe("Message 1");
    });

    it("does not push one out to count a repeat", () => {
        let items: Array<IReportViewerNotificationItem> = [];
        for (let index = 0; index < maxNotifications; index++) {
            items = addNotification(items, { message: `Message ${index}`, type: "info" });
        }

        expect(addNotification(items, { message: "Message 0", type: "info" })).toHaveLength(maxNotifications);
    });
});
