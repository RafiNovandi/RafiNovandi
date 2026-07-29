const fs = require("fs/promises");
const path = require("path");

async function updateStats() {
  try {
    // 1. Mengarah ke folder assets milikmu
    const templatePath = path.join(__dirname, "assets", "stats-template.svg");
    const outputPath = path.join(__dirname, "assets", "github-streak.svg");

    // 2. Baca file template SVG
    let template = await fs.readFile(templatePath, "utf-8");

    // 3. Fetch data SVG dari API
    const response = await fetch(
      "https://streak-stats.demolab.com/?user=RafiNovandi",
    );
    const streakSvg = await response.text();

    // 4. Ekstrak angka menggunakan Regex
    const matches = [...streakSvg.matchAll(/]*>([\d,]+)<\/text>/g)];
    const total = matches[0] ? matches[0][1] : "0";
    const current = matches[1] ? matches[1][1] : "0";
    const longest = matches[2] ? matches[2][1] : "0";

    // 5. Replace placeholder
    template = template.replace("{{TOTAL}}", total);
    template = template.replace("{{CURRENT}}", current);
    template = template.replace("{{LONGEST}}", longest);

    // 6. Simpan hasil akhirnya sebagai github-streak.svg di dalam assets/
    await fs.writeFile(outputPath, template);
    console.log(`Berhasil update! Total: ${total}, Streak: ${current}`);
  } catch (error) {
    console.error("Gagal update SVG:", error);
  }
}

updateStats();
