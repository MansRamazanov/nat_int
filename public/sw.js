self.addEventListener("fetch", function (event) {
  const url = new URL(event.request.url);

  if (url.pathname.includes("/_matrix/media/r0/")) {
    event.respondWith(
      fetch(event.request.url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "matrix_access_token"
          )}`,
        },
      })
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});
