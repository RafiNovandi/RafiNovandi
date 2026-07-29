const fs = require("fs/promises");
const path = require("path");

async function updateStats() {
  try {
    const templatePath = path.join(__dirname, "assets", "stats-template.svg");
    const outputPath = path.join(__dirname, "assets", "github-streak.svg");
    let template = await fs.readFile(templatePath, "utf-8");

    // ==========================================
    // 1. FETCH & INJECT STREAK STATS (Angka & Tanggal)
    // ==========================================
    const streakRes = await fetch(
      "https://streak-stats.demolab.com/?user=RafiNovandi",
    );
    const streakSvg = await streakRes.text();

    // A. Ekstrak Angka (Total, Current, Longest)
    const streakMatches = [
      ...streakSvg.matchAll(/<text[^>]*>\s*([\d,]+)\s*<\/text>/g),
    ];
    const total = streakMatches[0] ? streakMatches[0][1] : "0";
    const current = streakMatches[1] ? streakMatches[1][1] : "0";
    const longest = streakMatches[2] ? streakMatches[2][1] : "0";

    // B. Ekstrak Tanggal (Misal: Sep 23, 2021 - Present)
    // Mencari pola teks yang mengandung nama bulan dan tanda strip "-"
    const dateMatches = [
      ...streakSvg.matchAll(
        />\s*([A-Z][a-z]{2} \d{1,2}[^<]* - [^<]+?)\s*<\/text>/g,
      ),
    ];
    const totalDate = dateMatches[0] ? dateMatches[0][1].trim() : "";
    const currentDate = dateMatches[1] ? dateMatches[1][1].trim() : "";
    const longestDate = dateMatches[2] ? dateMatches[2][1].trim() : "";

    // Replace placeholder angka & tanggal
    template = template.replace("{{TOTAL}}", total);
    template = template.replace("{{CURRENT}}", current);
    template = template.replace("{{LONGEST}}", longest);
    template = template.replace("{{TOTAL_DATE}}", totalDate);
    template = template.replace("{{CURRENT_DATE}}", currentDate);
    template = template.replace("{{LONGEST_DATE}}", longestDate);

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

    let langBars = "";
    let langLegends = "";
    let currentX = 25;

    langMatches.forEach((match, index) => {
      const color = match[1];
      const name = match[2].trim();
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
