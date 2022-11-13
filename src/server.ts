import Fastify from 'fastify'
import cors from '@fastify/cors'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import shortUniqueId from 'short-unique-id'

const prisma = new PrismaClient({
  log: ['query']
})

const bootstrap = async () => {
  const fastify = Fastify({
    logger: true
  })

  await fastify.register(cors, {
    origin: true
  })

  fastify.get('/pools/count', async () => {
    const count = await prisma.pool.count()

    return { count }
  })

  fastify.post('/pools', async (request, reply) => {
    const createPoolBy = z.object({
      title: z.string()
    })

    const { title } = createPoolBy.parse(request.body)

    const generate = new shortUniqueId({ length: 6 })
    const code = String(generate()).toUpperCase()

    await prisma.pool.create({
      data: {
        title,
        code: code
      }
    })

    return reply.status(201).send({ code })
  })

  await fastify.listen({ port: 3333 })
}

bootstrap()
