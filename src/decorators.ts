import { metadataStorage } from "./metadata-storage";
import { TargetResolver } from "easy-peasy";
import { ToStoreType } from "./types";
import any = jasmine.any;

export function Model(modelName: string) {
    return (...[ctor]: Parameters<ClassDecorator>) => {
        metadataStorage.addModelMetadata({ ctor: ctor, modelName });
    };
}

export function Property() {
    return (...[ctor, fieldName]: Parameters<PropertyDecorator>) => {
        metadataStorage.addPropertyMetadata({ ctor: ctor, fieldName });
    };
}

export function Action<T>() {
    return ((...[ctor, fieldName, { value }]: Parameters<MethodDecorator>) => {
        metadataStorage.addActionMetadata({ ctor: ctor, fieldName, handler: value });
    }) as MethodDecorator;
}

export function Computed() {
    return ((...[ctor, fieldName, { value, get }]: Parameters<MethodDecorator>) => {
        metadataStorage.addComputedMetadata({ ctor: ctor, fieldName, handler: value || get });
    }) as MethodDecorator;
}

export function Thunk() {
    return ((...[ctor, fieldName, { value, get }]: Parameters<MethodDecorator>) => {
        metadataStorage.addThunkMetadata({ ctor: ctor, fieldName, handler: value });
    }) as MethodDecorator;
}

export function Listener<Model extends object, StoreModel extends object = {}>(
    actionFn: TargetResolver<ToStoreType<Model>, ToStoreType<StoreModel>>,
) {
    return ((...[ctor, fieldName, { value, get }]: Parameters<MethodDecorator>) => {
        metadataStorage.addListenerMetadata({ handler: value, fieldName, ctor: ctor, actionFn });
    }) as MethodDecorator;
}
