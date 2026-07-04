import type { AlgorithmTemplate } from '../core/types';

export const naiveStringSearch = `// 朴素字符串匹配
function naiveSearch(input) {
  const text = typeof input === 'object' && input.text ? input.text : input;
  const pattern = typeof input === 'object' && input.pattern ? input.pattern : '';
  const n = text.length, m = pattern.length;
  for (let i = 0; i <= n - m; i++) {
    let match = true;
    trace('check', { data: { text, pattern }, highlights: [i], description: \`从位置 \${i} 开始匹配\` });
    for (let j = 0; j < m; j++) {
      trace('compare', { data: { text, pattern }, highlights: [i + j], description: \`比较 text[\${i+j}]=\${text[i+j]} 和 pattern[\${j}]=\${pattern[j]}\` });
      if (text[i + j] !== pattern[j]) { match = false; break; }
    }
    if (match) { trace('found', { data: { text, pattern }, highlights: [i], description: \`在位置 \${i} 找到匹配!\` }); }
  }
  trace('done', { data: { text, pattern }, description: '搜索完成' });
}
naiveSearch(data);
`;

export const kmpSearch = `// KMP字符串匹配
function kmpSearch(input) {
  const text = typeof input === 'object' && input.text ? input.text : input;
  const pattern = typeof input === 'object' && input.pattern ? input.pattern : '';
  const n = text.length, m = pattern.length;
  const lps = new Array(m).fill(0);
  let len = 0, i = 1;
  while (i < m) {
    if (pattern[i] === pattern[len]) { len++; lps[i] = len; i++; }
    else { if (len !== 0) len = lps[len - 1]; else { lps[i] = 0; i++; } }
  }
  trace('lps', { data: { array: lps }, description: \`LPS表: [\${lps}]\` });
  let j = 0; i = 0;
  while (i < n) {
    if (pattern[j] === text[i]) { i++; j++; }
    if (j === m) { trace('found', { data: { text, pattern }, highlights: [i - j], description: \`在位置 \${i-j} 找到匹配!\` }); j = lps[j - 1]; }
    else if (i < n && pattern[j] !== text[i]) {
      if (j !== 0) { j = lps[j - 1]; trace('skip', { data: { text, pattern }, highlights: [i], description: \`失配, j->\${j}\` }); }
      else { i++; }
    }
  }
  trace('done', { data: { text, pattern }, description: '搜索完成' });
}
kmpSearch(data);
`;

export const longestPalindromeBrute = `// 最长回文子串（暴力）
function longestPalBrute(s) {
  function isPal(l, r) {
    while (l < r) { if (s[l] !== s[r]) return false; l++; r--; }
    return true;
  }
  let start = 0, maxLen = 0;
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      trace('check', { data: { text: s }, highlights: [i, j], description: \`检查 [\${i},\${j}] \${s.slice(i,j+1)}\` });
      if (isPal(i, j) && j - i + 1 > maxLen) { start = i; maxLen = j - i + 1; }
    }
  }
  trace('done', { data: { text: s }, highlights: [start, start + maxLen - 1], description: \`最长回文: \${s.slice(start, start+maxLen)}\` });
}
longestPalBrute(data);
`;

export const longestPalindromeCenter = `// 最长回文子串（中心扩展）
function longestPalCenter(s) {
  let start = 0, maxLen = 0;
  function expand(l, r) {
    const centerL = l, centerR = r;
    trace('center', { data: { text: s }, highlights: [centerL, centerR], pointers: { left: centerL, right: centerR }, description: '检查中心 [' + centerL + ',' + centerR + ']' });
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    const len = r - l - 1;
    trace('expand-window', { data: { text: s }, highlights: [l + 1, r - 1], pointers: { left: l + 1, right: r - 1 }, description: '扩展窗口 [' + (l + 1) + ',' + (r - 1) + '], len=' + len });
    trace('expand', { data: { array: [l + 1, r - 1] }, description: \`扩展中心, 长度=\${len}\` });
    return len;
  }
  for (let i = 0; i < s.length; i++) {
    const len1 = expand(i, i), len2 = expand(i, i + 1);
    const len = Math.max(len1, len2);
    if (len > maxLen) { maxLen = len; start = i - Math.floor((len - 1) / 2); }
    trace('best-window', { data: { text: s }, highlights: [start, start + maxLen - 1], pointers: { left: start, right: start + maxLen - 1 }, description: '当前最长 ' + s.slice(start, start+maxLen) });
    trace('check', { data: { array: [start, start + maxLen - 1] }, description: \`中心\${i}, 当前最长=\${s.slice(start, start+maxLen)}\` });
  }
  trace('done', { data: { text: s }, highlights: [start, start + maxLen - 1], description: \`最长回文: \${s.slice(start, start+maxLen)}\` });
}
longestPalCenter(data);
`;

export const anagramSort = `// 字母异位词（排序）
function isAnagramSort(input) {
  const s = typeof input === 'object' ? (input.text1 || input) : input;
  const t = typeof input === 'object' ? (input.text2 || '') : '';
  if (s.length !== t.length) return false;
  const sortedS = s.split('').sort().join('');
  const sortedT = t.split('').sort().join('');
  for (let i = 0; i < sortedS.length; i++) {
    trace('sort-left', { data: { text: sortedS, text1: sortedS, text2: sortedT, activeChar: sortedS[i] }, highlights: [i], pointers: { i, side: 'left' }, description: '排序左侧字符 ' + sortedS[i] });
  }
  for (let i = 0; i < sortedT.length; i++) {
    trace('sort-right', { data: { text: sortedS, text1: sortedS, text2: sortedT, activeChar: sortedT[i] }, highlights: [20 + i], pointers: { i, side: 'right' }, description: '排序右侧字符 ' + sortedT[i] });
  }
  trace('sort', { data: { text: sortedS }, description: \`排序s: \${sortedS}\` });
  trace('sort', { data: { text: sortedT }, description: \`排序t: \${sortedT}\` });
  const result = sortedS === sortedT;
  trace('done', { description: result ? '是异位词' : '不是异位词' });
  return result;
}
isAnagramSort(data);
`;

export const anagramHash = `// 字母异位词（哈希）
function isAnagramHash(input) {
  const s = typeof input === 'object' ? (input.text1 || input) : input;
  const t = typeof input === 'object' ? (input.text2 || '') : '';
  if (s.length !== t.length) return false;
  const count = {};
  let leftIndex = 0;
  for (const c of s) {
    count[c] = (count[c] || 0) + 1;
    trace('count-left', { data: { text: s, text1: s, text2: t, counts: { ...count }, activeChar: c }, highlights: [leftIndex], pointers: { i: leftIndex, side: 'left' }, description: '左侧计数 ' + c });
    leftIndex++;
  }
  trace('count', { data: { array: Object.values(count) }, description: \`s字符计数\` });
  let rightIndex = 0;
  for (const c of t) {
    if (!count[c]) { trace('fail', { description: \`多余字符 \${c}\` }); return false; }
    count[c]--;
    if (count[c] === 0) delete count[c];
    trace('count-right', { data: { text: s, text1: s, text2: t, counts: { ...count }, activeChar: c }, highlights: [20 + rightIndex], pointers: { i: rightIndex, side: 'right' }, description: '右侧抵消 ' + c });
    rightIndex++;
  }
  const result = Object.keys(count).length === 0;
  trace('done', { description: result ? '是异位词' : '不是异位词' });
  return result;
}
isAnagramHash(data);
`;

export const lengthOfLongestSubstringBrute = `// 无重复最长子串（暴力）
function lengthOfLongestSubBrute(s) {
  let maxLen = 0;
  for (let i = 0; i < s.length; i++) {
    const seen = new Set();
    for (let j = i; j < s.length; j++) {
      if (seen.has(s[j])) { trace('dup', { data: { text: s }, highlights: [i, j], description: \`重复 \${s[j]} at \${j}\` }); break; }
      seen.add(s[j]);
      maxLen = Math.max(maxLen, j - i + 1);
      trace('extend', { data: { text: s }, highlights: [i, j], description: \`窗口 [\${i},\${j}], len=\${j-i+1}\` });
    }
  }
  trace('done', { data: { text: s }, description: \`最长无重复子串长度: \${maxLen}\` });
}
lengthOfLongestSubBrute(data);
`;

export const lengthOfLongestSubstringSliding = `// 无重复最长子串（滑动窗口）
function lengthOfLongestSubSlide(s) {
  const map = {}; let maxLen = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    if (map[s[right]] !== undefined && map[s[right]] >= left) {
      left = map[s[right]] + 1;
      trace('slide', { data: { text: s }, highlights: [left, right], description: \`左边界移到 \${left}\` });
    }
    map[s[right]] = right;
    maxLen = Math.max(maxLen, right - left + 1);
    trace('window', { data: { text: s }, highlights: [left, right], description: \`窗口 [\${left},\${right}], len=\${right-left+1}\` });
  }
  trace('done', { data: { text: s }, description: \`最长无重复子串长度: \${maxLen}\` });
}
lengthOfLongestSubSlide(data);
`;

export const stringTemplates: AlgorithmTemplate[] = [
  { id: 'string-search', name: '朴素字符串匹配 → KMP', category: '字符串', language: 'js', naiveCode: naiveStringSearch, optimizedCode: kmpSearch, defaultData: { text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' } },
  { id: 'longest-palindrome', name: '最长回文(暴力) → 最长回文(中心扩展)', category: '字符串', language: 'js', naiveCode: longestPalindromeBrute, optimizedCode: longestPalindromeCenter, defaultData: 'babadabad' },
  { id: 'anagram', name: '异位词(排序) → 异位词(哈希)', category: '字符串', language: 'js', naiveCode: anagramSort, optimizedCode: anagramHash, defaultData: { text1: 'anagram', text2: 'nagaram' } },
  { id: 'longest-substring', name: '无重复子串(暴力) → 滑动窗口', category: '字符串', language: 'js', naiveCode: lengthOfLongestSubstringBrute, optimizedCode: lengthOfLongestSubstringSliding, defaultData: 'abcabcbb' },
];
