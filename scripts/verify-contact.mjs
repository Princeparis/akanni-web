// Runs the built application against a local, certificate-verified SMTPS mailbox.
// It never connects to Gmail or sends messages outside this machine.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { execFileSync, spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import tls from 'node:tls'
import net from 'node:net'
import { setTimeout as wait } from 'node:timers/promises'

const directory = await mkdtemp(path.join(tmpdir(), 'rayab-contact-'))
const messages = []
const sockets = new Set()
const children = []
let rejectNext = false
let mailbox
let logs = ''

const listen = (server) =>
  new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => resolve(server.address().port))
  })
const freePort = async () => {
  const server = net.createServer()
  const port = await listen(server)
  await new Promise((resolve) => server.close(resolve))
  return port
}

function mimeParts(raw) {
  const end = raw.indexOf('\r\n\r\n')
  assert.ok(end >= 0, 'MIME part must have headers and body')
  const headers = Object.fromEntries(
    raw
      .slice(0, end)
      .replace(/\r\n[\t ]+/g, ' ')
      .split('\r\n')
      .map((line) => {
        const colon = line.indexOf(':')
        return [line.slice(0, colon).toLowerCase(), line.slice(colon + 1).trim()]
      }),
  )
  const body = raw.slice(end + 4)
  const boundary = headers['content-type']?.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i)
  if (boundary)
    return body
      .split(`--${boundary[1] || boundary[2]}`)
      .slice(1, -1)
      .flatMap((part) => mimeParts(part.replace(/^\r\n/, '').replace(/\r\n$/, '')))
  const encoding = headers['content-transfer-encoding']?.toLowerCase()
  const bytes =
    encoding === 'base64'
      ? Buffer.from(body.replace(/\s/g, ''), 'base64')
      : encoding === 'quoted-printable'
        ? Buffer.from(
            body
              .replace(/=\r\n/g, '')
              .replace(/=([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))),
            'binary',
          )
        : Buffer.from(body)
  return [{ headers, bytes }]
}

try {
  const keyFile = path.join(directory, 'key.pem'),
    certFile = path.join(directory, 'cert.pem')
  execFileSync(
    'openssl',
    [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-nodes',
      '-keyout',
      keyFile,
      '-out',
      certFile,
      '-days',
      '1',
      '-subj',
      '/CN=localhost',
      '-addext',
      'subjectAltName=IP:127.0.0.1,DNS:localhost',
      '-addext',
      'basicConstraints=critical,CA:TRUE',
    ],
    { stdio: 'ignore' },
  )
  mailbox = tls.createServer(
    { key: await readFile(keyFile), cert: await readFile(certFile), minVersion: 'TLSv1.2' },
    (socket) => {
      sockets.add(socket)
      socket.on('close', () => sockets.delete(socket))
      socket.on('error', () => {})
      socket.setEncoding('utf8')
      let pending = '',
        auth = '',
        username = '',
        authenticated = false,
        inData = false,
        data = [],
        envelope = { from: '', to: [] }
      socket.write('220 localhost SMTPS test mailbox\r\n')
      socket.on('data', (chunk) => {
        pending += chunk
        let end
        while ((end = pending.indexOf('\r\n')) !== -1) {
          const line = pending.slice(0, end)
          pending = pending.slice(end + 2)
          if (inData) {
            if (line === '.') {
              inData = false
              if (rejectNext) {
                rejectNext = false
                socket.write('550 5.7.1 Simulated delivery failure\r\n')
              } else {
                messages.push({ envelope, raw: data.join('\r\n') })
                socket.write('250 2.0.0 Message accepted locally\r\n')
              }
              data = []
              envelope = { from: '', to: [] }
            } else data.push(line.startsWith('..') ? line.slice(1) : line)
            continue
          }
          if (auth === 'user') {
            username = Buffer.from(line, 'base64').toString()
            auth = 'password'
            socket.write('334 UGFzc3dvcmQ6\r\n')
            continue
          }
          if (auth === 'password') {
            auth = ''
            authenticated =
              username === 'sender@example.com' &&
              Buffer.from(line, 'base64').toString() === 'fixture-only'
            socket.write(
              authenticated ? '235 2.7.0 Authenticated\r\n' : '535 Authentication failed\r\n',
            )
            continue
          }
          if (/^EHLO|^HELO/i.test(line))
            socket.write('250-localhost\r\n250-AUTH PLAIN LOGIN\r\n250 SIZE 5000000\r\n')
          else if (/^AUTH PLAIN/i.test(line)) {
            const credentials = Buffer.from(line.split(' ')[2] || '', 'base64')
              .toString()
              .split('\0')
            authenticated =
              credentials[1] === 'sender@example.com' && credentials[2] === 'fixture-only'
            socket.write(
              authenticated ? '235 2.7.0 Authenticated\r\n' : '535 Authentication failed\r\n',
            )
          } else if (/^AUTH LOGIN/i.test(line)) {
            auth = 'user'
            socket.write('334 VXNlcm5hbWU6\r\n')
          } else if (/^MAIL FROM:/i.test(line)) {
            if (!authenticated) {
              socket.write('530 Authentication required\r\n')
              continue
            }
            envelope.from = line
            socket.write('250 OK\r\n')
          } else if (/^RCPT TO:/i.test(line)) {
            envelope.to.push(line)
            socket.write(
              /<wemzain@gmail\.com>/i.test(line) ? '250 OK\r\n' : '550 Unexpected recipient\r\n',
            )
          } else if (/^DATA$/i.test(line)) {
            inData = true
            socket.write('354 End with a dot\r\n')
          } else if (/^QUIT$/i.test(line)) socket.end('221 Goodbye\r\n')
          else if (/^RSET$/i.test(line)) {
            data = []
            envelope = { from: '', to: [] }
            socket.write('250 OK\r\n')
          } else socket.write('250 OK\r\n')
        }
      })
    },
  )
  const smtpPort = await listen(mailbox)
  const start = async (password) => {
    const port = await freePort()
    const child = spawn(
      process.execPath,
      [
        path.resolve('node_modules/next/dist/bin/next'),
        'start',
        '--hostname',
        '127.0.0.1',
        '--port',
        String(port),
      ],
      {
        env: {
          ...process.env,
          SMTP_HOST: '127.0.0.1',
          SMTP_PORT: String(smtpPort),
          SMTP_USER: 'sender@example.com',
          SMTP_PASSWORD: password,
          NODE_EXTRA_CA_CERTS: certFile,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    )
    children.push(child)
    child.stdout.on('data', (chunk) => {
      logs = (logs + chunk).slice(-6000)
    })
    child.stderr.on('data', (chunk) => {
      logs = (logs + chunk).slice(-6000)
    })
    const origin = `http://127.0.0.1:${port}`
    const deadline = Date.now() + 30000
    while (Date.now() < deadline) {
      if (child.exitCode !== null) throw new Error(`Application exited before readiness: ${logs}`)
      try {
        const response = await fetch(origin + '/api/contact')
        if (response.status === 405) return origin
      } catch {
        /* Wait for the server. */
      }
      await wait(100)
    }
    throw new Error(`Application did not start: ${logs}`)
  }
  const origin = await start('fixture-only')
  function body(id = randomUUID(), overrides = {}, file = 'A small reference brief.') {
    const form = new FormData()
    const values = {
      name: 'Jamie Rivera',
      email: 'jamie@example.com',
      company: 'Fieldwork',
      subject: 'A new website',
      message: 'A thoughtful digital home. <script>not executable</script>',
      topic: 'A website',
      website: '',
      submissionId: id,
      ...overrides,
    }
    for (const [key, value] of Object.entries(values)) form.set(key, value)
    if (file !== null)
      form.append('attachments', new Blob([file], { type: 'text/plain' }), 'brief.txt')
    return form
  }
  const post = (form, ip = '198.51.100.1', source = origin) =>
    fetch(origin + '/api/contact', {
      method: 'POST',
      headers: { Origin: source, 'X-Forwarded-For': ip },
      body: form,
    })
  const id = randomUUID()
  let response = await post(body(id))
  assert.equal(response.status, 200, await response.clone().text())
  assert.equal((await response.json()).reference, id)
  assert.equal(messages.length, 1)
  const raw = messages[0].raw.replace(/=\r\n/g, '')
  const parts = mimeParts(messages[0].raw)
  const html = parts
    .find((part) => part.headers['content-type']?.startsWith('text/html'))
    ?.bytes.toString('utf8')
  const plain = parts
    .find((part) => part.headers['content-type']?.startsWith('text/plain'))
    ?.bytes.toString('utf8')
  assert.ok(html, 'HTML alternative must exist')
  assert.ok(
    plain?.includes('RAYAB / OPEN LINE'),
    'Plain-text alternative must also carry the brand',
  )
  assert.match(raw, /Content-Type: multipart\/related/)
  const logoCids = [...html.matchAll(/src="cid:([^"]+)"/g)].map((match) => match[1])
  assert.equal(logoCids.length, 2, 'Official wordmark and mark must both be embedded')
  for (const cid of logoCids) {
    const image = parts.find((part) => part.headers['content-id'] === `<${cid}>`)
    assert.ok(image, `CID ${cid} must resolve to an actual MIME part`)
    assert.match(image.headers['content-type'], /^image\/png/)
    assert.match(image.headers['content-disposition'], /^inline/)
    assert.equal(image.bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
    assert.ok(image.bytes.length > 1000, 'Logo must contain real PNG pixels')
  }
  assert.match(html, /\[if mso\]/)
  assert.ok(
    !/<svg\b|src="https?:/i.test(html),
    'Email branding must not depend on SVG or remote images',
  )
  assert.match(messages[0].envelope.from, /<sender@example\.com>/)
  assert.deepEqual(messages[0].envelope.to, ['RCPT TO:<wemzain@gmail.com>'])
  assert.match(raw, /Reply-To:.*jamie@example\.com/)
  assert.match(raw, /Subject: \[Rayab\] A new website/)
  assert.match(raw, /Content-Type: text\/plain/)
  assert.match(raw, /Content-Type: text\/html/)
  assert.ok(
    html.includes('&lt;script&gt;not executable&lt;/script&gt;'),
    'HTML must escape visitor text',
  )
  assert.match(raw, /filename=brief\.txt/)
  assert.ok(
    raw.includes(Buffer.from('A small reference brief.').toString('base64')),
    'Attachment bytes must survive SMTP',
  )
  response = await post(body(id))
  assert.equal(response.status, 200)
  assert.equal(messages.length, 1, 'Retry must not transmit a second message in the same process')
  assert.equal((await post(body(id, { subject: 'Different payload' }))).status, 409)
  assert.equal((await post(body(undefined, { website: 'bot.example' }))).status, 400)
  assert.equal((await post(body(), '198.51.100.2', 'https://unrelated.example')).status, 403)
  assert.equal(
    (await post(body(undefined, { email: 'bad\r\nBcc: somebody@example.com' }))).status,
    400,
  )
  const forged = body(undefined, {}, null)
  forged.append('attachments', new Blob(['Not a PDF'], { type: 'application/pdf' }), 'brief.pdf')
  assert.equal((await post(forged)).status, 400)
  assert.equal(messages.length, 1)
  rejectNext = true
  const retryId = randomUUID()
  assert.equal((await post(body(retryId), '198.51.100.3')).status, 502)
  assert.equal((await post(body(retryId), '198.51.100.3')).status, 200)
  for (let index = 0; index < 5; index++)
    assert.equal((await post(body(), '198.51.100.4')).status, 200)
  assert.equal((await post(body(), '198.51.100.4')).status, 429)
  const offline = await start('')
  response = await fetch(offline + '/api/contact', {
    method: 'POST',
    headers: { Origin: offline },
    body: body(),
  })
  assert.equal(response.status, 503, 'Unconfigured delivery must never claim success')
  console.log(
    'PASS: verified-TLS SMTP, fixed recipient, reply-to, branded HTML + plain text, embedded PNG logos with matching CID parts, Outlook wrapper, escaped content, attachment bytes, retry deduplication, validation, SMTP failure/retry, throttling, and missing-credential response.',
  )
  console.log('Messages were captured locally. No email was sent to Gmail.')
} catch (error) {
  console.error(error)
  if (logs) console.error('Application output:', logs)
  process.exitCode = 1
} finally {
  for (const child of children) child.kill('SIGTERM')
  for (const socket of sockets) socket.destroy()
  if (mailbox) await new Promise((resolve) => mailbox.close(resolve))
  await Promise.all(
    children.map((child) =>
      child.exitCode !== null
        ? undefined
        : new Promise((resolve) => {
            child.once('exit', resolve)
            const timeout = setTimeout(() => {
              child.kill('SIGKILL')
              resolve()
            }, 3000)
            timeout.unref()
          }),
    ),
  )
  await rm(directory, { recursive: true, force: true })
}
