let attr = 'backgroundColorName';
// background-color-name
let result = attr.replace(/[A-Z]/g,m=>`-${m.toLowerCase()}`);
console.log(result);

let obj1={name:'zhufeng'};
let obj2={age:10};
Object.assign(obj1,obj2);
console.log(obj1)