(() => {
  const recipes = [];
  const names = document.querySelectorAll("h3.secondary"); //for the name of the recipe, searches for the h3.secondary element which contains the name

  names.forEach((nameEl) => {
    const card =
      nameEl.closest("article") ||
      nameEl.closest(".card") ||
      nameEl.parentElement; // this just searches

    const ratingEl = card?.querySelector(".card__info-value.fw-600");//for the rating of the recipe

    recipes.push({
      name: nameEl.textContent.trim(),
      rating: ratingEl
        ? parseFloat(ratingEl.textContent.trim())
        : null,
      page: location.href
    });
  });

  console.table(recipes);

  const blob = new Blob(
    [JSON.stringify(recipes, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "tasteatlas-recipes.json";
  a.click(); //downloads it as a jso

  URL.revokeObjectURL(a.href);
})();
