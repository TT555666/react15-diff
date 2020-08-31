// 一、前言
// React Hooks 是从 v16.8 引入的又一开创性的新特性。第一次了解这项特性的时候，真的有一种豁然开朗，发现新大陆的感觉。我深深的为 React 团队天马行空的创造力和精益求精的钻研精神所折服。本文除了介绍具体的用法外，还会分析背后的逻辑和使用时候的注意事项，力求做到知其然也知其所以然。

// 这个系列分上下两篇，这里是上篇的传送门：
// React Hooks 解析（上）：基础

// 二、useLayoutEffect
// useLayoutEffect的用法跟useEffect的用法是完全一样的，都可以执行副作用和清理操作。它们之间唯一的区别就是执行的时机。

// useEffect不会阻塞浏览器的绘制任务，它在页面更新后才会执行。

// 而useLayoutEffect跟componentDidMount和componentDidUpdate的执行时机一样，会阻塞页面的渲染。如果在里面执行耗时任务的话，页面就会卡顿。

// 在绝大多数情况下，useEffectHook 是更好的选择。唯一例外的就是需要根据新的 UI 来进行 DOM 操作的场景。useLayoutEffect会保证在页面渲染前执行，也就是说页面渲染出来的是最终的效果。如果使用useEffect，页面很可能因为渲染了 2 次而出现抖动。

// 三、useContext
// useContext可以很方便的去订阅 context 的改变，并在合适的时候重新渲染组件。我们先来熟悉下标准的 context API 用法：

// const ThemeContext = React.createContext('light');

// class App extends React.Component {
//   render() {
//     return (
//       <ThemeContext.Provider value="dark">
//         <Toolbar />
//       </ThemeContext.Provider>
//     );
//   }
// }

// // 中间层组件
// function Toolbar(props) {
//   return (
//     <div>
//       <ThemedButton />
//     </div>
//   );
// }

// class ThemedButton extends React.Component {
//   // 通过定义静态属性 contextType 来订阅
//   static contextType = ThemeContext;
//   render() {
//     return <Button theme={this.context} />;
//   }
// }
// 除了定义静态属性的方式，还有另外一种针对Function Component的订阅方式：

// function ThemedButton() {
//     // 通过定义 Consumer 来订阅
//     return (
//         <ThemeContext.Consumer>
//           {value => <Button theme={value} />}
//         </ThemeContext.Consumer>
//     );
// }
// 使用useContext来订阅，代码会是这个样子，没有额外的层级和奇怪的模式：

// function ThemedButton() {
//   const value = useContext(NumberContext);
//   return <Button theme={value} />;
// }
// 在需要订阅多个 context 的时候，就更能体现出useContext的优势。传统的实现方式：

// function HeaderBar() {
//   return (
//     <CurrentUser.Consumer>
//       {user =>
//         <Notifications.Consumer>
//           {notifications =>
//             <header>
//               Welcome back, {user.name}!
//               You have {notifications.length} notifications.
//             </header>
//           }
//       }
//     </CurrentUser.Consumer>
//   );
// }
// useContext的实现方式更加简洁直观：

// function HeaderBar() {
//   const user = useContext(CurrentUser);
//   const notifications = useContext(Notifications);

//   return (
//     <header>
//       Welcome back, {user.name}!
//       You have {notifications.length} notifications.
//     </header>
//   );
// }
// 四、useReducer
// useReducer的用法跟 Redux 非常相似，当 state 的计算逻辑比较复杂又或者需要根据以前的值来计算时，使用这个 Hook 比useState会更好。下面是一个例子：

// function init(initialCount) {
//   return {count: initialCount};
// }

// function reducer(state, action) {
//   switch (action.type) {
//     case 'increment':
//       return {count: state.count + 1};
//     case 'decrement':
//       return {count: state.count - 1};
//     case 'reset':
//       return init(action.payload);
//     default:
//       throw new Error();
//   }
// }

// function Counter({initialCount}) {
//   const [state, dispatch] = useReducer(reducer, initialCount, init);
//   return (
//     <>
//       Count: {state.count}
//       <button
//         onClick={() => dispatch({type: 'reset', payload: initialCount})}>
//         Reset
//       </button>
//       <button onClick={() => dispatch({type: 'increment'})}>+</button>
//       <button onClick={() => dispatch({type: 'decrement'})}>-</button>
//     </>
//   );
// }
// 结合 context API，我们可以模拟 Redux 的操作了，这对组件层级很深的场景特别有用，不需要一层一层的把 state 和 callback 往下传：

// const TodosDispatch = React.createContext(null);
// const TodosState = React.createContext(null);

// function TodosApp() {
//   const [todos, dispatch] = useReducer(todosReducer);

//   return (
//     <TodosDispatch.Provider value={dispatch}>
//       <TodosState.Provider value={todos}>
//         <DeepTree todos={todos} />
//       </TodosState.Provider>
//     </TodosDispatch.Provider>
//   );
// }

// function DeepChild(props) {
//   const dispatch = useContext(TodosDispatch);
//   const todos = useContext(TodosState);

//   function handleClick() {
//     dispatch({ type: 'add', text: 'hello' });
//   }

//   return (
//     <>
//       {todos}
//       <button onClick={handleClick}>Add todo</button>
//     </>
//   );
// }
// 五、useCallback / useMemo / React.memo
// useCallback和useMemo设计的初衷是用来做性能优化的。在Class Component中考虑以下的场景：

// class Foo extends Component {
//   handleClick() {
//     console.log('Click happened');
//   }
//   render() {
//     return <Button onClick={() => this.handleClick()}>Click Me</Button>;
//   }
// }
// 传给 Button 的 onClick 方法每次都是重新创建的，这会导致每次 Foo render 的时候，Button 也跟着 render。优化方法有 2 种，箭头函数和 bind。下面以 bind 为例子：

// class Foo extends Component {
//   constructor(props) {
//     super(props);
//     this.handleClick = this.handleClick.bind(this);
//   }
//   handleClick() {
//     console.log('Click happened');
//   }
//   render() {
//     return <Button onClick={this.handleClick}>Click Me</Button>;
//   }
// }
// 同样的，Function Component也有这个问题：

// function Foo() {
//   const [count, setCount] = useState(0);

//   const handleClick() {
//     console.log(`Click happened with dependency: ${count}`)
//   }
//   return <Button onClick={handleClick}>Click Me</Button>;
// }
// 而 React 给出的方案是useCallback Hook。在依赖不变的情况下 (在我们的例子中是 count )，它会返回相同的引用，避免子组件进行无意义的重复渲染：

// function Foo() {
//   const [count, setCount] = useState(0);

//   const memoizedHandleClick = useCallback(
//     () => console.log(`Click happened with dependency: ${count}`), [count],
//   ); 
//   return <Button onClick={memoizedHandleClick}>Click Me</Button>;
// }
// useCallback缓存的是方法的引用，而useMemo缓存的则是方法的返回值。使用场景是减少不必要的子组件渲染：

// function Parent({ a, b }) {
//   // 当 a 改变时才会重新渲染
//   const child1 = useMemo(() => <Child1 a={a} />, [a]);
//   // 当 b 改变时才会重新渲染
//   const child2 = useMemo(() => <Child2 b={b} />, [b]);
//   return (
//     <>
//       {child1}
//       {child2}
//     </>
//   )
// }
// 如果想实现Class Component的shouldComponentUpdate方法，可以使用React.memo方法，区别是它只能比较 props，不会比较 state：

// const Parent = React.memo(({ a, b }) => {
//   // 当 a 改变时才会重新渲染
//   const child1 = useMemo(() => <Child1 a={a} />, [a]);
//   // 当 b 改变时才会重新渲染
//   const child2 = useMemo(() => <Child2 b={b} />, [b]);
//   return (
//     <>
//       {child1}
//       {child2}
//     </>
//   )
// });
// 六、useRef
// Class Component获取 ref 的方式如下：

// class MyComponent extends React.Component {
//   constructor(props) {
//     super(props);
//     this.myRef = React.createRef();
//   }
  
//   componentDidMount() {
//     this.myRef.current.focus();
//   }  

//   render() {
//     return <input ref={this.myRef} type="text" />;
//   }
// }
// Hooks 的实现方式如下：

// function() {
//   const myRef = useRef(null);

//   useEffect(() => {
//     myRef.current.focus();
//   }, [])
  
//   return <input ref={myRef} type="text" />;
// }
// useRef返回一个普通 JS 对象，可以将任意数据存到current属性里面，就像使用实例化对象的this一样。另外一个使用场景是获取 previous props 或 previous state：

// function Counter() {
//   const [count, setCount] = useState(0);

//   const prevCountRef = useRef();

//   useEffect(() => {
//     prevCountRef.current = count;
//   });
//   const prevCount = prevCountRef.current;

//   return <h1>Now: {count}, before: {prevCount}</h1>;
// }
// 七、自定义 Hooks
// 还记得我们上一篇提到的 React 存在的问题吗？其中一点是：

// 带组件状态的逻辑很难重用
// 通过自定义 Hooks 就能解决这一难题。

// 继续以上一篇文章中订阅朋友状态的例子：

// import React, { useState, useEffect } from 'react';

// function FriendStatus(props) {
//   const [isOnline, setIsOnline] = useState(null);

//   useEffect(() => {
//     function handleStatusChange(status) {
//       setIsOnline(status.isOnline);
//     }

//     ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
//     return () => {
//       ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
//     };
//   });

//   if (isOnline === null) {
//     return 'Loading...';
//   }
//   return isOnline ? 'Online' : 'Offline';
// }
// 假设现在我有另一个组件有类似的逻辑，当朋友上线的时候展示为绿色。简单的复制粘贴虽然可以实现需求，但太不优雅：

// import React, { useState, useEffect } from 'react';

// function FriendListItem(props) {
//   const [isOnline, setIsOnline] = useState(null);

//   useEffect(() => {
//     function handleStatusChange(status) {
//       setIsOnline(status.isOnline);
//     }

//     ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
//     return () => {
//       ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
//     };
//   });

//   return (
//     <li style={{ color: isOnline ? 'green' : 'black' }}>
//       {props.friend.name}
//     </li>
//   );
// }
// 这时我们就可以自定义一个 Hook 来封装订阅的逻辑：

// import React, { useState, useEffect } from 'react';

// function useFriendStatus(friendID) {
//   const [isOnline, setIsOnline] = useState(null);

//   useEffect(() => {
//     function handleStatusChange(status) {
//       setIsOnline(status.isOnline);
//     }

//     ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
//     return () => {
//       ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
//     };
//   });

//   return isOnline;
// }
// 自定义 Hook 的命名有讲究，必须以use开头，在里面可以调用其它的 Hook。入参和返回值都可以根据需要自定义，没有特殊的约定。使用也像普通的函数调用一样，Hook 里面其它的 Hook（如useEffect）会自动在合适的时候调用：

// function FriendStatus(props) {
//   const isOnline = useFriendStatus(props.friend.id);

//   if (isOnline === null) {
//     return 'Loading...';
//   }
//   return isOnline ? 'Online' : 'Offline';
// }

// function FriendListItem(props) {
//   const isOnline = useFriendStatus(props.friend.id);

//   return (
//     <li style={{ color: isOnline ? 'green' : 'black' }}>
//       {props.friend.name}
//     </li>
//   );
// }
// 自定义 Hook 其实就是一个普通的函数定义，以use开头来命名也只是为了方便静态代码检测，不以它开头也完全不影响使用。在此不得不佩服 React 团队的巧妙设计。

// 八、Hooks 使用规则
// 使用 Hooks 的时候必须遵守 2 条规则：

// 只能在代码的第一层调用 Hooks，不能在循环、条件分支或者嵌套函数中调用 Hooks。
// 只能在Function Component或者自定义 Hook 中调用 Hooks，不能在普通的 JS 函数中调用。
// Hooks 的设计极度依赖其定义时候的顺序，如果在后序的 render 中 Hooks 的调用顺序发生变化，就会出现不可预知的问题。上面 2 条规则都是为了保证 Hooks 调用顺序的稳定性。为了贯彻这 2 条规则，React 提供一个 ESLint plugin 来做静态代码检测：eslint-plugin-react-hooks。

// 九、总结
// 本文深入介绍了 6 个 React 预定义 Hook 的使用方法和注意事项，并讲解了如何自定义 Hook，以及使用 Hooks 要遵循的一些约定。到此为止，Hooks 相关的内容已经介绍完了，内容比我刚开始计划的要多不少，想要彻底理解 Hooks 的设计是需要投入相当精力的，希望本文可以为你学习这一新特性提供一些帮助。