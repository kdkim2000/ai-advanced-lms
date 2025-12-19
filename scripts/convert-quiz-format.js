#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Quiz Format Converter
 *
 * Converts quiz JSON files from contents format to standardized LMS format
 *
 * Usage:
 *   node scripts/convert-quiz-format.js
 */

const fs = require("fs");
const path = require("path");

// Module mapping from folder names to moduleId
const MODULE_MAPPING = {
  "1. Python 기본": { moduleId: "python", level: "LV.1", title: "Python 기초 퀴즈" },
  "2. 데이터 분석": { moduleId: "data-analysis", level: "LV.2", title: "데이터 분석 퀴즈" },
  "3. 대규모 언어모델": { moduleId: "llm", level: "LV.3", title: "대규모 언어모델 퀴즈" },
  "4. 프롬프트 엔지니어링": { moduleId: "prompt-engineering", level: "LV.4", title: "프롬프트 엔지니어링 퀴즈" },
  "5. 검색 증강 생성": { moduleId: "rag", level: "LV.5", title: "RAG 퀴즈" },
  "6. 파인튜닝": { moduleId: "fine-tuning", level: "LV.6", title: "파인튜닝 퀴즈" },
};

// Contents directory
const CONTENTS_DIR = path.join(__dirname, "../../contents");
const OUTPUT_DIR = path.join(__dirname, "../src/content/quizzes");

/**
 * Convert a single quiz file to standardized format
 */
function convertQuizFile(inputPath, moduleInfo) {
  const rawData = fs.readFileSync(inputPath, "utf8");
  const sourceData = JSON.parse(rawData);

  // Extract questions and convert format
  const questions = sourceData.questions.map((q, index) => ({
    id: index + 1,
    question: q.question,
    points: 4,
    options: q.options,
    answer: q.answer,
    category: q.category || "일반",
    explanation: q.explanation || "",
  }));

  // Build answer_key with numeric keys
  const answer_key = {};
  questions.forEach((q) => {
    answer_key[String(q.id)] = q.answer;
  });

  // Build category_summary
  const category_summary = {};
  questions.forEach((q) => {
    if (!category_summary[q.category]) {
      category_summary[q.category] = [];
    }
    category_summary[q.category].push(q.id);
  });

  // Calculate total points
  const total_questions = questions.length;
  const points_per_question = 4;
  const total_points = total_questions * points_per_question;

  // Build description from source if available
  let description = "";
  if (sourceData.source) {
    if (sourceData.source.chapters && Array.isArray(sourceData.source.chapters)) {
      description = sourceData.source.chapters.join(", ") + "에 대한 이해도를 확인합니다.";
    } else if (sourceData.source.textbook) {
      description = `${sourceData.source.textbook}에 대한 이해도를 확인합니다.`;
    }
  }
  if (!description) {
    description = `${moduleInfo.title}에 대한 이해도를 확인합니다.`;
  }

  // Create standardized format
  const standardizedData = {
    moduleId: moduleInfo.moduleId,
    exam_info: {
      title: moduleInfo.title,
      level: moduleInfo.level,
      type: "객관식 문항",
      total_questions,
      points_per_question,
      total_points,
      description,
    },
    questions,
    answer_key,
    category_summary,
  };

  return standardizedData;
}

/**
 * Merge multiple quiz files for a module
 */
function mergeQuizFiles(quizDataArray, moduleInfo) {
  // Collect all questions
  let allQuestions = [];
  quizDataArray.forEach((data) => {
    allQuestions = allQuestions.concat(data.questions);
  });

  // Re-index questions
  const questions = allQuestions.map((q, index) => ({
    ...q,
    id: index + 1,
  }));

  // Build answer_key
  const answer_key = {};
  questions.forEach((q) => {
    answer_key[String(q.id)] = q.answer;
  });

  // Build category_summary
  const category_summary = {};
  questions.forEach((q) => {
    if (!category_summary[q.category]) {
      category_summary[q.category] = [];
    }
    category_summary[q.category].push(q.id);
  });

  // Calculate totals
  const total_questions = questions.length;
  const points_per_question = 4;
  const total_points = total_questions * points_per_question;

  // Build description
  const categories = Object.keys(category_summary);
  const description = categories.length > 0
    ? `${categories.slice(0, 3).join(", ")} 등에 대한 이해도를 확인합니다.`
    : `${moduleInfo.title}에 대한 이해도를 확인합니다.`;

  return {
    moduleId: moduleInfo.moduleId,
    exam_info: {
      title: moduleInfo.title,
      level: moduleInfo.level,
      type: "객관식 문항",
      total_questions,
      points_per_question,
      total_points,
      description,
    },
    questions,
    answer_key,
    category_summary,
  };
}

/**
 * Find all JSON files in a directory
 */
function findJsonFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);
  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isFile() && item.endsWith(".json")) {
      files.push(fullPath);
    }
  });
  return files;
}

/**
 * Main conversion function
 */
function main() {
  console.log("Quiz Format Converter");
  console.log("====================\n");

  // Check if contents directory exists
  if (!fs.existsSync(CONTENTS_DIR)) {
    console.error(`Contents directory not found: ${CONTENTS_DIR}`);
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Process each module folder
  const folders = fs.readdirSync(CONTENTS_DIR);

  folders.forEach((folder) => {
    const folderPath = path.join(CONTENTS_DIR, folder);
    const stat = fs.statSync(folderPath);

    if (!stat.isDirectory()) return;

    // Find module info
    const moduleInfo = MODULE_MAPPING[folder];
    if (!moduleInfo) {
      console.log(`Skipping unknown folder: ${folder}`);
      return;
    }

    console.log(`Processing: ${folder} -> ${moduleInfo.moduleId}`);

    // Find all JSON files in this folder
    const jsonFiles = findJsonFiles(folderPath);
    if (jsonFiles.length === 0) {
      console.log(`  No JSON files found`);
      return;
    }

    console.log(`  Found ${jsonFiles.length} JSON file(s)`);

    // Convert each file
    const convertedData = [];
    jsonFiles.forEach((filePath) => {
      try {
        const data = convertQuizFile(filePath, moduleInfo);
        convertedData.push(data);
        console.log(`  - Converted: ${path.basename(filePath)} (${data.questions.length} questions)`);
      } catch (error) {
        console.error(`  - Error converting ${path.basename(filePath)}: ${error.message}`);
      }
    });

    // Merge all converted data for this module
    if (convertedData.length > 0) {
      const mergedData = mergeQuizFiles(convertedData, moduleInfo);

      // Write output file
      const outputPath = path.join(OUTPUT_DIR, `${moduleInfo.moduleId}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2), "utf8");
      console.log(`  -> Output: ${moduleInfo.moduleId}.json (${mergedData.questions.length} total questions)\n`);
    }
  });

  console.log("Conversion complete!");
}

// Run main function
main();
