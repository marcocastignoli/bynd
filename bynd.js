function setNested(obj, path, value) {
    var schema = obj;
    var pList = path.split('.');
    var len = pList.length;
    for (var i = 0; i < len - 1; i++) {
        var elem = pList[i];
        if (!schema[elem]) schema[elem] = {}
        schema = schema[elem];
    }

    schema[pList[len - 1]] = value;
}
function eventifyPush(arr, callback) {
    arr.push = function (e) {
        Array.prototype.push.call(arr, e);
        callback(arr);
    };
};

class Bynd {
    constructor(variables) {
        this.$variables = {}
        this.defineProperties(variables)
        this.bindModels()
    }
    defineProperties(variables) {
        // Dynamically create getters/setters starting for each variable passed in the costructor
        for (let variable in variables) {
            let init = variables[variable]
            Object.defineProperty(this, variable, {
                get: () => this.$variables[variable],
                set: v => {
                    this.$variables[variable] = v;
                    // Every time the setter is called, reload the html elements that are binded to the variable
                    this.bind(variable)
                    this.bindFor(variable)
                },
            })
            this[variable] = init
            if (init instanceof Array) {
                // Every time the push method (for arrays) is called, reload the html elements that are binded to the variable
                eventifyPush(this[variable], (e) => {
                    this.bind(variable)
                    this.bindFor(variable)
                })
            }
        }
    }
    bindModels() {
        [...document.querySelectorAll("[data-model]")].forEach(d => {
            const queryVariable = d.getAttribute('data-model')
            d.oninput = () => {
                setNested(this, queryVariable, d.value)
            }
        })
    }
    bind(variable) {
        /**
         * [data-bind^= it means starting with. This is used to search elements in the documents that 
         * begins with ${variable} e.g. data-bind="counter" for variable counter 
         */
        [...document.querySelectorAll(`[data-bind^='${variable}']`)].forEach(d1 => {
            const queryVariable = d1.getAttribute('data-bind')
            let finalValue = this[variable]
            let queryVariables = queryVariable.split('.')
            queryVariables.shift()
            queryVariables.forEach(a => {
                finalValue = finalValue[a]
            })
            d1.innerHTML = finalValue
        });
        [...document.querySelectorAll(`[data-model^='${variable}']`)].forEach(d1 => {
            const queryVariable = d1.getAttribute('data-model')
            let finalValue = this[variable]
            let queryVariables = queryVariable.split('.')
            queryVariables.shift()
            queryVariables.forEach(a => {
                finalValue = finalValue[a]
            })
            d1.value = finalValue
        })
    }
    bindFor(variable) {
        let variableFilter = ''
        if (variable) {
            variableFilter = `^="${variable}"`
        }
        [...document.querySelectorAll(`template[data-for${variableFilter}]`)].forEach(template => {
            const parentElement = template.parentElement
            parentElement.innerHTML = ''
            this[variable].forEach(value => {
                const node = document.importNode(template.content, true);
                [...node.querySelectorAll("[data-each-bind^='$']")].forEach(d1 => {
                    const queryVariable = d1.getAttribute('data-each-bind')
                    let finalValue = value
                    let queryVariables = queryVariable.split('.')
                    queryVariables.shift()
                    queryVariables.forEach(a => {
                        finalValue = finalValue[a]
                    })
                    d1.innerHTML = finalValue
                })
                parentElement.appendChild(node)
            })
            parentElement.appendChild(template)
        })
    }
}