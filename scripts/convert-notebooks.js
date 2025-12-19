#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Jupyter Notebook to MDX Converter
 *
 * Usage:
 *   node scripts/convert-notebooks.js [source_dir] [output_dir]
 *
 * Example:
 *   node scripts/convert-notebooks.js ../1_Python src/content/chapters/python
 */

const fs = require("fs");
const path = require("path");

// Module ID mapping
const MODULE_MAPPING = {
  "1_Python": "python",
  "2_DataAnalysis": "data-analysis",
  "3_LLM": "llm",
  "4_PromptEngineering": "prompt-engineering",
  "5_RAG": "rag",
  "6_FineTuning": "fine-tuning",
};

// Chapter slug mapping based on order
const CHAPTER_SLUGS = {
  python: ["setup", "variables", "functions", "data-structures", "classes"],
  "data-analysis": [
    "numpy",
    "pandas",
    "text-preprocessing",
    "text-statistics",
    "text-analysis-system",
  ],
  llm: ["openai-api", "langchain-basics"],
  "prompt-engineering": [
    "templates",
    "lcel",
    "tool-call",
    "react-agent",
    "report-agent",
    "doc-summary",
  ],
  rag: [
    "loader-splitter",
    "embeddings",
    "basic-rag",
    "advanced-rag",
    "multimodal-rag",
    "evaluation",
  ],
  "fine-tuning": [
    "first-chain",
    "cpt-data",
    "instruction-data",
    "instruction-tuning",
    "lora",
    "continuous-pretraining",
  ],
};

/**
 * Parse Jupyter Notebook JSON
 */
function parseNotebook(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

/**
 * Extract title from notebook filename
 */
function extractTitle(filename) {
  // Remove [실습] prefix and .ipynb extension
  let title = filename
    .replace(/^\[실습\]\s*/, "")
    .replace(/^\[정답\]\s*/, "")
    .replace(/\.ipynb$/, "")
    .trim();
  return title;
}

/**
 * Convert notebook cell to MDX
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function cellToMdx(cell, index) {
  const { cell_type, source, outputs } = cell;
  const content = Array.isArray(source) ? source.join("") : source;

  if (!content.trim()) {
    return "";
  }

  if (cell_type === "markdown") {
    return content + "\n\n";
  }

  if (cell_type === "code") {
    let mdx = "```python\n" + content.trim() + "\n```\n\n";

    // Add output if exists
    if (outputs && outputs.length > 0) {
      const outputText = extractOutput(outputs);
      if (outputText) {
        mdx +=
          '<Callout type="note" title="실행 결과">\n\n```\n' +
          outputText +
          "\n```\n\n</Callout>\n\n";
      }
    }

    return mdx;
  }

  return "";
}

/**
 * Extract output from notebook cell outputs
 */
function extractOutput(outputs) {
  const textOutputs = [];

  for (const output of outputs) {
    if (output.output_type === "stream" && output.text) {
      const text = Array.isArray(output.text)
        ? output.text.join("")
        : output.text;
      textOutputs.push(text);
    } else if (output.output_type === "execute_result" && output.data) {
      if (output.data["text/plain"]) {
        const text = Array.isArray(output.data["text/plain"])
          ? output.data["text/plain"].join("")
          : output.data["text/plain"];
        textOutputs.push(text);
      }
    } else if (output.output_type === "error") {
      textOutputs.push(`Error: ${output.ename}: ${output.evalue}`);
    }
  }

  // Limit output length
  let result = textOutputs.join("\n").trim();
  if (result.length > 1000) {
    result = result.substring(0, 1000) + "\n... (출력 생략)";
  }

  return result;
}

/**
 * Convert notebook to MDX content
 */
function notebookToMdx(notebook, title, description = "") {
  const { cells } = notebook;

  // Frontmatter
  let mdx = `---
title: "${title}"
description: "${description}"
---

# ${title}

`;

  // Convert each cell
  for (let i = 0; i < cells.length; i++) {
    mdx += cellToMdx(cells[i], i);
  }

  return mdx;
}

/**
 * Convert all notebooks in a directory
 */
function convertDirectory(sourceDir, outputDir, moduleId) {
  if (!fs.existsSync(sourceDir)) {
    console.log(`Source directory not found: ${sourceDir}`);
    return;
  }

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get all notebook files
  const files = fs
    .readdirSync(sourceDir)
    .filter((f) => f.endsWith(".ipynb") && f.startsWith("[실습]"))
    .sort();

  console.log(`Found ${files.length} notebooks in ${sourceDir}`);

  const slugs = CHAPTER_SLUGS[moduleId] || [];

  files.forEach((file, index) => {
    const filePath = path.join(sourceDir, file);
    const title = extractTitle(file);
    const slug = slugs[index] || `chapter-${index + 1}`;
    const outputPath = path.join(outputDir, `${slug}.mdx`);

    try {
      const notebook = parseNotebook(filePath);
      const mdx = notebookToMdx(notebook, title);

      fs.writeFileSync(outputPath, mdx, "utf-8");
      console.log(`  ✓ ${file} -> ${slug}.mdx`);
    } catch (error) {
      console.error(`  ✗ ${file}: ${error.message}`);
    }
  });
}

/**
 * Convert all modules
 */
function convertAllModules(baseSourceDir, baseOutputDir) {
  console.log("Converting Jupyter Notebooks to MDX...\n");

  for (const [sourceFolder, moduleId] of Object.entries(MODULE_MAPPING)) {
    const sourceDir = path.join(baseSourceDir, sourceFolder);
    const outputDir = path.join(baseOutputDir, moduleId);

    console.log(`\nModule: ${moduleId}`);
    convertDirectory(sourceDir, outputDir, moduleId);
  }

  console.log("\nConversion complete!");
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 2) {
  // Convert single directory
  const [sourceDir, outputDir] = args;
  const moduleId = path.basename(outputDir);
  convertDirectory(sourceDir, outputDir, moduleId);
} else if (args.length === 0) {
  // Convert all modules
  const baseSourceDir = path.resolve(__dirname, "../../");
  const baseOutputDir = path.resolve(__dirname, "../src/content/chapters");
  convertAllModules(baseSourceDir, baseOutputDir);
} else {
  console.log("Usage:");
  console.log(
    "  node scripts/convert-notebooks.js                    # Convert all modules"
  );
  console.log(
    "  node scripts/convert-notebooks.js [source] [output]  # Convert single directory"
  );
  process.exit(1);
}
