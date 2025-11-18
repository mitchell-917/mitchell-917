# 🎯 Customization Guide

Make these tools uniquely yours! This guide shows you exactly what to change and where.

---

## 🎨 Quick Color Changes

All tools use a consistent color scheme. Find and replace these values across all files:

| Color | Current | Purpose | Change To |
|-------|---------|---------|-----------|
| Primary | `#667eea` | Main gradient, buttons | Your brand color |
| Secondary | `#764ba2` | Gradient end, accents | Complementary color |
| Accent | `#58a6ff` | Highlights, links | Your accent color |
| Background | `#0d1117` | Dark background | Any dark color |

**Pro Tip:** Use a gradient generator like [uiGradients](https://uigradients.com/) for inspiration!

---

## 📊 Tool-Specific Customization

### 1. 3D Contribution Graph

**File:** `contribution-graph-3d.html`

#### Change Contribution Data
```javascript
// Line ~40
function generateContributionData() {
    // Option 1: Use your real GitHub data
    // Fetch from GitHub API (requires token)
    
    // Option 2: Manual data entry
    const weeks = 52;
    const data = [];
    for (let week = 0; week < weeks; week++) {
        const weekData = []; // 7 days
        for (let day = 0; day < 7; day++) {
            weekData.push(YOUR_COMMIT_COUNT); // 0-15+ commits
        }
        data.push(weekData);
    }
    return data;
}
```

#### Add Custom Color Schemes
```javascript
// Line ~30
const colorSchemes = [
    { name: 'Your Theme', colors: ['#color1', '#color2', '#color3', '#color4'] },
    // Add as many as you want!
];
```

#### Adjust View Angle
```javascript
// Line ~12
let rotationX = 0.6;  // Vertical tilt (0-1)
let rotationY = 0.3;  // Horizontal rotation (0-2π)
```

---

### 2. Live Terminal Dashboard

**File:** `live-coding-stats.html`

#### Update Your Statistics
```javascript
// Around line 450-460
animateCounter(document.getElementById('total-commits'), 0, 1247, 2000);  // Change 1247
animateCounter(document.getElementById('lines-code'), 0, 26482, 2000);     // Change 26482
animateCounter(document.getElementById('active-repos'), 0, 12, 1500);       // Change 12
animateCounter(document.getElementById('prs'), 0, 89, 1800);                // Change 89
animateCounter(document.getElementById('reviews'), 0, 156, 2000);           // Change 156

// Update streak manually
document.getElementById('streak').textContent = '47 days';  // Change this
```

#### Modify Language Distribution
```html
<!-- Around line 360 -->
<div class="language-item">
    <div class="language-color" style="background: #f1e05a;"></div>
    <div class="language-name">Your Language</div>
    <div class="language-bar">
        <div class="language-bar-fill" style="width: 0%; background: #f1e05a;" data-target="32">32%</div>
    </div>
</div>
```

**Language Colors:**
- JavaScript/TypeScript: `#f1e05a`
- Python: `#3572A5`
- Ruby: `#701516`
- Java: `#b07219`
- C++: `#f34b7d`
- Go: `#00ADD8`
- Rust: `#dea584`

#### Change Weekly Activity Pattern
```javascript
// Line ~530
const activities = [65, 82, 95, 88, 72, 45, 38]; // Monday-Sunday percentages
```

#### Update Skills Tags
```html
<!-- Around line 400 -->
<span class="skill-tag">⚛️ Your Skill</span>
<span class="skill-tag">📘 Another Skill</span>
<!-- Add/remove as needed -->
```

---

### 3. Interactive Skill Radar

**File:** `skill-radar.html`

#### Modify Skill Categories & Levels
```javascript
// Line ~25
const skills = {
    labels: [
        'Frontend\nDev',      // \n creates line break
        'Backend\nDev',
        'Your Skill\nHere',
        'Another\nSkill',
        'More\nSkills',
        'Last\nSkill'
    ],
    values: [95, 90, 85, 88, 92, 86]  // 0-100 scale
};
```

#### Update Skill Details in Panel
```html
<!-- Around line 80 -->
<div class="skill-item">
    <span class="skill-name">React/TypeScript</span>
    <div class="skill-level">
        <div class="skill-dots">
            <div class="dot filled"></div>  <!-- Repeat 5 times for 5 dots -->
            <div class="dot filled"></div>
            <div class="dot filled"></div>
            <div class="dot filled"></div>
            <div class="dot filled"></div>
        </div>
        <span class="skill-percentage">95%</span>
    </div>
</div>
```

#### Add Custom Themes
```javascript
// Line ~18
const themes = [
    { primary: '#667eea', secondary: '#764ba2', accent: '#58a6ff' },
    { primary: 'YOUR_COLOR', secondary: 'YOUR_COLOR', accent: 'YOUR_COLOR' },
    // Add more theme objects
];
```

#### Change Metric Cards
```html
<!-- Around line 140 -->
<div class="metric-card">
    <div class="metric-icon">🏆</div>
    <div class="metric-value">177</div>
    <div class="metric-label">Your Metric</div>
</div>
```

---

### 4. Project Carousel

**File:** `project-showcase.html`

#### Add/Edit Projects
```javascript
// Line ~340
const projects = [
    {
        icon: '🎨',                           // Emoji icon
        title: 'Your Project Name',
        description: 'Compelling description of what this project does and why it matters.',
        stats: [
            { value: '100', label: 'Metric 1' },
            { value: '95%', label: 'Metric 2' },
            { value: '0', label: 'Metric 3' }
        ],
        tags: ['Tech1', 'Tech2', 'Tech3', 'Tech4'],
        github: 'https://github.com/YOUR_USERNAME/YOUR_REPO',
        demo: 'https://your-demo-url.com'   // Use '#' if no demo
    },
    // Add more projects (works best with 4-6 projects)
];
```

#### Update Achievement Cards
```html
<!-- Around line 290 -->
<div class="achievement-card">
    <div class="achievement-icon">🎯</div>
    <div class="achievement-value">Your Value</div>
    <div class="achievement-label">Your Label</div>
</div>
```

#### Change Carousel Speed
```javascript
// Line ~590
autoplayInterval = setInterval(nextProject, 5000);  // Change 5000 (5 seconds)
```

#### Adjust 3D Rotation
```javascript
// Line ~520
const rotation = offset * angle;  // Spacing between cards
const scale = offset === 0 ? 1 : 0.7;  // Size of inactive cards
```

---

### 5. Banner Generator

**File:** `banner-generator.html`

#### Change Text Content
```javascript
// Line ~200+
ctx.fillText('👋 Hey, I\'m YOUR_NAME', width / 2, height * 0.35);
ctx.fillText('Your Custom Tagline Here', width / 2, height * 0.48);
```

#### Update Statistics
```javascript
// Line ~220
const stats = [
    { value: 'YOUR_VALUE', label: 'Your Label' },
    { value: 'YOUR_VALUE', label: 'Your Label' },
    { value: 'YOUR_VALUE', label: 'Your Label' },
    { value: 'YOUR_VALUE', label: 'Your Label' }
];
```

#### Modify Particle Count
```javascript
// Line ~100
for (let i = 0; i < 30; i++) {  // Change 30 to your desired number
```

---

## 🎭 Advanced Customization

### Connect to GitHub API

Get real-time stats from GitHub:

```javascript
async function fetchGitHubStats(username) {
    try {
        // User data
        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        const userData = await userResponse.json();
        
        // Repositories
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
        const repos = await reposResponse.json();
        
        // Calculate stats
        const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        const totalForks = repos.reduce((acc, repo) => acc + repo.forks_count, 0);
        
        // Update your visualizations
        document.getElementById('active-repos').textContent = userData.public_repos;
        // ... update other elements
        
        return {
            repos: userData.public_repos,
            stars: totalStars,
            forks: totalForks,
            followers: userData.followers
        };
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
    }
}

// Call it on page load
fetchGitHubStats('YOUR_USERNAME');
```

### Add Custom Animations

```javascript
// Example: Pulse animation
function addPulseAnimation(element) {
    element.style.animation = 'pulse 2s ease-in-out infinite';
}

// Add to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);
```

### Make Elements Draggable

```javascript
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
```

---

## 🎨 Styling Tips

### Glassmorphism Effect

```css
.glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 15px;
}
```

### Gradient Text

```css
.gradient-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

### Smooth Hover Effects

```css
.hover-effect {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-effect:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}
```

---

## 📱 Responsive Design

All tools are responsive, but you can adjust breakpoints:

```css
/* Mobile */
@media (max-width: 768px) {
    .your-element {
        font-size: 1.2em;
        padding: 20px;
    }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
    .your-element {
        font-size: 1.5em;
    }
}

/* Desktop */
@media (min-width: 1025px) {
    .your-element {
        font-size: 2em;
    }
}
```

---

## 🔧 Performance Optimization

### Reduce Particles

For better performance on slower devices:

```javascript
// Reduce particle count
for (let i = 0; i < 15; i++) {  // Was 30
    // particle creation
}
```

### Optimize Animations

```javascript
// Use requestAnimationFrame for smooth animations
let animationId;

function animate() {
    // Your animation code
    animationId = requestAnimationFrame(animate);
}

// Start
animate();

// Stop when not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationId);
    } else {
        animate();
    }
});
```

---

## 💡 Pro Tips

1. **Test locally first** - Use `python -m http.server` before pushing
2. **Use browser dev tools** - F12 to debug and test changes
3. **Keep backups** - Save original files before major changes
4. **Mobile test** - Check on actual mobile devices, not just DevTools
5. **Cross-browser** - Test in Chrome, Firefox, Safari, and Edge
6. **Performance** - Use Chrome Lighthouse to check performance scores
7. **Accessibility** - Test with screen readers and keyboard navigation
8. **Version control** - Commit changes incrementally with clear messages

---

## 🎯 Common Issues & Solutions

### Issue: Links not working
**Solution:** Check URLs match `https://username.github.io/username/filename.html`

### Issue: Colors look washed out
**Solution:** Increase opacity in rgba values (0.1 → 0.3)

### Issue: Animations choppy
**Solution:** Reduce particle count, use requestAnimationFrame

### Issue: Text too small on mobile
**Solution:** Add media queries with larger font sizes

### Issue: GitHub Pages 404
**Solution:** Wait 2-3 minutes after enabling Pages, check file paths

---

<div align="center">

**Need more help?** Open an issue or check the [SETUP.md](SETUP.md) guide!

**Want to share your customization?** Tag me @mitchell-917!

</div>
