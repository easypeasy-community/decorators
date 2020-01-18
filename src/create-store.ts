import * as easyPeasy from "easy-peasy";
import { ToStoreType } from './types';
import { metadataStorage } from "./metadata-storage";

export function createStore<T extends object>() {
    const model = metadataStorage.buildModel();
    const store = easyPeasy.createStore<any>(model);

    return store as easyPeasy.Store<ToStoreType<T>>;
}

export function createTypedHooks<Model extends object>(): {
    useStoreActions: <Result>(
        mapActions: (actions: easyPeasy.Actions<ToStoreType<Model>>) => Result,
    ) => Result;
    useStoreDispatch: () => easyPeasy.Dispatch<ToStoreType<Model>>;
    useStoreState: <Result>(
        mapState: (state: ToStoreType<Model>) => Result,
        dependencies?: any[],
    ) => Result;
} {
    const hooks = easyPeasy.createTypedHooks<any>();

    return hooks as any;
}
