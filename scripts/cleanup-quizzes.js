#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Quiz Cleanup Script
 * Removes misplaced and low-quality questions
 */

const fs = require("fs");
const path = require("path");

const QUIZ_DIR = path.join(__dirname, "../src/content/quizzes");

// Categories that should NOT be in python.json
const PYTHON_EXCLUDED_CATEGORIES = [
  "RAG", "LLM", "LLM/Agent", "LangChain",
  "Fine-tuning", "Transformer", "LangGraph", "Prompt Engineering"
];

// Load quiz file
function loadQuiz(filename) {
  const filepath = path.join(QUIZ_DIR, filename);
  return JSON.parse(fs.readFileSync(filepath, "utf8"));
}

// Save quiz file
function saveQuiz(filename, data) {
  const filepath = path.join(QUIZ_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf8");
}

// Rebuild quiz metadata after removing questions
function rebuildQuiz(quiz) {
  // Re-index questions
  const questions = quiz.questions.map((q, index) => ({
    ...q,
    id: index + 1,
  }));

  // Rebuild answer_key
  const answer_key = {};
  questions.forEach((q) => {
    answer_key[String(q.id)] = q.answer;
  });

  // Rebuild category_summary
  const category_summary = {};
  questions.forEach((q) => {
    const cat = q.category || "일반";
    if (!category_summary[cat]) {
      category_summary[cat] = [];
    }
    category_summary[cat].push(q.id);
  });

  // Update exam_info
  const total_questions = questions.length;
  const points_per_question = 4;
  const total_points = total_questions * points_per_question;

  // Build description from categories
  const categories = Object.keys(category_summary);
  const description =
    categories.length > 0
      ? `${categories.slice(0, 3).join(", ")} 등에 대한 이해도를 확인합니다.`
      : `${quiz.exam_info.title}에 대한 이해도를 확인합니다.`;

  return {
    moduleId: quiz.moduleId,
    exam_info: {
      ...quiz.exam_info,
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

// Clean python.json - remove RAG/LLM questions
function cleanPythonQuiz() {
  console.log("\n=== Cleaning python.json ===");
  const quiz = loadQuiz("python.json");

  const originalCount = quiz.questions.length;
  const removedQuestions = [];

  // Filter out misplaced questions
  const filteredQuestions = quiz.questions.filter((q) => {
    const category = q.category || "";
    const isExcluded = PYTHON_EXCLUDED_CATEGORIES.some(
      (exc) => category.toLowerCase().includes(exc.toLowerCase())
    );

    if (isExcluded) {
      removedQuestions.push(q);
      return false;
    }
    return true;
  });

  quiz.questions = filteredQuestions;
  const cleanedQuiz = rebuildQuiz(quiz);

  console.log(`Original: ${originalCount} questions`);
  console.log(`Removed: ${removedQuestions.length} questions`);
  console.log(`Remaining: ${cleanedQuiz.questions.length} questions`);

  if (removedQuestions.length > 0) {
    console.log("\nRemoved questions:");
    removedQuestions.forEach((q) => {
      console.log(`  - ID ${q.id} [${q.category}]: "${q.question.substring(0, 50)}..."`);
    });
  }

  saveQuiz("python.json", cleanedQuiz);
  console.log("\nSaved cleaned python.json");

  return removedQuestions;
}

// Check for duplicate questions across all files
function removeDuplicatesGlobally() {
  console.log("\n=== Checking for cross-file duplicates ===");

  const files = fs.readdirSync(QUIZ_DIR).filter((f) => f.endsWith(".json"));
  const allQuestions = new Map();
  const duplicatesToRemove = [];

  // First pass: collect all questions
  for (const file of files) {
    const quiz = loadQuiz(file);
    for (const q of quiz.questions) {
      const normalized = q.question.toLowerCase().replace(/\s+/g, " ").trim();
      const key = normalized.substring(0, 100); // Use first 100 chars as key

      if (allQuestions.has(key)) {
        const existing = allQuestions.get(key);
        // Mark as duplicate if in different files
        if (existing.file !== file) {
          duplicatesToRemove.push({
            file,
            question: q,
            duplicateOf: existing,
          });
        }
      } else {
        allQuestions.set(key, { file, question: q });
      }
    }
  }

  if (duplicatesToRemove.length > 0) {
    console.log(`Found ${duplicatesToRemove.length} cross-file duplicates`);
    duplicatesToRemove.forEach((d) => {
      console.log(
        `  - ${d.file} ID ${d.question.id} duplicates ${d.duplicateOf.file} ID ${d.duplicateOf.question.id}`
      );
    });
  } else {
    console.log("No cross-file duplicates found");
  }

  return duplicatesToRemove;
}

// Main cleanup function
function main() {
  console.log("Quiz Cleanup Script");
  console.log("===================");

  // Clean python.json
  const removedFromPython = cleanPythonQuiz();

  // Check for cross-file duplicates
  removeDuplicatesGlobally();

  // Print final summary
  console.log("\n\n=== FINAL SUMMARY ===");
  const files = fs.readdirSync(QUIZ_DIR).filter((f) => f.endsWith(".json"));
  let total = 0;

  for (const file of files) {
    const quiz = loadQuiz(file);
    console.log(`${file}: ${quiz.questions.length} questions`);
    total += quiz.questions.length;
  }
  console.log(`\nTotal: ${total} questions`);
  console.log(`Removed from python.json: ${removedFromPython.length} questions`);
}

main();
