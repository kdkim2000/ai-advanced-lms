#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Quiz Quality Analyzer
 * Finds low-quality, trivial, or irrelevant questions
 */

const fs = require("fs");
const path = require("path");

const QUIZ_DIR = path.join(__dirname, "../src/content/quizzes");

// Expected topics for each module
const MODULE_TOPICS = {
  python: ["python", "함수", "클래스", "변수", "데이터", "리스트", "딕셔너리", "튜플", "문자열", "반복", "조건"],
  "data-analysis": ["numpy", "pandas", "데이터", "분석", "배열", "시리즈", "텍스트", "전처리"],
  llm: ["llm", "언어모델", "트랜스포머", "gpt", "bert", "임베딩", "토큰", "api", "langchain"],
  "prompt-engineering": ["프롬프트", "lcel", "체인", "langchain", "템플릿", "agent", "tool", "function"],
  rag: ["rag", "검색", "벡터", "임베딩", "청크", "retrieval", "generation", "문서"],
  "fine-tuning": ["파인튜닝", "fine-tuning", "학습", "sft", "lora", "peft", "데이터셋", "instruction"],
};

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

// Check if question is too short
function isTooShort(question) {
  return question.question.length < 20;
}

// Check if question has empty or very short explanation
function hasWeakExplanation(question) {
  return !question.explanation || question.explanation.length < 10;
}

// Check if question seems irrelevant to module
function isIrrelevant(question, moduleId) {
  const topics = MODULE_TOPICS[moduleId] || [];
  if (topics.length === 0) return false;

  const questionText = question.question.toLowerCase();
  const hasRelevantTopic = topics.some(topic => questionText.includes(topic.toLowerCase()));

  // Also check category
  const category = (question.category || "").toLowerCase();
  const categoryRelevant = topics.some(topic => category.includes(topic.toLowerCase()));

  return !hasRelevantTopic && !categoryRelevant;
}

// Check if question options are too similar
function hasSimilarOptions(question) {
  const options = Object.values(question.options);
  for (let i = 0; i < options.length; i++) {
    for (let j = i + 1; j < options.length; j++) {
      if (options[i] === options[j]) {
        return true;
      }
    }
  }
  return false;
}

// Check for questions in wrong module
function checkMisplacedQuestions(quizzes) {
  const misplaced = [];

  for (const [file, data] of Object.entries(quizzes)) {
    const moduleId = data.moduleId;

    for (const q of data.questions) {
      const qText = q.question.toLowerCase();
      const category = (q.category || "").toLowerCase();

      // Check if Python module has RAG/LLM questions
      if (moduleId === "python") {
        if (qText.includes("rag") || qText.includes("llm") || qText.includes("langchain") ||
            qText.includes("임베딩") || qText.includes("벡터") || qText.includes("청크") ||
            category.includes("rag") || category.includes("llm")) {
          misplaced.push({ file, question: q, reason: "RAG/LLM question in Python module" });
        }
      }

      // Check if data-analysis has fine-tuning questions
      if (moduleId === "data-analysis") {
        if (qText.includes("fine-tuning") || qText.includes("파인튜닝") || qText.includes("lora")) {
          misplaced.push({ file, question: q, reason: "Fine-tuning question in Data Analysis module" });
        }
      }
    }
  }

  return misplaced;
}

// Analyze quality issues
function analyzeQuality(questions, moduleId) {
  const issues = {
    tooShort: [],
    weakExplanation: [],
    irrelevant: [],
    similarOptions: [],
  };

  for (const q of questions) {
    if (isTooShort(q)) {
      issues.tooShort.push(q);
    }
    if (hasWeakExplanation(q)) {
      issues.weakExplanation.push(q);
    }
    if (isIrrelevant(q, moduleId)) {
      issues.irrelevant.push(q);
    }
    if (hasSimilarOptions(q)) {
      issues.similarOptions.push(q);
    }
  }

  return issues;
}

// Main analysis
function main() {
  console.log("Quiz Quality Analyzer");
  console.log("=====================\n");

  const quizzes = loadQuizzes();

  // Check for misplaced questions
  const misplaced = checkMisplacedQuestions(quizzes);
  if (misplaced.length > 0) {
    console.log("=== MISPLACED QUESTIONS ===");
    console.log(`Found ${misplaced.length} potentially misplaced questions:\n`);
    misplaced.forEach((m, i) => {
      console.log(`${i + 1}. [${m.file}] ID ${m.question.id}: ${m.reason}`);
      console.log(`   Category: ${m.question.category}`);
      console.log(`   Q: "${m.question.question.substring(0, 80)}..."`);
      console.log("");
    });
  }

  let totalIrrelevant = 0;
  let totalWeakExplanation = 0;

  // Analyze each file
  for (const [file, data] of Object.entries(quizzes)) {
    const issues = analyzeQuality(data.questions, data.moduleId);

    if (issues.irrelevant.length > 0 || issues.weakExplanation.length > 20) {
      console.log(`\n=== ${file} ===`);

      if (issues.irrelevant.length > 0) {
        console.log(`\nPotentially irrelevant (${issues.irrelevant.length}):`);
        issues.irrelevant.slice(0, 10).forEach((q, i) => {
          console.log(`  ${i + 1}. ID ${q.id} [${q.category || "no category"}]: "${q.question.substring(0, 60)}..."`);
        });
        if (issues.irrelevant.length > 10) {
          console.log(`  ... and ${issues.irrelevant.length - 10} more`);
        }
        totalIrrelevant += issues.irrelevant.length;
      }

      if (issues.weakExplanation.length > 20) {
        console.log(`\nWeak explanations: ${issues.weakExplanation.length} questions`);
        totalWeakExplanation += issues.weakExplanation.length;
      }
    }
  }

  console.log("\n\n=== SUMMARY ===");
  console.log(`Misplaced questions: ${misplaced.length}`);
  console.log(`Potentially irrelevant: ${totalIrrelevant}`);
  console.log(`Weak explanations: ${totalWeakExplanation}`);

  // Return data for further processing
  return { misplaced };
}

main();
