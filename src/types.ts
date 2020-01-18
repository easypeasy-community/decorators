import { Action, Thunk } from 'easy-peasy';

export type ComputedType<T> = T & { computed?: undefined };

export type ToStoreType<T extends object> = {
    [P in keyof T]: 'computed' extends keyof T[P]
        ? T[P] extends ComputedType<infer U>
            ? U
            : T[P]
        : T[P] extends (...args: any[]) => any
            ? ReturnType<T[P]> extends void
                ? Action<T, Parameters<T[P]>[0] extends undefined ? void : Parameters<T[P]>[0]>
                : Thunk<T, Parameters<T[P]>[0], void, {}, ReturnType<T[P]>>
            : T[P] extends object
                ? ToStoreType<T[P]>
                : T[P];
};
