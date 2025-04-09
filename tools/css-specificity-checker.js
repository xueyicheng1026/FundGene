/**
 * CSS样式优先级和覆盖检查工具
 * 
 * 使用方法:
 * node css-specificity-checker.js [路径到CSS文件或目录]
 */

const fs = require('fs');
const path = require('path');
let parse;
let chalk;

// 尝试加载依赖
try {
  parse = require('css-parse');
  chalk = require('chalk');
} catch (error) {
  console.error('缺少必要依赖。请运行: npm install css-parse chalk');
  process.exit(1);
}

// 计算选择器特异性
function calculateSpecificity(selector) {
  let specificity = [0, 0, 0, 0]; // [内联, ID, 类/属性/伪类, 元素/伪元素]
  
  // 检查内联样式
  if (selector === 'style') {
    specificity[0] = 1;
    return specificity;
  }
  
  // 计算ID选择器数量 (#)
  specificity[1] = (selector.match(/#[a-zA-Z0-9_-]+/g) || []).length;
  
  // 计算类选择器 (.), 属性选择器 ([]), 伪类 (:) 数量
  specificity[2] = (selector.match(/(\.[a-zA-Z0-9_-]+|\[[^\]]*\]|:[a-zA-Z0-9_-]+)/g) || []).length;
  
  // 计算元素选择器和伪元素 (::) 数量
  specificity[3] = (selector.match(/([a-zA-Z0-9_-]+|::?[a-zA-Z0-9_-]+)/g) || []).length - 
                  (selector.match(/(\.|#|\[|\:)/g) || []).length;

  return specificity;
}

// 比较两个特异性数组
function compareSpecificity(spec1, spec2) {
  for (let i = 0; i < 4; i++) {
    if (spec1[i] !== spec2[i]) {
      return spec1[i] - spec2[i];
    }
  }
  return 0;
}

// 特异性数组转为可读字符串
function specificityToString(specificity) {
  return `(${specificity.join(',')})`;
}

// 检查CSS文件
function analyzeCSSFile(filePath) {
  console.log(chalk.cyan(`\n分析文件: ${filePath}`));
  
  try {
    const css = fs.readFileSync(filePath, 'utf8');
    const parsed = parse(css);
    
    const rules = [];
    const duplicateSelectors = new Map();
    let importantCount = 0;
    
    // 遍历所有规则
    parsed.stylesheet.rules.forEach(rule => {
      if (rule.type === 'rule') {
        rule.selectors.forEach(selector => {
          // 检查选择器是否重复
          if (duplicateSelectors.has(selector)) {
            duplicateSelectors.set(selector, duplicateSelectors.get(selector) + 1);
          } else {
            duplicateSelectors.set(selector, 1);
          }
          
          const specificity = calculateSpecificity(selector);
          
          // 检查声明中的!important
          rule.declarations.forEach(declaration => {
            if (declaration.type === 'declaration' && 
                declaration.value && 
                declaration.value.includes('!important')) {
              importantCount++;
              rules.push({
                selector,
                specificity,
                property: declaration.property,
                value: declaration.value,
                important: true
              });
            } else if (declaration.type === 'declaration') {
              rules.push({
                selector,
                specificity,
                property: declaration.property,
                value: declaration.value,
                important: false
              });
            }
          });
        });
      }
    });
    
    // 按属性分组规则
    const propertiesMap = new Map();
    rules.forEach(rule => {
      if (!propertiesMap.has(rule.property)) {
        propertiesMap.set(rule.property, []);
      }
      propertiesMap.get(rule.property).push(rule);
    });
    
    // 分析每个属性的规则冲突
    let potentialConflicts = 0;
    propertiesMap.forEach((propertyRules, property) => {
      if (propertyRules.length > 1) {
        // 检查相同属性的不同规则
        for (let i = 0; i < propertyRules.length; i++) {
          for (let j = i + 1; j < propertyRules.length; j++) {
            const rule1 = propertyRules[i];
            const rule2 = propertyRules[j];
            
            // 检查选择器是否可能同时匹配元素
            // 这是简化的检查，实际上需要更复杂的分析
            if (rule1.selector !== rule2.selector) {
              let conflict = false;
              
              // 如果两个规则都使用!important，检查特异性
              if (rule1.important && rule2.important) {
                const specComp = compareSpecificity(rule1.specificity, rule2.specificity);
                conflict = true;
              }
              // 如果只有一个规则使用!important
              else if (rule1.important !== rule2.important) {
                conflict = true;
              }
              // 比较特异性
              else {
                const specComp = compareSpecificity(rule1.specificity, rule2.specificity);
                if (specComp === 0 && rule1.value !== rule2.value) {
                  conflict = true;
                }
              }
              
              if (conflict) {
                potentialConflicts++;
                if (potentialConflicts <= 10) { // 限制输出数量
                  console.log(chalk.yellow(`\n潜在样式冲突 - 属性: ${property}`));
                  console.log(`  规则1: ${rule1.selector} ${specificityToString(rule1.specificity)} ${rule1.important ? chalk.red('!important') : ''}`);
                  console.log(`    值: ${rule1.value}`);
                  console.log(`  规则2: ${rule2.selector} ${specificityToString(rule2.specificity)} ${rule2.important ? chalk.red('!important') : ''}`);
                  console.log(`    值: ${rule2.value}`);
                }
              }
            }
          }
        }
      }
    });
    
    // 输出重复选择器
    const duplicates = [...duplicateSelectors.entries()].filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log(chalk.yellow('\n重复的选择器:'));
      duplicates.slice(0, 10).forEach(([selector, count]) => {
        console.log(`  "${selector}" 出现 ${count} 次`);
      });
      if (duplicates.length > 10) {
        console.log(`  ... 以及更多 ${duplicates.length - 10} 个重复选择器`);
      }
    }
    
    // 输出!important使用情况
    if (importantCount > 0) {
      console.log(chalk.red(`\n!important 使用次数: ${importantCount}`));
    }
    
    // 输出潜在冲突总数
    if (potentialConflicts > 10) {
      console.log(chalk.yellow(`\n总共发现 ${potentialConflicts} 个潜在样式冲突，仅显示前10个。`));
    } else if (potentialConflicts > 0) {
      console.log(chalk.yellow(`\n总共发现 ${potentialConflicts} 个潜在样式冲突。`));
    } else {
      console.log(chalk.green('\n未发现潜在样式冲突。'));
    }
    
    // 特异性分布分析
    console.log(chalk.cyan('\n选择器特异性分布:'));
    const highSpecificitySelectors = rules
      .filter((rule, index, self) => 
        self.findIndex(r => r.selector === rule.selector) === index)
      .sort((a, b) => 
        compareSpecificity(b.specificity, a.specificity))
      .slice(0, 5);
      
    if (highSpecificitySelectors.length > 0) {
      console.log('  最高特异性选择器:');
      highSpecificitySelectors.forEach(rule => {
        console.log(`    ${rule.selector} ${specificityToString(rule.specificity)}`);
      });
    }
    
    return {
      duplicateSelectors: duplicates.length,
      importantCount,
      potentialConflicts
    };
    
  } catch (error) {
    console.error(chalk.red(`无法分析文件 ${filePath}: ${error.message}`));
    return null;
  }
}

// 递归查找所有CSS文件
function findCSSFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      try {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          findCSSFiles(filePath, fileList);
        } else if (path.extname(file).toLowerCase() === '.css') {
          fileList.push(filePath);
        }
      } catch (error) {
        console.error(chalk.yellow(`无法访问文件/目录: ${path.join(dir, file)}: ${error.message}`));
      }
    });
  } catch (error) {
    console.error(chalk.yellow(`无法读取目录: ${dir}: ${error.message}`));
  }
  
  return fileList;
}

// 主函数
function main() {
  const targetPath = process.argv[2] || '.';
  let resolvedPath = targetPath;

  // 解析相对路径或绝对路径
  if (!path.isAbsolute(targetPath)) {
    resolvedPath = path.resolve(process.cwd(), targetPath);
  }
  
  console.log(chalk.green('CSS样式优先级和覆盖检查工具'));
  console.log(chalk.green('============================'));
  console.log(`目标路径: ${resolvedPath}`);
  
  let cssFiles = [];
  
  try {
    const stat = fs.statSync(resolvedPath);
    if (stat.isDirectory()) {
      console.log(`正在搜索目录 ${resolvedPath} 中的CSS文件...`);
      cssFiles = findCSSFiles(resolvedPath);
    } else if (path.extname(resolvedPath).toLowerCase() === '.css') {
      cssFiles = [resolvedPath];
    } else {
      console.error(chalk.red('提供的路径不是CSS文件或目录'));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`错误: ${error.message}`));
    console.log(chalk.yellow('提示: 请确保提供的路径存在，并且您有足够的权限访问。'));
    process.exit(1);
  }
  
  if (cssFiles.length === 0) {
    console.log(chalk.yellow('未找到任何CSS文件进行分析。'));
    process.exit(0);
  }
  
  console.log(`找到 ${cssFiles.length} 个CSS文件`);
  
  let totalDuplicates = 0;
  let totalImportant = 0;
  let totalConflicts = 0;
  
  cssFiles.forEach(file => {
    const result = analyzeCSSFile(file);
    if (result) {
      totalDuplicates += result.duplicateSelectors;
      totalImportant += result.importantCount;
      totalConflicts += result.potentialConflicts;
    }
  });
  
  console.log(chalk.green('\n======= 汇总报告 ======='));
  console.log(`分析了 ${cssFiles.length} 个CSS文件`);
  console.log(`发现 ${totalDuplicates} 个重复选择器`);
  console.log(`发现 ${totalImportant} 次!important使用`);
  console.log(`发现 ${totalConflicts} 个潜在样式冲突`);
  
  if (totalImportant > 20) {
    console.log(chalk.red('\n警告: !important 使用过多，建议减少使用以提高可维护性'));
  }
  
  if (totalConflicts > 50) {
    console.log(chalk.red('\n警告: 存在大量潜在样式冲突，建议审查CSS架构'));
  }
  
  console.log(chalk.cyan('\n如需检查特定CSS文件，请使用: npm run check-css -- 路径/到/文件.css'));
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error(chalk ? chalk.red('发生未预期的错误:') : '发生未预期的错误:');
  console.error(error);
  process.exit(1);
});

main();
