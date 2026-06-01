(() => {
  const STORAGE_KEY = "tasteatlas_master_index";
  const COUNTER_KEY = "tasteatlas_csv_counter";

  const existing = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  // Use URL as unique key (IMPORTANT FIX)
  const map = new Map(
    existing.map(item => [item.url, item])
  );

  document.querySelectorAll(".card.food").forEach(card => {
    const name =
      card.querySelector("h6")?.textContent?.trim() || "";

    const rating =
      card.querySelector(".card__info-value")?.textContent?.trim() || "";

    const category =
      card.querySelector(".card__label")?.textContent?.trim() || "";

    const country =
      card.querySelector(".card__location a")?.textContent?.trim() || "";

    const url =
      card.querySelector(".card__visual-link")
        ?.getAttribute("href") || "";

    if (!url) return;

    map.set(url, {
      url,
      name,
      rating,
      category,
      country
    });
  });

  const merged = [...map.values()]
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

  const csvEscape = (v) =>
    `"${String(v || "")
      .replace(/"/g, '""')
      .replace(/\r?\n/g, " ")}"`;

  const csv = [
    ["name", "rating", "category", "country", "url"],
    ...merged.map(r => [
      csvEscape(r.name),
      csvEscape(r.rating),
      csvEscape(r.category),
      csvEscape(r.country),
      csvEscape(r.url)
    ])
  ]
    .map(row => row.join(","))
    .join("\r\n");

  let counter = Number(localStorage.getItem(COUNTER_KEY) || 0);
  counter++;
  localStorage.setItem(COUNTER_KEY, counter);

  const filename =
    counter === 1
      ? "tasteatlas-master.csv"
      : `tasteatlas-master-${counter}.csv`;

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(link.href);
  }, 1000);

  console.log(`Stored: ${merged.length} unique recipes`);
  console.log(`Exported: ${filename}`);
})();
