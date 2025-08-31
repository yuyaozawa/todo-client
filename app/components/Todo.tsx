'use client';

import React from 'react';
import { TodoType } from '../types';

type TodoProps = {
  todo: TodoType;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const Todo = ({ todo, onToggle, onEdit, onDelete }: TodoProps) => {
  return (
    <li className="py-4 flex items-center justify-between">
      <div className="flex items-center">
        <input
          id={`todo-${todo.id}`}
          name={`todo-${todo.id}`}
          type="checkbox"
          checked={todo.isCompleted}
          onChange={() => onToggle(todo.id)}
          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
        />
        <label htmlFor={`todo-${todo.id}`} className="ml-3 block text-gray-900">
          <span className={`text-lg font-medium ${todo.isCompleted ? 'line-through' : ''}`}>{todo.title}</span>
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => onEdit(todo.id)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-2 rounded"
        >
          ✒
        </button>
        <button
          type="button"
          onClick={() => onDelete(todo.id)}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded"
        >
          ✖
        </button>
      </div>
    </li>
  );
};

export default Todo;
