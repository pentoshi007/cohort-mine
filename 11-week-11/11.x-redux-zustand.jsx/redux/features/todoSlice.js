import { createSlice, nanoid } from '@reduxjs/toolkit';
const initialState = {
    todos: [{ id: 1, text: "hello world" }]
}
const todoSlice = createSlice({
    name: 'todos',
    initialState,
    reducers: {
        addTodo: (state, action) => {
            const todo = {
                id: nanoid(),
                text: action.payload
            };
            state.todos.push(todo);
        },
    },
    removeTodo: (state, action) => { },
},
)
export const { addTodo, removeTodo } = todoSlice.actions;
export default todoSlice.reducer;
