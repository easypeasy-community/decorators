import "jest";
import "reflect-metadata";

import { Action, Computed, Model, Property, Thunk, Listener } from "../src/decorators";
import { createStore } from "../src/create-store";
import { TargetPayload } from "easy-peasy";

describe("metadata", () => {
    it("collects model metadata", () => {
        @Model("counter")
        class CounterModel {}

        const store = createStore<{ counter: CounterModel }>();

        expect(!!store.getState().counter).toEqual(true);
    });

    it("collects property metadata", () => {
        @Model("counter")
        class CounterModel {
            public notAProperty = 1;

            @Property()
            public property = 2;
        }

        const store = createStore<{ counter: CounterModel }>();

        expect(store.getState().counter.notAProperty).toEqual(undefined);
        expect(store.getState().counter.property).toEqual(2);
    });

    it("collects action metadata", () => {
        @Model("counter")
        class CounterModel {
            @Property()
            public value = 0;

            @Action()
            public up() {
                this.value += 1;
            }
        }
        const store = createStore<{ counter: CounterModel }>();

        expect(store.getState().counter.value).toEqual(0);
        store.getActions().counter.up();
        expect(store.getState().counter.value).toEqual(1);
    });

    it("collects computed metadata", () => {
        @Model("counter")
        class CounterModel {
            @Property()
            public value = 0;

            @Computed()
            public get next() {
                return this.value + 1;
            }
        }
        const store = createStore<{ counter: CounterModel }>();

        expect(store.getState().counter.next).toEqual(1);
    });

    it("collects synchronous thunk metadata", () => {
        @Model("counter")
        class CounterModel {
            @Property()
            public value = 0;

            @Action()
            increase() {
                this.value += 1;
            }

            @Thunk()
            increaseThunk() {
                this.increase();
            }
        }
        const store = createStore<{ counter: CounterModel }>();

        store.getActions().counter.increaseThunk();
        expect(store.getState().counter.value).toEqual(1);
    });

    it("collects asynchronous thunk metadata", async () => {
        @Model("counter")
        class CounterModel {
            @Property()
            public value = 0;

            @Action()
            increase() {
                this.value += 1;
            }

            @Thunk()
            increaseThunkAsync() {
                this.increase();
                return new Promise(resolve => setTimeout(() => resolve("ok"), 5));
            }
        }
        const store = createStore<{ counter: CounterModel }>();

        let result = await store.getActions().counter.increaseThunkAsync();
        expect(result).toEqual("ok");
        expect(store.getState().counter.value).toEqual(1);
    });

    it("collects listener metadata", () => {
        @Model("counter")
        class CounterModel {
            @Property()
            public value = 0;

            @Property()
            public doubleValue = 0;

            @Action()
            increase() {
                this.value += 1;
            }

            @Listener<CounterModel>(actions => actions.increase)
            onSetValue(target: TargetPayload<number>) {
                this.doubleValue = this.value * 2;
            }
        }
        const store = createStore<{ counter: CounterModel }>();

        store.getActions().counter.increase();
        expect(store.getState().counter.doubleValue).toEqual(2);
    });
});
