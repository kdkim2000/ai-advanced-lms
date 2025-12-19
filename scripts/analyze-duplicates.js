#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Quiz Duplicate Analyzer
 * Finds duplicate and similar questions in quiz files
 */

const fs = require("fs");
const path = require("path");

const QUIZ_DIR = path.join(__dirname, "../src/content/quizzes");

// Normalize text for comparison
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s가-힣]/g, "")
    .trim();
}

// Calculate similarity between two strings (Jaccard similarity)
function calculateSimilarity(str1, str2) {
  const set1 = new Set(str1.split(" "));
  const set2 = new Set(str2.split(" "));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

// Load all quiz files
function loadQuizzes() {
  const quizzes = {};
  const files = fs.readdirSync(QUIZ_DIR).filter(f => f.endsWith(".json"));

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(QUIZ_DIR, file), "utf8"));
    quizzes[file] = data;
  }
  return quizzes;
}

// Find exact duplicates within a file
function findExactDuplicates(questions) {
  const seen = new Map();
  const duplicates = [];

  for (const q of questions) {
    const normalized = normalizeText(q.question);
    if (seen.has(normalized)) {
      duplicates.push({
        original: seen.get(normalized),
        duplicate: q,
      });
    } else {
      seen.set(normalized, q);
    }
  }
  return duplicates;
}

// Find similar questions within a file
function findSimilarQuestions(questions, threshold = 0.85) {
  const similar = [];

  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const norm1 = normalizeText(questions[i].question);
      const norm2 = normalizeText(questions[j].question);
      const similarity = calculateSimilarity(norm1, norm2);

      if (similarity >= threshold) {
        similar.push({
          q1: questions[i],
          q2: questions[j],
          similarity: similarity,
        });
      }
    }
  }
  return similar;
}

// Find cross-file duplicates
function findCrossFileDuplicates(quizzes) {
  const allQuestions = [];

  for (const [file, data] of Object.entries(quizzes)) {
    for (const q of data.questions) {
      allQuestions.push({
        file,
        moduleId: data.moduleId,
        question: q,
        normalized: normalizeText(q.question),
      });
    }
  }

  const crossDuplicates = [];
  for (let i = 0; i < allQuestions.length; i++) {
    for (let j = i + 1; j < allQuestions.length; j++) {
      if (allQuestions[i].file !== allQuestions[j].file) {
        const similarity = calculateSimilarity(
          allQuestions[i].normalized,
          allQuestions[j].normalized
        );
        if (similarity >= 0.85) {
          crossDuplicates.push({
            file1: allQuestions[i].file,
            file2: allQuestions[j].file,
            q1: allQuestions[i].question,
            q2: allQuestions[j].question,
            similarity,
          });
        }
      }
    }
  }
  return crossDuplicates;
}

// Main analysis
function main() {
  console.log("Quiz Duplicate Analyzer");
  console.log("=======================\n");

  const quizzes = loadQuizzes();

  let totalDuplicates = 0;
  let totalSimilar = 0;

  // Analyze each file
  for (const [file, data] of Object.entries(quizzes)) {
    console.log(`\n=== ${file} (${data.questions.length} questions) ===`);

    // Find exact duplicates
    const duplicates = findExactDuplicates(data.questions);
    if (duplicates.length > 0) {
      console.log(`\nExact duplicates: ${duplicates.length}`);
      duplicates.forEach((d, i) => {
        console.log(`  ${i + 1}. ID ${d.original.id} == ID ${d.duplicate.id}`);
        console.log(`     "${d.original.question.substring(0, 60)}..."`);
      });
      totalDuplicates += duplicates.length;
    }

    // Find similar questions
    const similar = findSimilarQuestions(data.questions, 0.80);
    if (similar.length > 0) {
      console.log(`\nHighly similar questions: ${similar.length}`);
      similar.slice(0, 10).forEach((s, i) => {
        console.log(`  ${i + 1}. ID ${s.q1.id} ~ ID ${s.q2.id} (${(s.similarity * 100).toFixed(1)}%)`);
        console.log(`     Q1: "${s.q1.question.substring(0, 50)}..."`);
        console.log(`     Q2: "${s.q2.question.substring(0, 50)}..."`);
      });
      if (similar.length > 10) {
        console.log(`     ... and ${similar.length - 10} more`);
      }
      totalSimilar += similar.length;
    }

    if (duplicates.length === 0 && similar.length === 0) {
      console.log("  No duplicates or highly similar questions found.");
    }
  }

  // Find cross-file duplicates
  console.log("\n\n=== Cross-file duplicates ===");
  const crossDuplicates = findCrossFileDuplicates(quizzes);
  if (crossDuplicates.length > 0) {
    console.log(`Found ${crossDuplicates.length} cross-file similar questions:`);
    crossDuplicates.slice(0, 20).forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.file1} ID ${d.q1.id} ~ ${d.file2} ID ${d.q2.id} (${(d.similarity * 100).toFixed(1)}%)`);
      console.log(`     Q1: "${d.q1.question.substring(0, 50)}..."`);
      console.log(`     Q2: "${d.q2.question.substring(0, 50)}..."`);
    });
    if (crossDuplicates.length > 20) {
      console.log(`     ... and ${crossDuplicates.length - 20} more`);
    }
  } else {
    console.log("  No cross-file duplicates found.");
  }

  console.log("\n\n=== Summary ===");
  console.log(`Total exact duplicates: ${totalDuplicates}`);
  console.log(`Total highly similar (>=80%): ${totalSimilar}`);
  console.log(`Cross-file similar: ${crossDuplicates.length}`);

  return { quizzes, totalDuplicates, totalSimilar, crossDuplicates };
}

main();
