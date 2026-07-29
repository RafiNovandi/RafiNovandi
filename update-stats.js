const fs = require("fs/promises");
const path = require("path");

async function updateStats() {
  try {
    const templatePath = path.join(__dirname, "assets", "stats-template.svg");
    const outputPath = path.join(__dirname, "assets", "github-streak.svg");
    let template = await fs.readFile(templatePath, "utf-8");

    // ==========================================
    // 2. FETCH & INJECT TOP LANGUAGES
    // ==========================================
    const langsRes = await fetch(
      "https://github-readme-stats.shion.dev/api/top-langs/?username=RafiNovandi&layout=compact&hide_border=false&include_all_commits=true&count_private=true",
    );
    const langsSvg = await langsRes.text();

    const regex =
      /<g transform="translate[^>]*>.*?fill="([^"]+)".*?<text[^>]*>\s*([^<]+?)\s+([\d.]+)%\s*<\/text>.*?<\/g>/gs;
    const langMatches = [...langsSvg.matchAll(regex)];

    const customColors = {
      TypeScript: "#3498DB",
      Kotlin: "#A97BFF",
      CSS: "#2ECC71",
      PLpgSQL: "#336790",
      HTML: "#E74C3C",
      JavaScript: "#F1C40F",
    };

    let langBars = "";
    let langLegends = "";
    let currentX = 25;

    langMatches.forEach((match, index) => {
      const name = match[2].trim();

      // LOGIKA WARNA: Pakai custom color jika ada di kamus, jika tidak ada pakai warna asli bawaan API
      const color = customColors[name] || match[1];

      const percent = parseFloat(match[3]);

      // Bikin garis Progress Bar
      const width = (percent / 100) * 290;
      langBars += `            <rect x="${currentX}" y="60" width="${width}" height="8" fill="${color}"/>\n`;
      currentX += width;

      // Bikin teks Legend (Format 2 Kolom)
      const col = index % 2;
      const row = Math.floor(index / 2);
      const cx = col === 0 ? 28 : 178;
      const textX = col === 0 ? 40 : 190;
      const cy = 95 + row * 30;

      langLegends += `        <circle cx="${cx}" cy="${cy}" r="4" fill="${color}"/>\n`;
      langLegends += `        <text x="${textX}" y="${cy + 4}" class="lang-text">${name} ${percent}%</text>\n`;
    });

    template = template.replace("{{LANG_BARS}}", langBars);
    template = template.replace("{{LANG_LEGENDS}}", langLegends);

    // ==========================================
    // 3. SIMPAN HASIL AKHIR
    // ==========================================
    await fs.writeFile(outputPath, template);
    console.log(
      `Update sukses! Streak: ${current} (${currentDate}). Bahasa: ${langMatches.length}`,
    );
  } catch (error) {
    console.error("Gagal update SVG:", error);
  }
}

updateStats();
