import { Link } from '@inertiajs/react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Privacy() {
  return (
    <AppLayout
      title="Privacy"
      description="This page is rendered via Inertia + React."
      actions={
        <Button variant="outline" asChild>
          <Link href="/">Back Home</Link>
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Privacy Notice</CardTitle>
          <CardDescription>Basic placeholder privacy content for your template.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Replace this content with your project-specific privacy policy.
        </CardContent>
      </Card>
    </AppLayout>
  )
}
