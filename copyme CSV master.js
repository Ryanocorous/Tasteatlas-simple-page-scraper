(() => {
  const STORAGE_KEY = "tasteatlas_master_index";
  const COUNTER_KEY = "tasteatlas_csv_counter";

  const existing = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  const recipeMap = new Map(
    existing.map(item => [
      item.name.normalize("NFC").trim().toLowerCase(),
      item
    ])
  );

  document.querySelectorAll("h3.secondary").forEach((nameEl) => {
    const card =
      nameEl.closest("article") ||
      nameEl.closest(".card") ||
      nameEl.parentElement;

    const ratingEl =
      card?.querySelector(".card__info-value.fw-600");

    let name = nameEl.textContent || "";
    let rating = ratingEl?.textContent || "";

    // Clean problematic whitespace
    name = name
      .normalize("NFC")
      .replace(/\s+/g, " ")
      .trim();

    rating = rating
      .normalize("NFC")
      .replace(/\s+/g, " ")
      .trim();

    if (!name) return;

    recipeMap.set(
      name.toLowerCase(),
      {
        name,
        rating
      }
    );
  });

  const merged = [...recipeMap.values()]
    .sort((a, b) =>
      a.name.localeCompare(
        b.name,
        undefined,
        { sensitivity: "base" }
      )
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(merged)
  );

  // Proper CSV escaping
  const csvEscape = (value) =>
    `"${String(value)
      .replace(/"/g, '""')
      .replace(/\r?\n/g, " ")
      .replace(/\t/g, " ")}"`;

  const csv = [
    ["name", "rating"],
    ...merged.map(item => [
      csvEscape(item.name),
      csvEscape(item.rating)
    ])
  ]
    .map(row => row.join(","))
    .join("\r\n");

  let counter = Number(
    localStorage.getItem(COUNTER_KEY) || 0
  );

  counter++;

  localStorage.setItem(
    COUNTER_KEY,
    counter
  );

  const filename =
    counter === 1
      ? "tasteatlas-master.csv"
      : `tasteatlas-master-${counter}.csv`;

  // UTF-8 BOM fixes Excel character corruption
  const BOM = "\uFEFF";

  const blob = new Blob(
    [BOM + csv],
    {
      type: "text/csv;charset=utf-8;"
    }
  );

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(link.href);

  console.log(
    `Master index contains ${merged.length} unique recipes`
  );

  console.log(`Exported ${filename}`);
})();
