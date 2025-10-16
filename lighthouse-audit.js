/**
 * Lighthouse Performance Audit
 * Analisa métricas de performance do site
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

async function runLighthouse() {
    console.log('🚀 Iniciando auditoria Lighthouse...\n');

    const chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless']
    });

    const options = {
        logLevel: 'info',
        output: 'html',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port: chrome.port
    };

    const runnerResult = await lighthouse('http://localhost:3000', options);

    // Salvar relatório HTML
    const reportHtml = runnerResult.report;
    fs.writeFileSync('lighthouse-report.html', reportHtml);
    console.log('✅ Relatório salvo em: lighthouse-report.html\n');

    // Extrair métricas principais
    const { lhr } = runnerResult;
    
    console.log('📊 PERFORMANCE METRICS:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Score geral
    const scores = {
        performance: lhr.categories.performance.score * 100,
        accessibility: lhr.categories.accessibility.score * 100,
        bestPractices: lhr.categories['best-practices'].score * 100,
        seo: lhr.categories.seo.score * 100
    };

    console.log(`\n🎯 SCORES GERAIS:`);
    console.log(`   Performance:     ${scores.performance.toFixed(0)}/100 ${getScoreEmoji(scores.performance)}`);
    console.log(`   Accessibility:   ${scores.accessibility.toFixed(0)}/100 ${getScoreEmoji(scores.accessibility)}`);
    console.log(`   Best Practices:  ${scores.bestPractices.toFixed(0)}/100 ${getScoreEmoji(scores.bestPractices)}`);
    console.log(`   SEO:             ${scores.seo.toFixed(0)}/100 ${getScoreEmoji(scores.seo)}`);

    // Core Web Vitals
    console.log(`\n⚡ CORE WEB VITALS:`);
    const metrics = lhr.audits;
    
    if (metrics['first-contentful-paint']) {
        console.log(`   FCP: ${metrics['first-contentful-paint'].displayValue || 'N/A'}`);
    }
    if (metrics['largest-contentful-paint']) {
        console.log(`   LCP: ${metrics['largest-contentful-paint'].displayValue || 'N/A'}`);
    }
    if (metrics['total-blocking-time']) {
        console.log(`   TBT: ${metrics['total-blocking-time'].displayValue || 'N/A'}`);
    }
    if (metrics['cumulative-layout-shift']) {
        console.log(`   CLS: ${metrics['cumulative-layout-shift'].displayValue || 'N/A'}`);
    }
    if (metrics['speed-index']) {
        console.log(`   SI:  ${metrics['speed-index'].displayValue || 'N/A'}`);
    }

    // Oportunidades de melhoria
    console.log(`\n🔧 PRINCIPAIS OPORTUNIDADES:\n`);
    const opportunities = [
        'render-blocking-resources',
        'unused-css-rules',
        'unused-javascript',
        'modern-image-formats',
        'uses-optimized-images',
        'uses-text-compression',
        'uses-responsive-images',
        'efficient-animated-content',
        'unminified-css',
        'unminified-javascript'
    ];

    let foundOpportunities = 0;
    opportunities.forEach(auditId => {
        const audit = metrics[auditId];
        if (audit && audit.score !== null && audit.score < 1) {
            foundOpportunities++;
            const savings = audit.details?.overallSavingsMs 
                ? ` (economiza ~${(audit.details.overallSavingsMs / 1000).toFixed(2)}s)`
                : '';
            console.log(`   ${foundOpportunities}. ${audit.title}${savings}`);
        }
    });

    if (foundOpportunities === 0) {
        console.log('   ✅ Nenhuma oportunidade crítica encontrada!');
    }

    // Diagnostics
    console.log(`\n📋 DIAGNÓSTICOS:\n`);
    const diagnostics = [
        'mainthread-work-breakdown',
        'bootup-time',
        'uses-long-cache-ttl',
        'total-byte-weight',
        'dom-size'
    ];

    diagnostics.forEach(auditId => {
        const audit = metrics[auditId];
        if (audit && audit.score !== null && audit.score < 1) {
            console.log(`   • ${audit.title}: ${audit.displayValue || 'Precisa atenção'}`);
        }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Auditoria completa! Abra lighthouse-report.html no navegador.\n');

    await chrome.kill();

    // Criar arquivo JSON com resultados
    const results = {
        timestamp: new Date().toISOString(),
        scores,
        metrics: {
            fcp: metrics['first-contentful-paint']?.numericValue,
            lcp: metrics['largest-contentful-paint']?.numericValue,
            tbt: metrics['total-blocking-time']?.numericValue,
            cls: metrics['cumulative-layout-shift']?.numericValue,
            si: metrics['speed-index']?.numericValue
        }
    };

    fs.writeFileSync('lighthouse-results.json', JSON.stringify(results, null, 2));
    console.log('📄 Resultados salvos em: lighthouse-results.json\n');
}

function getScoreEmoji(score) {
    if (score >= 90) return '🟢';
    if (score >= 50) return '🟡';
    return '🔴';
}

runLighthouse().catch(console.error);

