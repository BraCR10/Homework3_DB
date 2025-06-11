// param SQL name : [value, type]
export type inSqlParameters = Record<string, [string | null, any]>;

//param SQL name : type
export type outSqlParameters = Record<string, any>;
