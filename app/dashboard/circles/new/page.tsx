import { CreateCircleForm } from './CreateCircleForm'

interface NewCirclePageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function NewCirclePage({ searchParams }: NewCirclePageProps) {
  const { error } = await searchParams

  const twoMonthsAgo = new Date()
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
  const minDate = twoMonthsAgo.toISOString().split('T')[0]

  return <CreateCircleForm error={error} minDate={minDate} />
}
