import { FormEvent, useEffect, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

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
    <AppLayout
      title="Todos"
      description="Create, update, and delete todos with Inertia + shadcn/ui."
    >
      <Card>
        <CardHeader>
          <CardTitle>Add Todo</CardTitle>
          <CardDescription>Create a new todo item.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitCreate} className="flex gap-2">
            <Input
              className="flex-1"
              value={createForm.data.title}
              onChange={(event) => createForm.setData('title', event.target.value)}
              placeholder="Add a todo..."
            />
            <Button type="submit">Add</Button>
          </form>
          {createForm.errors.title && (
            <p className="mt-2 text-sm text-destructive">{createForm.errors.title}</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 space-y-3">
        {todos.map((todo) => {
          const draft = drafts[todo.id] ?? todo;

          return (
            <Card key={todo.id} className="py-4">
              <CardContent className="flex items-center gap-3 px-4">
                <Checkbox
                  checked={draft.isCompleted}
                  onCheckedChange={(checked) =>
                    setDrafts((current) => ({
                      ...current,
                      [todo.id]: { ...draft, isCompleted: checked === true },
                    }))
                  }
                />
                <Input
                  className="flex-1"
                  value={draft.title}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [todo.id]: { ...draft, title: event.target.value },
                    }))
                  }
                />
                <Button variant="secondary" onClick={() => saveTodo(todo.id)}>
                  Save
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => router.delete(`/todos/${todo.id}`, { preserveScroll: true })}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
