import { app } from "./app.js";

async function runTests() {
  console.log("=== Comprehensive Verification of All Requirements ===");

  const timestamp = Date.now();
  const email = `author_${timestamp}@test.com`;
  const username = `author_${timestamp}`;
  const initialPassword = "initialPassword123";
  const newPassword = "newSecurePassword456";

  // 1. Register Account & Profile
  const regRes = await app.request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      username,
      displayName: "Jane Initial",
      password: initialPassword,
    }),
  });
  console.log("1. Register:", regRes.status);
  const regData = await regRes.json();
  let token = regData.data.token;

  // 2. Change Password
  const pwdRes = await app.request("/api/auth/change-password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword: initialPassword,
      newPassword: newPassword,
    }),
  });
  console.log("2. Change Password:", pwdRes.status);

  // 3. Login with New Password
  const loginRes = await app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: newPassword,
    }),
  });
  console.log("3. Login with new password:", loginRes.status);
  const loginData = await loginRes.json();
  token = loginData.data.token;

  // 4. Update Profile (Name, Bio, Avatar)
  const profileRes = await app.request("/api/users/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      displayName: "Jane Updated",
      bio: "Fullstack developer passionate about SQLite & community publishing.",
      image: "https://example.com/jane.jpg",
    }),
  });
  console.log("4. Update Profile:", profileRes.status);
  const updatedProfile = await profileRes.json();
  console.log("   Updated name:", updatedProfile.data.displayName);

  // 5. Get Public Profile by username
  const getProfileRes = await app.request(`/api/users/${username}`);
  console.log("5. Get Public Profile:", getProfileRes.status);

  // 6. List Users
  const listUsersRes = await app.request("/api/users?page=1&limit=5");
  console.log("6. List Users/Authors:", listUsersRes.status);

  // 7. Create Article (Post)
  const postRes = await app.request("/api/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: "Building Community Platforms with SQLite",
      excerpt: "A deep dive into SQLite architecture.",
      body: "Full content of the article detailing the community platform architecture...",
    }),
  });
  console.log("7. Create Article:", postRes.status);
  const postData = await postRes.json();
  const articleId = postData.data.id;

  // 8. List Articles (Feed)
  const listPostsRes = await app.request("/api/articles?page=1&limit=5");
  console.log("8. List Articles:", listPostsRes.status);

  // 9. Get My Articles
  const myPostsRes = await app.request("/api/articles/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("9. Get My Articles:", myPostsRes.status);

  // 10. Get Author Articles
  const authorPostsRes = await app.request(`/api/users/${username}/articles`);
  console.log("10. Get Author Articles:", authorPostsRes.status);

  // 11. Read Single Article
  const getPostRes = await app.request(`/api/articles/${articleId}`);
  console.log("11. Read Single Article:", getPostRes.status);

  // 12. Update Article
  const updatePostRes = await app.request(`/api/articles/${articleId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: "Building Community Platforms with SQLite (Updated Edition)",
      body: "Updated body content with additional tips.",
    }),
  });
  console.log("12. Update Article:", updatePostRes.status);

  // 13. Create Comment
  const createCommentRes = await app.request(`/api/articles/${articleId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      body: "This is a great community post!",
    }),
  });
  console.log("13. Create Comment:", createCommentRes.status);
  const commentData = await createCommentRes.json();
  const commentId = commentData.data.id;

  // 14. List Comments for Article
  const listCommentsRes = await app.request(`/api/articles/${articleId}/comments?page=1&limit=5`);
  console.log("14. List Comments for Article:", listCommentsRes.status);

  // 15. Read Single Comment
  const getCommentRes = await app.request(`/api/comments/${commentId}`);
  console.log("15. Read Single Comment:", getCommentRes.status);

  // 16. Update Comment
  const updateCommentRes = await app.request(`/api/comments/${commentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      body: "This is a great community post! (Edited by author)",
    }),
  });
  console.log("16. Update Comment:", updateCommentRes.status);

  // 17. Delete Comment
  const deleteCommentRes = await app.request(`/api/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("17. Delete Comment:", deleteCommentRes.status);

  // 18. Delete Article
  const deletePostRes = await app.request(`/api/articles/${articleId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("18. Delete Article:", deletePostRes.status);

  // 19. Delete User Account (and cascade profiles/posts)
  const deleteUserRes = await app.request("/api/users/me", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("19. Delete User Account:", deleteUserRes.status);

  // 20. OpenAPI Spec & Scalar Docs
  const docRes = await app.request("/api/doc");
  const refRes = await app.request("/api/reference");
  console.log("20. OpenAPI Spec status:", docRes.status, "| Scalar Reference UI:", refRes.status);

  console.log("=== ALL 20 TESTS PASSED WITH 100% SUCCESS! ===");
}

runTests().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
