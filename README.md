# easy-peasy-decorators

easy-peasy-decorators is a lightweight ([1 kB minified + gzipped](https://bundlephobia.com/result?p=easy-peasy-decorators)),  zero-dependency package using the power of Typescript and decorator pattern to help you create [`easy-peasy`](https://easy-peasy.now.sh/) stores in alternative way.

## Installation

```
npm install easy-peasy easy-peasy-decorators
```

## Basic Usage

**Creating store with js**

Here's how we create a _todos_ store with easy-peasy, using javascript. You can find more details on [easy-peasy official documentation](https://easy-peasy.now.sh/docs/introduction/).

```js
import { createStore } from "easy-peasy";

const model = {
    todos: {
        items: ["Create store", "Wrap application", "Use store"],
        add: action((state, payload) => {
            state.items.push(payload);
        }),
    },
};

export const store = createStore(model);
```

**Creating store with ts**

An equal store created by using Typescript. However it is handy for having a typed version of the store, we need to sync `ITodosModel` interface with the model object, `todosModel`. This solution works if you want to avoid using classes / don't mind refactoring interfaces. For more information please visit official [Typescript API](https://easy-peasy.now.sh/docs/typescript-api/).

```ts
import { Action, action, createStore } from "easy-peasy";

interface ITodosModel {
    todos: string[];
    addTodo: Action<TodosModel, string>;
}

const todosModel: ITodosModel = {
    todos: ["Create store", "Wrap application", "Use store"],
    addTodo: action((state, payload) => {
        state.todos.push(payload);
    }),
};

interface IStoreModel {
    todos: TodoModel;
}

export const store = createStore<IStoreModel>(todosModel);
```

**Creating store with ts + decorators**

This is what it looks like to create an _easy-peasy_ store with decorators. As you noticed, we are using a class and some decorators here. Hence the need for _interface-synching_ eliminated. Tho, we still need to match our model name, `todos`, with `IStoreInterface`.

```ts
import { Model, Property, Action, createStore } from "easy-peasy-decorators";

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
    todos: TodoModel;
}

export const store = createStore<IStoreModel>();
```

## API
Here we use all 6 decorators with the `createStore` and `createTypedHooks` methods. They are all simply helpers to create a typed store definition. Under the hood they are mapped to *easy-peasy* equivalents.

```ts
import {
    Computed,
    createStore,
    Listener,
    Model,
    Property,
    Thunk,
    Action,
} from "easy-peasy-decorators";
import { TargetPayload } from "easy-peasy";

// A Model decorator expects a name
// The same name will be used to access this model through store created
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

    @Thunk()
    public increaseAsync() {
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

// This interface is required in order to get typings properly
interface IStoreModel {
    counter: CounterModel;
    todos: TodoModel;
}

// No need to pass any value. Model definitions will be built from
// collected decorator metadata.
export const store = createStore<IStoreModel>();

export const { useStoreState, useStoreActions, useStoreDispatch } = createTypedHooks<IStoreModel>();

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
```

### This
`this` keyword in your methods does not refer to an actual object instance of that class. For `actions`, `getters` and `listeners`, `this`  holds the underlying `state` value of that model. For thunks, however, it refers to both the `state` and `actions` of the corresponding model.

## Known Limitations
You need to mark your listeners with `private` modifiers in order to hide them. Also `store.getListeners()` typings does not resolves correctly yet. We may address this issues in a future release.
