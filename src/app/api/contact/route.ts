import { ContactError, handleContact } from '@/lib/contact-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const result = await handleContact(request)
    return Response.json({ ok: true, ...result }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const known = error instanceof ContactError
    const status = known ? error.status : 500
    return Response.json(
      {
        ok: false,
        message: known
          ? error.message
          : 'The message could not be sent. Please try again or use the email link.',
        ...(known && error.fields ? { fields: error.fields } : {}),
      },
      {
        status,
        headers: {
          'Cache-Control': 'no-store',
          ...(status === 429 ? { 'Retry-After': '900' } : {}),
        },
      },
    )
  }
}
