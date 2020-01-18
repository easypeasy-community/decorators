import { Computed, createStore, Listener, Model, Property, Thunk, Action } from "../src/index";
import { TargetPayload } from "easy-peasy";

// A Model decorator expects a name
// Same name will be used to access this model through store
@Model("counter")
class CounterModel {
    @Property()
    public value = 0;

    @Computed()
    get netValue() {
        return this.value + 1;
    }

    @Action()
    public increase() {
        this.value += 1;
    }

    @Action()
    public reset() {
        this.value = 0;
    }

    @Thunk()
    increaseAsync() {
        return new Promise(approve => {
            setTimeout(() => {
                this.increase();
                approve();
            }, 100);
        });
    }

    @Listener<CounterModel>(actions => actions.increase)
    private onIncrease() {
        console.log("val changed to: ", this.value);
    }
}

@Model("todos")
class TodoModel {
    @Property()
    public items = ["Create store", "Wrap application", "Use store"];

    @Action()
    add(payload: string) {
        this.items.push(payload);
    }
}

interface IStoreModel {
    counter: CounterModel;
    todos: TodoModel;
}

export const store = createStore<IStoreModel>();

console.log(store.getState().counter.value); // prints: 0
console.log(store.getState().counter.netValue); // prints: 1
store.getActions().counter.increase();
// prints: val changed to:  1 -- log from onIncrease listener
store
    .getActions()
    .counter.increaseAsync()
    .then(() => {
        console.log(store.getState().counter.value); // prints: 2 -- called after 100ms
        // prints: val changed to:  2 -- log from onIncrease listener
    });
console.log(store.getState().counter.value); // prints: 1 -- called before timeout
