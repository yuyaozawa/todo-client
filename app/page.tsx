'use client';

import { useRef } from 'react';
import useSWR from 'swr';
import Todo from './components/Todo';
import type { TodoType } from './types';
import { API_URL } from '@/constants/url';

const KEY = `${API_URL}/allTodos`;
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  const { data, isLoading, error, mutate } = useSWR<TodoType[]>(KEY, fetcher);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 作成（POST）: API保存 → SWRキャッシュを最新に
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = inputRef.current?.value.trim() ?? '';
    if (!t) return;

    await mutate(async (current) => {
      const res = await fetch(`${API_URL}/createTodos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: t, isCompleted: false }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created: TodoType = await res.json();
      return [ ...(current ?? []), created ];
    }, { revalidate: false });

    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  // 完了トグル（PUT）
  const toggleTodo = async (id: string) => {
    await mutate(async (current) => {
      if (!current) return current;
      const target = current.find(x => x.id === id);
      if (!target) return current;

      const res = await fetch(`${API_URL}/editTodos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: target.title,
          isCompleted: !target.isCompleted,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated: TodoType = await res.json();
      return current.map(x => (x.id === id ? updated : x));
    }, { revalidate: false });
  };

  // タイトル編集（PUT）
  const editTodo = async (id: string) => {
    if (!data) return;
    const current = data.find(x => x.id === id);
    if (!current) return;
    const next = window.prompt('Edit task', current.title);
    const newTitle = next?.trim();
    if (!newTitle) return;

    await mutate(async (list) => {
      const res = await fetch(`${API_URL}/editTodos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          isCompleted: current.isCompleted,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated: TodoType = await res.json();
      return (list ?? []).map(x => (x.id === id ? updated : x));
    }, { revalidate: false });
  };

  // 削除（DELETE）
  const deleteTodo = async (id: string) => {
    await mutate(async (current) => {
      const res = await fetch(`${API_URL}/deleteTodos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json(); 
      return (current ?? []).filter(x => x.id !== id);
    }, { revalidate: false });
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error)     return <div className="p-4 text-red-600">Fetch error</div>;

  const list = data ?? [];

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-32 py-4 px-4">
      <div className="px-4 py-2">
        <h1 className="text-gray-800 font-bold text-2xl uppercase">To-Do List</h1>
      </div>

      <form className="w-full max-w-sm mx-auto px-4 py-2" onSubmit={handleSubmit}>
        <div className="flex items-center border-b-2 border-teal-500 py-2">
          <input
            ref={inputRef}
            name="title"
            className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
            type="text"
            placeholder="Add a task"
          />
          <button
            className="duration-150 flex-shrink-0 bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700 text-sm border-4 text-white py-1 px-2 rounded"
            type="submit"
          >
            Add
          </button>
        </div>
      </form>

      <ul className="divide-y divide-gray-200 px-4">
        {list.map(t => (
          <Todo
            key={t.id}
            todo={t}
            onToggle={toggleTodo}
            onEdit={editTodo}
            onDelete={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
}
