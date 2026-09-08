import * as zod from "zod";

type ZodErrorResult = { success: false, error: zod.ZodError };
type ZodSuccessResult<T> = { success: true, data: T };
type ZodParseResult<T> = ZodSuccessResult<T> | ZodErrorResult;

export interface ISchemaParser<TSchema> {
    /** Parse the data against the provided schema. */
    parse: (data: object | string) => ZodParseResult<TSchema>;
}

const jsonParseResultSchema = zod.object({
    success: zod.boolean(),
    result: zod.object(),
    error: zod.string().optional()
});

type IJsonParseResult = zod.infer<typeof jsonParseResultSchema>;

export function createParser<TSchema>(schema: zod.Schema<TSchema>): ZodSchemaParser<TSchema> {
    return new ZodSchemaParser<TSchema>(schema);
}

/** Defines the zod schema parser. This will parse the input data (object or string) against the defined schema. */
class ZodSchemaParser<TSchema> implements ISchemaParser<TSchema> {
    constructor(private readonly schema: zod.Schema<TSchema>) { }

    public parse(dataObjectOrString: object | string): ZodParseResult<TSchema> {
        const data = typeof dataObjectOrString === "string" 
            ? this.stringToObject(dataObjectOrString)
            : dataObjectOrString;

        const result = this.schema.safeParse(data);
        
        return this.isSuccess(result)
            ? { success: true, data: result.data }
            : { success: false, error: result.error };
    }

    private getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message; 
        }

        if (typeof error === "string") {
            return error;
        }

        return JSON.stringify(error);
    }

    private isSuccess<T>(result: ZodParseResult<T>): result is ZodSuccessResult<T> {
        return result.success;
    }

    private parseStringToObject(str: string): IJsonParseResult {
        try {
            const parsedObject = JSON.parse(str);
            return { success: true, result: parsedObject };
        } catch (error: unknown) {
            return { 
                success: false, 
                result: {},
                error: this.getErrorMessage(error) 
            }; 
        }
    }

    private stringToObject(str: string): object  {
        const result = this.parseStringToObject(str);
        if (!result.success && result.error) {
            throw new zod.ZodError([{ code: "custom", path: [], message: result.error }]);
        }

        return result.result;
    }
}