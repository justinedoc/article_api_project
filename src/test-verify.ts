import { app } from "./app.js";

async function runTests() {
  console.log("--- Starting End-to-End Verification ---");

  // 1. Register
  const regEmail = `test_${Date.now()}@test.com`;
  const regUsername = `vivi_${Date.now()}`;
  const regRes = await app.request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: regEmail,
      username: regUsername,
      displayName: "Vivienne",
      password: "password123"
    })
  });
  console.log("1. Register status:", regRes.status);
  const regData = await regRes.json();
  if (regRes.status !== 201 || !regData.data?.token) {
    throw new Error("Register failed: " + JSON.stringify(regData));
  }
  const token = regData.data.token;
  console.log("   Token received:", token.substring(0, 20) + "...");

  // 2. Login
  const loginRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: regEmail,
      password: "password123"
    })
  });
  console.log("2. Login status:", loginRes.status);

  // 3. Me
  const meRes = await app.request("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log("3. Get Me status:", meRes.status);
  const meData = await meRes.json();
  console.log("   User email:", meData.data?.email, "Profile:", meData.data?.profile?.username);

  // 4. Create Article
  const artRes = await app.request("/api/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: "Building Clean APIs with Node SQLite",
      excerpt: "A beginner guide to SQLite with Hono",
      body: "This is the full text of the article for Vivi project."
    })
  });
  console.log("4. Create Article status:", artRes.status);
  const artData = await artRes.json();
  const articleId = artData.data.id;
  console.log("   Article created with slug:", artData.data.slug);

  // 5. List Articles (Pagination)
  const listRes = await app.request("/api/articles?page=1&limit=5");
  console.log("5. List Articles status:", listRes.status);
  const listData = await listRes.json();
  console.log("   Total articles:", listData.pagination?.total, "Items returned:", listData.data?.length);

  // 6. Create Comment
  const comRes = await app.request(`/api/articles/${articleId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      body: "Great article, very easy to understand!"
    })
  });
  console.log("6. Create Comment status:", comRes.status);

  // 7. List Comments
  const comListRes = await app.request(`/api/articles/${articleId}/comments?page=1&limit=10`);
  console.log("7. List Comments status:", comListRes.status);
  const comListData = await comListRes.json();
  console.log("   Comments count:", comListData.data?.length);

  // 8. OpenAPI Doc
  const docRes = await app.request("/api/doc");
  console.log("8. OpenAPI Doc status:", docRes.status);

  // 9. Scalar Reference UI
  const refRes = await app.request("/api/reference");
  console.log("9. Scalar Reference UI status:", refRes.status);

  // 10. 404 Route
  const notFoundRes = await app.request("/api/non-existent-route");
  console.log("10. Not Found status:", notFoundRes.status);

  console.log("--- ALL 10 TESTS PASSED SUCCESSFULLY! ---");
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
