//task-explain what is document
//selection methods
document.querySelector('h1');
document.getElementById('h1');
document.getElementsByClassName('h1');
document.querySelectorAll('h1');
//task-where to use innerHTML and textContent and innerText


//deleting
function deleteTodo(index) {
    const element = document.getElementById(`todo-${index}`);
    element.parentNode.removeChild(element);

}

//task-difference between element and node, parentNode and parentElement etc

//creating elements
const divElement = document.createElement('div');
document.querySelector('body').appendChild(divElement);
document.children[0]
appendChild(divElement);
append(divElement); //vs appendChild