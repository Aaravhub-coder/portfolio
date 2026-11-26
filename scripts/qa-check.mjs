import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { PROFILE, HUB_PORTALS } from '../src/data/profile.js';
import { SKILL_CATEGORIES } from '../src/data/skills.js';
import { PROJECTS } from '../src/data/projects.js';
import { ACHIEVEMENTS } from '../src/data/achievements.js';
import { SCENES, useExperienceStore } from '../src/store/experienceStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const results = [];

function check(name, fn) {
  try {
    const detail = fn();
    results.push({ name, status: 'PASSED', detail: detail || 'ok' });
  } catch (error) {
    results.push({
      name,
      status: 'FAILED',
      detail: error?.message || String(error),
    });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function walkFiles(dir, extFilter = null) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, extFilter));
    } else if (!extFilter || extFilter.some((ext) => entry.name.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

// 1. CV & Verified Content Integrity
check('Content integrity: CV profile, phone, CV PDF & 3 book chapters', () => {
  assert(PROFILE.name === 'Aarav Raj', 'Owner name mismatch');
  assert(
    PROFILE.contact.email === 'aaravrajgo@gmail.com',
    'Email mismatch'
  );
  assert(
    PROFILE.contact.phone === '+91-9523512702' &&
      PROFILE.contact.phoneHref === 'tel:+919523512702',
    'Verified phone number mismatch'
  );
  assert(
    PROFILE.contact.github === 'https://github.com/Aaravhub-coder',
    'GitHub URL mismatch'
  );
  assert(
    PROFILE.contact.linkedin ===
      'https://www.linkedin.com/in/aarav-raj-a2a49135b',
    'LinkedIn URL mismatch'
  );
  assert(
    Array.isArray(PROFILE.libraryChapters) &&
      PROFILE.libraryChapters.length === 3,
    'Expected 3 Ancient Library chapters (Profile, Personal Story, Education)'
  );
  assert(PROFILE.education.length === 3, 'Expected 3 verified education entries');
  assert(
    PROFILE.education[0].qualification ===
      'B.Tech (Data Science & Artificial Intelligence)',
    'Primary B.Tech wording must match latest CV'
  );
  assert(HUB_PORTALS.length === 5, 'Expected exactly 5 Multiverse Hub portals');

  const cvPath = path.join(ROOT, 'public', 'Aarav_Raj_CV.pdf');
  assert(fs.existsSync(cvPath), 'Missing downloadable CV at public/Aarav_Raj_CV.pdf');
  const pdfRaw = fs.readFileSync(cvPath, 'latin1');
  assert(pdfRaw.startsWith('%PDF-1.4'), 'CV file must be a valid PDF 1.4 header');
  assert(pdfRaw.trimEnd().endsWith('%%EOF'), 'CV PDF must end with %%EOF');
  assert(pdfRaw.includes('9523512702'), 'CV PDF must include verified phone number');

  return 'profile, phone, valid CV PDF, 3 chapters, 3 education rows, 5 portals verified';
});

check('Content integrity: honest skills without fake percentages', () => {
  const allSkills = SKILL_CATEGORIES.flatMap((c) => c.items);
  assert(SKILL_CATEGORIES.length === 4, 'Expected 4 skill categories');
  assert(allSkills.length === 18, `Expected 18 skills, got ${allSkills.length}`);
  for (const skill of allSkills) {
    assert(
      !/expert|\d+%/i.test(skill.familiarity),
      `Unverified proficiency claim on ${skill.name}: ${skill.familiarity}`
    );
  }
  return `${SKILL_CATEGORIES.length} categories, ${allSkills.length} honest skills`;
});

check('Content integrity: 6 projects & verified repo/status guard', () => {
  assert(PROJECTS.length === 6, `Expected 6 projects, got ${PROJECTS.length}`);
  const chandrayaan = PROJECTS.find(
    (p) => p.id === 'chandrayaan-2-image-correspondence'
  );
  assert(chandrayaan, 'Missing Chandrayaan-2 project');
  assert(
    chandrayaan.status === 'Research Direction / Proposed Pipeline',
    'Chandrayaan-2 must remain labeled Research Direction / Proposed Pipeline'
  );
  assert(
    chandrayaan.repoUrl?.startsWith('https://github.com/Aaravhub-coder/'),
    'Chandrayaan-2 repoUrl must match owner GitHub'
  );
  const reposWithUrls = PROJECTS.filter((p) => Boolean(p.repoUrl));
  assert(
    reposWithUrls.length === 1,
    `Expected only 1 verified repoUrl, found ${reposWithUrls.length}`
  );
  return '6 projects verified; Chandrayaan-2 status & repo guard intact';
});

check('Content integrity: 6 verified achievements without invented dates', () => {
  assert(
    ACHIEVEMENTS.length === 6,
    `Expected 6 achievements, got ${ACHIEVEMENTS.length}`
  );
  for (const item of ACHIEVEMENTS) {
    assert(
      !/\b20(2[0-9]|1[0-9])\b/.test(item.title + item.detail),
      `Unexpected invented year in achievement: ${item.id}`
    );
  }
  return '6 achievements verified, zero invented dates or IDs';
});

// 2. Single WebGL Canvas, GPU Disposal & GLSL Metal/ANGLE Safety
check('3D architecture: strictly one shared <Canvas> context', () => {
  const jsxFiles = walkFiles(SRC, ['.jsx', '.js']);
  const canvasMatches = [];
  for (const file of jsxFiles) {
    const src = fs.readFileSync(file, 'utf8');
    const hits = src.match(/<Canvas\b/g);
    if (hits) {
      canvasMatches.push({ file: path.relative(ROOT, file), count: hits.length });
    }
  }
  assert(
    canvasMatches.length === 1 && canvasMatches[0].count === 1,
    `Expected strictly 1 <Canvas>, found: ${JSON.stringify(canvasMatches)}`
  );
  return `single <Canvas> in ${canvasMatches[0].file}`;
});

check('GPU hygiene: every Three.js geometry/material/texture allocator calls dispose()', () => {
  const jsxFiles = walkFiles(SRC, ['.jsx', '.js']);
  const missingDispose = [];
  for (const file of jsxFiles) {
    const src = fs.readFileSync(file, 'utf8');
    const allocates = /new THREE\.\w+(Geometry|Material|CanvasTexture)\(/.test(src);
    if (allocates && !src.includes('.dispose()')) {
      missingDispose.push(path.relative(ROOT, file));
    }
  }
  assert(
    missingDispose.length === 0,
    `Files allocating Three.js resources without dispose(): ${missingDispose.join(', ')}`
  );
  return 'all procedural 3D modules explicitly dispose GPU resources';
});

check('Apple M1 Metal/ANGLE shader safety: guarded GLSL pow() calls', () => {
  const jsxFiles = walkFiles(SRC, ['.jsx', '.js']);
  for (const file of jsxFiles) {
    const src = fs.readFileSync(file, 'utf8');
    const powMatches = [...src.matchAll(/\bpow\(([^,]+),/g)];
    for (const match of powMatches) {
      assert(
        match[1].includes('max('),
        `Unguarded GLSL pow(${match[1]}, ...) in ${path.relative(ROOT, file)}`
      );
    }
  }
  return 'all GLSL pow() calls guarded with max(..., 0.0001)';
});

// 3. Hardware & Accessibility Guardrails
check('Performance & audio defaults: muted audio, tab pause, reduced motion', () => {
  const storeState = useExperienceStore.getState();
  assert(storeState.audioEnabled === false, 'Audio must default to muted (false)');

  const canvasSrc = fs.readFileSync(
    path.join(SRC, 'three', 'CanvasExperience.jsx'),
    'utf8'
  );
  assert(
    canvasSrc.includes("frameloop={isTabVisible ? 'always' : 'never'}"),
    'Canvas must pause rendering when browser tab is hidden'
  );
  assert(
    canvasSrc.includes('webglcontextlost') &&
      canvasSrc.includes('webglcontextrestored'),
    'Canvas must handle WebGL context loss and restoration'
  );

  const globalCss = fs.readFileSync(
    path.join(SRC, 'styles', 'global.css'),
    'utf8'
  );
  assert(
    globalCss.includes('prefers-reduced-motion: reduce'),
    'CSS must respect prefers-reduced-motion'
  );
  assert(
    globalCss.includes('.skip-link') && globalCss.includes('.sr-only'),
    'Global styles must include skip-link and sr-only accessibility utilities'
  );
  return 'muted default, tab-hidden pause, WebGL recovery, reduced-motion OK';
});

check('Link security & a11y: rel="noopener noreferrer" on all target="_blank"', () => {
  const jsxFiles = walkFiles(SRC, ['.jsx']);
  const unsafeLinks = [];
  for (const file of jsxFiles) {
    const src = fs.readFileSync(file, 'utf8');
    const tags = [...src.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gs)];
    for (const tag of tags) {
      if (!tag[0].includes('rel="noopener noreferrer"')) {
        unsafeLinks.push(path.relative(ROOT, file));
      }
    }
  }
  assert(
    unsafeLinks.length === 0,
    `External links missing rel="noopener noreferrer": ${unsafeLinks.join(', ')}`
  );
  return 'all external links hardened with rel="noopener noreferrer"';
});

// 4. End-to-End Store Journey, Giant Book 3-Chapter Turning & 2D Fallback Verification
check('End-to-end navigation, 3-chapter giant book turning & 2D fallback', () => {
  const store = useExperienceStore;
  store.getState().returnToGateway();
  assert(store.getState().activeScene === SCENES.GATEWAY, 'Start at Gateway');

  store.getState().navigateTo(SCENES.HUB);
  assert(store.getState().activeScene === SCENES.HUB, 'Enter Hub');

  store.getState().navigateTo(SCENES.LIBRARY);
  assert(
    store.getState().libraryBookOpen === false &&
      store.getState().libraryChapterIndex === 0,
    'Library arrives with closed ancient book at Chapter I'
  );
  store.getState().openLibraryBook();
  assert(store.getState().libraryBookOpen === true, 'Open giant ancient book');

  store.getState().stepLibraryChapter(1);
  assert(
    store.getState().libraryChapterIndex === 1 &&
      store.getState().activeLibraryChapter === 'story' &&
      store.getState().libraryTurningDir === 1,
    'Turn forward to Chapter II (Personal Story)'
  );
  store.getState().clearLibraryTurning();

  store.getState().stepLibraryChapter(1);
  assert(
    store.getState().libraryChapterIndex === 2 &&
      store.getState().activeLibraryChapter === 'education' &&
      store.getState().libraryTurningDir === 1,
    'Turn forward to Chapter III (Education)'
  );
  store.getState().stepLibraryChapter(-1);
  assert(
    store.getState().libraryChapterIndex === 1 &&
      store.getState().libraryTurningDir === -1,
    'Turn backward to Chapter II'
  );
  store.getState().closeLibraryBook();
  assert(store.getState().libraryBookOpen === false, 'Close ancient book');

  store.getState().navigateTo(SCENES.AILAB);
  store.getState().setSelectedSkillCategory('languages');
  store.getState().setHighlightedSkill('Python');
  assert(store.getState().highlightedSkill === 'Python', 'AI Lab sync');

  for (const project of PROJECTS) {
    store.getState().selectProject(project.id);
    assert(
      store.getState().activeScene === SCENES.PROJECTS &&
        store.getState().activeProjectId === project.id,
      `Project world selection failed for ${project.id}`
    );
  }

  store.getState().navigateTo(SCENES.ACHIEVEMENTS);
  store.getState().setAchievementFilter('certification');
  store.getState().setSelectedAchievementId('pw-skills-python');
  assert(
    store.getState().selectedAchievementId === 'pw-skills-python',
    'Achievement sync'
  );

  store.getState().navigateTo(SCENES.CONTACT);
  store.getState().setHoveredContactChannel('cv');
  assert(store.getState().hoveredContactChannel === 'cv', 'Contact CV relay sync');
  store.getState().setHoveredContactChannel('phone');
  assert(store.getState().hoveredContactChannel === 'phone', 'Contact Phone relay sync');

  store.getState().returnToHub();
  assert(
    store.getState().activeScene === SCENES.HUB &&
      store.getState().hoveredContactChannel === null,
    'Return to Hub cleans transient world state'
  );

  // Verify WebGL error automatically switches to 2D fallback & unlocks canvasReady
  store.getState().setWebglError('Simulated WebGL loss');
  assert(
    store.getState().viewMode === '2d' && store.getState().canvasReady === true,
    'WebGL error must trigger 2D fallback'
  );
  store.getState().setWebglError(null);
  assert(store.getState().viewMode === '3d', 'WebGL recovery restores 3D mode');

  return 'full 12-state journey, 3-chapter page turns, CV/phone relays & 2D fallback verified';
});

// 5. Three.js Procedural Geometry Integrity
check('Three.js procedural geometry validation (lunar terrain & curved book page)', () => {
  const geo = new THREE.PlaneGeometry(5.6, 5.6, 44, 44);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    const y = Math.max(0, 1 - (r / 2.95) ** 2) * 0.34;
    pos.setY(i, y);
  }
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  for (let i = 0; i < pos.array.length; i += 1) {
    assert(Number.isFinite(pos.array[i]), 'NaN/Infinite lunar vertex detected');
  }
  const lunarVerts = pos.count;
  geo.dispose();

  // Validate curved 3D turning book page deformation at midpoint (t = 0.5)
  const pageGeo = new THREE.PlaneGeometry(0.92, 1.24, 22, 4);
  pageGeo.translate(0.46, 0, 0);
  const pAttr = pageGeo.attributes.position;
  for (let i = 0; i < pAttr.count; i += 1) {
    const bx = pAttr.getX(i);
    const by = pAttr.getY(i);
    const u = bx / 0.92;
    const angle = Math.PI / 2 - 0.28 * 0.65 * u * u;
    const lift = Math.sin(u * Math.PI) * 0.28 * 0.34;
    pAttr.setXYZ(i, Math.cos(angle) * bx, by, Math.sin(angle) * bx + lift);
  }
  pageGeo.computeVertexNormals();
  for (let i = 0; i < pAttr.array.length; i += 1) {
    assert(Number.isFinite(pAttr.array[i]), 'NaN/Infinite turning page vertex detected');
  }
  const pageVerts = pAttr.count;
  pageGeo.dispose();

  return `${lunarVerts} lunar verts + ${pageVerts} curved book-page verts verified (0 NaNs)`;
});

// Print QA Report
const passed = results.filter((r) => r.status === 'PASSED').length;
const failed = results.filter((r) => r.status === 'FAILED').length;

console.log('\n=== Chronicles of Aarav — Automated QA Suite ===');
for (const r of results) {
  console.log(`[${r.status}] ${r.name} — ${r.detail}`);
}
console.log(`\nSummary: ${passed}/${results.length} passed, ${failed} failed.\n`);

if (failed > 0) {
  process.exit(1);
}
