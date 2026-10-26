import { serve } from "@hono/node-server";
import {Hono}  from "hono";

const app = new Hono()

app.get("/", (c) => {
  return c.json({
    message: "Hello"
  })
})

app.notFound((c) => {
  return c.json({
   message: `${c.req.path} - not found`
  })
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
