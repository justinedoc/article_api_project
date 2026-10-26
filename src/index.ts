import { serve } from "@hono/node-server";
import {Hono}  from "hono";

const app = new Hono()

app.notFound((c) => {
  return c.json({
   message: `${c.req.path} - not found`
  })
})

app.onError((error, c) => {
 console.log("[ERROR]", error.message, error)
 return c.json({
  message: error.message || "Unknown error occured"
 }, 500)
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
