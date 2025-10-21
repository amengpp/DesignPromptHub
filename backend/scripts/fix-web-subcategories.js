const fs = require('fs');
const path = require('path');

/**
 * 修复Web类提示词的子分类
 * @param {string} categoryType - 'web-app' 或 'web-website'
 */
function fixSubcategories(categoryType) {
  console.log(`\n=== 开始修复 ${categoryType} 提示词的子分类 ===`);
  
  // 定义文件路径
  const subcategoriesPath = path.join(__dirname, `../../data/${categoryType}-subcategories.json`);
  const promptsPath = path.join(__dirname, `../../data/${categoryType}-prompts.json`);
  
  // 读取子分类数据
  const subcategories = JSON.parse(fs.readFileSync(subcategoriesPath, 'utf8'));
  
  // 读取提示词数据
  const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
  
  // 建立子分类ID到名称的映射
  const subcategoryMap = {};
  subcategories.forEach(sub => {
    subcategoryMap[sub.id] = sub.name;
  });
  
  // 根据分类类型定义关键词
  const subcategoryKeywords = categoryType === 'web-app' 
    ? {
        'enterprise-management': ['企业管理', 'ERP', 'CRM', '人力资源', '财务管理', '供应链', '客户关系', '企业资源'],
        'data-analytics': ['数据分析', '商业智能', 'BI', '数据可视化', '报表', '统计', '监控', '仪表盘'],
        'office-collaboration': ['办公协作', '项目管理', '团队协作', '文档管理', '工作流', '审批', '任务管理', '日程'],
        'customer-service': ['客户服务', '在线客服', '工单', '客户反馈', '售后', '支持系统', '帮助中心', '知识库'],
        'industry-specific': ['行业专用', '特定行业', '电商系统', '教育系统', '医疗系统', '物流系统', '行业解决方案']
      }
    : {
        'corporate-websites': ['企业官网', '公司网站', '品牌网站', '企业门户', '官方网站', '品牌形象', '公司介绍'],
        'content-portals': ['内容门户', '新闻媒体', '博客平台', '知识百科', '资讯网站', '媒体网站', '文章平台'],
        'e-commerce': ['电商购物', '在线购物', '电商平台', '商城网站', '网购', '电商系统', '购物平台'],
        'social-networks': ['社交网络', '社交平台', '社交网站', '社区网站', '交友网站', '社交互动', '用户社区'],
        'online-education': ['在线教育', '网络课程', '教育平台', '学习网站', '在线学习', '远程教育', '培训平台'],
        'healthcare-medical': ['医疗健康', '在线医疗', '健康管理', '医疗网站', '健康网站', '医生咨询', '健康服务']
      };
  
  // 统计修复情况
  const stats = {
    total: prompts.length,
    fixed: 0,
    byCategory: {}
  };
  
  // 初始化统计
  Object.keys(subcategoryKeywords).forEach(key => {
    stats.byCategory[key] = { count: 0, name: subcategoryMap[key] || '未知' };
  });
  
  // 修复subcategory字段
  prompts.forEach(prompt => {
    const originalSubcategory = prompt.subcategory;
    let bestMatch = originalSubcategory || Object.keys(subcategoryKeywords)[0]; // 如果没有子分类，使用第一个
    let bestScore = 0;
    
    // 组合标题和内容用于匹配
    const textToMatch = (prompt.title + ' ' + (prompt.content || '')).toLowerCase();
    
    // 遍历所有子分类关键词，寻找最佳匹配
    Object.entries(subcategoryKeywords).forEach(([category, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (textToMatch.includes(keyword)) {
          score++;
        }
      });
      
      // 如果标题直接包含关键词，增加权重
      if (prompt.title && prompt.title.includes(category)) {
        score += 2;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = category;
      }
    });
    
    // 如果找到更好的匹配，则更新
    if (bestMatch !== originalSubcategory) {
      prompt.subcategory = bestMatch;
      stats.fixed++;
      console.log(`修复提示词 ${prompt.id}: ${prompt.title}`);
      console.log(`  从 ${originalSubcategory || '无'} (${subcategoryMap[originalSubcategory] || '未知'})`);
      console.log(`  改为 ${bestMatch} (${subcategoryMap[bestMatch]})`);
      console.log('---');
    }
    
    // 更新统计，如果bestMatch不在定义的子分类中，使用第一个子分类
    if (!stats.byCategory[bestMatch]) {
      const firstCategory = Object.keys(subcategoryKeywords)[0];
      console.log(`警告: ${bestMatch} 不是有效的子分类，使用默认子分类 ${firstCategory}`);
      bestMatch = firstCategory;
      prompt.subcategory = bestMatch;
    }
    stats.byCategory[bestMatch].count++;
  });
  
  // 保存修复后的数据
  fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2), 'utf8');
  
  // 输出统计信息
  console.log('\n=== 修复统计 ===');
  console.log(`总共处理: ${stats.total} 个提示词`);
  console.log(`修复数量: ${stats.fixed} 个提示词`);
  console.log('\n各子分类统计:');
  Object.entries(stats.byCategory).forEach(([id, data]) => {
    console.log(`- ${data.name} (${id}): ${data.count} 个`);
  });
  console.log('\n修复完成！');
}

// 修复Web应用提示词
fixSubcategories('web-app');

// 修复Web网站提示词
fixSubcategories('web-website');

console.log('\n=== 所有Web类提示词子分类修复完成 ===');