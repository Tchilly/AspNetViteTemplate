import { FormEvent, useEffect, useState } from 'react';
import { router, useForm } from '@inertiajs/react';

type Todo = {
  id: number;
  title: string;
  isCompleted: boolean;
};

type Props = {
  todos: Todo[];
};

export default function Index({ todos }: Props) {
  const createForm = useForm({ title: '' });
  const [drafts, setDrafts] = useState<Record<number, Todo>>(
    Object.fromEntries(todos.map((todo) => [todo.id, todo])),
  );

  useEffect(() => {
    setDrafts(Object.fromEntries(todos.map((todo) => [todo.id, todo])));
  }, [todos]);

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createForm.post('/todos', {
      preserveScroll: true,
      onSuccess: () => createForm.reset('title'),
    });
  };

  const saveTodo = (todoId: number) => {
    const draft = drafts[todoId];
    if (!draft) {
      return;
    }

    router.put(`/todos/${todoId}`, {
      title: draft.title,
      isCompleted: draft.isCompleted,
    }, {
      preserveScroll: true,
    });
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Todo App</h1>

      <form onSubmit={submitCreate} className="mt-6 flex gap-2">
        <input
          className="flex-1 rounded border border-gray-300 px-3 py-2"
          value={createForm.data.title}
          onChange={(event) => createForm.setData('title', event.target.value)}
          placeholder="Add a todo..."
        />
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">Add</button>
      </form>
      {createForm.errors.title && <p className="mt-2 text-sm text-red-600">{createForm.errors.title}</p>}

      <ul className="mt-6 space-y-3">
        {todos.map((todo) => {
          const draft = drafts[todo.id] ?? todo;

          return (
            <li key={todo.id} className="rounded border border-gray-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.isCompleted}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [todo.id]: { ...draft, isCompleted: event.target.checked },
                    }))
                  }
                />
                <input
                  className="flex-1 rounded border border-gray-300 px-2 py-1"
                  value={draft.title}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [todo.id]: { ...draft, title: event.target.value },
                    }))
                  }
                />
                <button
                  type="button"
                  className="rounded bg-emerald-600 px-3 py-1 text-white"
                  onClick={() => saveTodo(todo.id)}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="rounded bg-red-600 px-3 py-1 text-white"
                  onClick={() => router.delete(`/todos/${todo.id}`, { preserveScroll: true })}
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
