import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tools } from '@/data/tools'
import ToolApp from '@/components/tools/ToolApp'
import { experiments } from '@/data/experiments'
import ExperimentApp from '@/components/experiments/ExperimentApp'

export const dynamicParams = false
export function generateStaticParams() {
  return [...tools, ...experiments].map(({ slug }) => ({ slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const experiment = [...tools, ...experiments].find((item) => item.slug === slug)
  return { title: experiment?.title ?? 'Experiment', description: experiment?.description }
}
export default async function ExperimentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = tools.find((item) => item.slug === slug)
  if (tool) return <ToolApp key={tool.slug} tool={tool} />
  const experiment = experiments.find((item) => item.slug === slug)
  if (!experiment) notFound()
  return <ExperimentApp key={experiment.slug} experiment={experiment} />
}
