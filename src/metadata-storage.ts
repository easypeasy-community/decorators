import { action, actionOn, computed, TargetResolver, thunk } from "easy-peasy";

interface IModelMetadata {
    ctor: any;
    modelName: string;
}

interface IPropertyMetadata {
    ctor: any;
    fieldName: any;
    initialValue?: any;
}

interface IMethodMetadata {
    ctor: any;
    fieldName: any;
    handler: any;
}
interface IActionMetadata extends IMethodMetadata {}
interface IComputedMetadata extends IMethodMetadata {}
interface IThunkMetadata extends IMethodMetadata {}
interface IListenerMetadata extends IMethodMetadata {
    actionFn: any;
}

interface IModelInstance {
    ctor: any;
    instance: any;
}

class MetadataStorage {
    private model: Record<string, Record<string, any>> = {};
    private models: IModelMetadata[] = [];
    private properties: IPropertyMetadata[] = [];
    private actions: IActionMetadata[] = [];
    private computed: IComputedMetadata[] = [];
    private listeners: IListenerMetadata[] = [];
    private thunks: IThunkMetadata[] = [];
    private instances: IModelInstance[] = [];

    public addModelMetadata(definition: IModelMetadata) {
        this.models.push({ ctor: definition.ctor.prototype, modelName: definition.modelName });
        this.instances.push({ ctor: definition.ctor.prototype, instance: new definition.ctor() });
    }

    public addPropertyMetadata(definition: IPropertyMetadata) {
        this.properties.push(definition);
    }

    public addActionMetadata(definition: IActionMetadata) {
        this.actions.push(definition);
    }

    public addComputedMetadata(definition: IComputedMetadata) {
        this.computed.push(definition);
    }

    public addListenerMetadata(definition: IListenerMetadata) {
        this.listeners.push(definition);
    }

    public addThunkMetadata(definition: IThunkMetadata) {
        this.thunks.push(definition);
    }

    public buildModel() {
        this.models.forEach(({ ctor, modelName }) => {
            this.model[modelName] = {};

            this.properties
                .filter(p => p.ctor === ctor)
                .forEach(p => {
                    const instance = this.instances.find(i => i.ctor === p.ctor);
                    const  initialValue = instance?.instance[p.fieldName];

                    this.model[modelName][p.fieldName] = initialValue;
                });

            this.actions
                .filter(a => a.ctor === ctor)
                .forEach(a => {
                    this.model[modelName][a.fieldName] = action((state, payload) => {
                        a.handler.call(state, payload);
                    });
                });

            this.computed
                .filter(c => c.ctor === ctor)
                .forEach(c => {
                    this.model[modelName][c.fieldName] = computed(state => {
                        return c.handler.call(state);
                    });
                });

            this.listeners
                .filter(l => l.ctor === ctor)
                .forEach(l => {
                    this.model[modelName][l.fieldName] = actionOn(l.actionFn, (state, target) => {
                        l.handler.call(state, target);
                    });
                });

            this.thunks
                .filter(t => t.ctor === ctor)
                .forEach(t => {
                    this.model[modelName][t.fieldName] = thunk((actions, payload, { getState }) => {
                        return t.handler.call({ ...getState(), ...actions }, payload);
                    });
                });
        });

        return this.model;
    }
}

export const metadataStorage = new MetadataStorage();
