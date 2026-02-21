import { Link } from '@inertiajs/react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  appName: string;
};

export default function Index({ appName }: Props) {
  return (
    <AppLayout
      title={appName}
      description="Welcome to the Inertia + React home page."
      actions={
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/todos">Open Todos</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/privacy">Privacy</Link>
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            This app uses ASP.NET Core, Inertia, React, and shadcn/ui primitives.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Start by opening Todos and creating your first item.
        </CardContent>
      </Card>
    </AppLayout>
  )
}
