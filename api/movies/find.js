async (id) => {
  let movie = null;

  if (id === 5) {
    movie = { title: 'The Godfather', year: 1972 };
  }

  return { status: 'ok', movie };
};
