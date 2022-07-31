import React, { Component } from 'react';
import ReactDOM, { render } from 'react-dom';
import { observable, action, computed, autorun, configure, runInAction, when, reaction } from 'mobx';
import { observer, Provider, inject } from 'mobx-react';

configure({
    enforceActions: 'observed'
})

class Store {
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

const store = new Store();

// autorun 当可观察的数据改变，就会跑回调
autorun(() => {
    console.log(store.count, 'store.count');
})

// store.count = 2;
// store.count = 3;
//这里autorun会跑两次，如果不直接改变状态，而是用action的话就只会跑一次，我们改一下代码，先注释上面两行，然后写一个action，然后调用这个action
// store.change();  //autorun中只打印了一次

//那这里应该禁用掉上面那种直接改变状态的方式
//直接改变状态报错了

// 改变状态的几种方式，除了上面的声明@action，也可以用runInAction
runInAction(() => {
    store.count = 2;
    store.count = 3;
})

//异步action
// store.asyncChange();

//监听数据变化
//1.autorun 一上来就会跑一次，其他两种不会
//2.when 满足条件，只执行一次！
when(() => {
    return store.count > 100
}, () => {
    console.log(store.count, 'when.store.count')
})

//3.reaction 不同于autorun和when，reaction只有当被观察的数据发生改变时，才会执行
reaction(() => {
    return store.count
}, (data, reaction) => {
    console.log(data, 'reaction.store.count');

    //手动停止监听，有点类似when了，就执行一次
    reaction.dispose();
})

store.changeCount(200);
store.changeCount(300);

@observer
class App extends React.Component {
    render() {
        const { store } = this.props as any;
        console.log(store, 'store');
        return <div>
            <span>{store.count}</span>
            <button onClick={store.increment}>increment</button>
            <span>total: {store.totalPrice}</span>
            <span>total: {store.totalPrice}</span>
        </div>
    }
}

// @ts-ignore
ReactDOM.render(<App store={new Store()} />, document.getElementById('root'));
