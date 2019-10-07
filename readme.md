# Bynd

Experimenting a pure javascript alternative to React and Vue using getters/setters and data attributes.

## How it works

### Define your template

```html
<div>
  <span data-bind="counter"></span>
  <button onclick="increment()">Increment</button>
  <hr />

  <input data-model="name" />
  <input data-model="lastname" />
  <button onclick="add()">Add</button><br />
  You are about to add: <span data-bind="name"></span> <span data-bind="lastname"></span>

  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Lastname</th>
      </tr>
    </thead>
    <tbody>
      <template data-for="list">
        <tr>
          <td data-each-bind="$.name"></td>
          <td data-each-bind="$.lastname"></td>
        </tr>
      </template>
    </tbody>
  </table>
</div>
```

### Define your script

```js
/**
 * Define the initial state:
 * Add `data-bind="counter"` to an html element, it will reload every time the counter is updated 
 * Add `data-model="name"` to an html input, the state will update every time the input changes
 * Add `data-for="list"` to an html template, a list will be created cloning the html first child
**/
let state = new Bynd({
  counter: 0,
  name: '',
  lastname: '',
  list: [
    { name: 'ciao', lastname: 'ciaone' },
    { name: 'prova', lastname: 'provetta' },
    { name: '2', lastname: '4' },
  ]
})

function increment() {
  // Update the variable to reload the html elements linked to this variable
  state.counter++
}
function add() {
  // Push a new element to reload the list linked with `bind-for`
  state.list.push({ name: state.name, lastname: state.lastname })
  state.name = ''
  state.lastname = ''
}
```

