export type ForEach<KEY extends string, CONTENT> = {
    [key in KEY]: CONTENT
};