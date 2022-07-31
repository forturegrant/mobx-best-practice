import React, { Component, useEffect, useState } from 'react';
import ReactDOM, { render } from 'react-dom';
import { observable, action, computed, autorun, configure, runInAction, when, reaction, observe } from 'mobx';
import { observer, Provider, inject } from 'mobx-react';
import { useObserver, useLocalStore } from 'mobx-react-lite';

configure({
    enforceActions: 'observed'
})

class ProductStore {
    constructor(rootStore) {
        // @ts-ignore
        this.rootStore = rootStore;
    }
    @observable foo = 'bar';
    @observable count = 101;
    @observable price = 10;
    // computed会缓存，下面调用多次，只执行一次
    // bound其实就是绑定this
    @action.bound increment() {
        this.count++;

        // @ts-ignore
        this.rootStore.cardStore.increment();
    }
    @computed get totalPrice() {
        return this.count * this.price
    }
    @action.bound change() {
        this.count = 2;
        this.count = 3;
    }

    //异步action的几种方式
    @action.bound changeCount(val = 20) {
        this.count = val;
    }
    @action.bound asyncChange() {
        setTimeout(() => {
            // this.count = 100;  //严格模式会报错，就是上面configure
            //1.定义action函数   // 业务逻辑复杂推荐这种
            // this.changeCount();
            //2.直接调用action函数
            // action('changeCount', () => {
            //     this.count = 100;
            // })();
            //3.runInAction   比较简单推荐这种
            runInAction(() => {
                this.count = 100;
            })
        }, 100)
    }
}

@inject('productStore')
@observer
class Product extends React.Component {
    render() {
        console.log(this.props, 'this.props');
        // @ts-ignore
        const { count, increment, totalPrice } = this.props.productStore as any;
        return <div>
            <div>PRODUCT</div>
            <span>{count}</span>
            <button onClick={increment}>increment</button>
            <span>total: {totalPrice}</span>
            <span>total: {totalPrice}</span>
        </div>
    }
}


class CardStore {
    constructor(rootStore) {
        // @ts-ignore
        this.rootStore = rootStore;
    }
    @observable foo = 'bar';
    @observable count = 101;
    @observable price = 10;
    // bound其实就是绑定this
    @action.bound increment() {
        console.log(this, 'this');
        this.count++;
    }
    // computed会缓存，下面调用多次，只执行一次
    @computed get totalPrice() {
        return this.count * this.price
    }
    @action.bound change() {
        this.count = 2;
        this.count = 3;
    }

    //异步action的几种方式
    @action.bound changeCount(val = 20) {
        this.count = val;
    }
    @action.bound asyncChange() {
        setTimeout(() => {
            // this.count = 100;  //严格模式会报错，就是上面configure
            //1.定义action函数   // 业务逻辑复杂推荐这种
            // this.changeCount();
            //2.直接调用action函数
            // action('changeCount', () => {
            //     this.count = 100;
            // })();
            //3.runInAction   比较简单推荐这种
            runInAction(() => {
                this.count = 100;
            })
        }, 100)
    }
}

@inject('cardStore')
@observer
class Card extends React.Component {
    render() {
        // @ts-ignore
        const { count, increment, totalPrice } = this.props.cardStore as any;
        return <div>
            <div>CARD</div>
            <span>{count}</span>
            <button onClick={increment}>increment</button>
            <span>total: {totalPrice}</span>
            <span>total: {totalPrice}</span>
        </div>
    }
}


const Func = inject('cardStore')(observer((props) => {
    console.log(props, 'props');
    return <div>Func</div>
}))


class App extends React.Component {
    render() {
        return <div>
            <Product />
            <Card />
            <Func />
        </div>
    }
}

class rootStore {
    constructor() {
        // @ts-ignore
        this.productStore = new ProductStore(this);
        // @ts-ignore
        this.cardStore = new CardStore(this);
    }
}


// @ts-ignore
ReactDOM.render(<Provider {...new rootStore()}>
    <App />
</Provider>, document.getElementById('root'));
