import { z } from "zod";

import { IUserPreferences } from "../models/user-preferences";

/** Validates a stored value against `IUserPreferences`'s own shape -- typed against the interface so the two cannot silently drift apart. */
export const userPreferenceSchema: z.ZodType<IUserPreferences> = z.object({
    violationFavorites: z.record(z.string(), z.array(z.string()))
});
