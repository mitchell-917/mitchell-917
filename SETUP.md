# 🎨 Setup Guide

Get your GitHub profile up and running with these stunning interactive tools in **under 5 minutes**!

---

## 📋 Prerequisites

- A GitHub account
- A repository named **exactly** `YOUR_USERNAME/YOUR_USERNAME` (your profile repo)

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Enable GitHub Pages

1. Go to your profile repository settings
2. Navigate to **Settings** → **Pages**
3. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**
5. Wait 1-2 minutes for deployment

### Step 2: Add Interactive Tools

Copy these 4 HTML files to your repository:

```
contribution-graph-3d.html
live-coding-stats.html
skill-radar.html
project-showcase.html
```

### Step 3: Update Your Profile README

Replace `YOUR_USERNAME` with your actual GitHub username:

```markdown
### 🎨 Interactive Showcases

<table>
<tr>
<td align="center" width="33%">
  <a href="https://YOUR_USERNAME.github.io/YOUR_USERNAME/contribution-graph-3d.html">
    <img src="https://img.icons8.com/fluency/96/000000/3d-rotate.png" width="64"/>
    <br/>
    <b>3D Contribution Graph</b>
  </a>
  <br/>
  <sub>Rotating 3D visualization with mouse control</sub>
</td>
<td align="center" width="33%">
  <a href="https://YOUR_USERNAME.github.io/YOUR_USERNAME/live-coding-stats.html">
    <img src="https://img.icons8.com/fluency/96/000000/activity-history.png" width="64"/>
    <br/>
    <b>Live Terminal Dashboard</b>
  </a>
  <br/>
  <sub>Real-time coding metrics & activity graphs</sub>
</td>
<td align="center" width="33%">
  <a href="https://YOUR_USERNAME.github.io/YOUR_USERNAME/skill-radar.html">
    <img src="https://img.icons8.com/fluency/96/000000/compass.png" width="64"/>
    <br/>
    <b>Interactive Skill Radar</b>
  </a>
  <br/>
  <sub>Animated skill visualization with themes</sub>
</td>
</tr>
<tr>
<td align="center" colspan="3">
  <br/>
  <a href="https://YOUR_USERNAME.github.io/YOUR_USERNAME/project-showcase.html">
    <img src="https://img.shields.io/badge/🎯-View_Full_Project_Carousel-667eea?style=for-the-badge&logoColor=white" height="40"/>
  </a>
</td>
</tr>
</table>
```

### Step 4: Commit & Push

```bash
git add .
git commit -m "Add interactive profile tools"
git push origin main
```

### Step 5: Test Your Links

Wait 1-2 minutes, then visit:
```
https://YOUR_USERNAME.github.io/YOUR_USERNAME/contribution-graph-3d.html
```

---

## 🎯 Customization (Optional)

### Update Your Stats

#### Live Terminal Dashboard

Open `live-coding-stats.html` and find around line 450:

```javascript
// Update these values
document.getElementById('total-commits').textContent = '1247';
document.getElementById('lines-code').textContent = '26482';
document.getElementById('active-repos').textContent = '12';
```

#### Skill Radar

Open `skill-radar.html` and find around line 25:

```javascript
const skills = {
    labels: ['Frontend\nDev', 'Trading\nSystems', 'Backend\nDev', 'Data Viz', 'Testing &\nQuality', 'DevOps &\nCI/CD'],
    values: [95, 92, 80, 88, 94, 86] // Your skill levels (0-100)
};
```

#### Project Carousel

Open `project-showcase.html` and find around line 340:

```javascript
const projects = [
    {
        icon: '📊',
        title: 'Your Project Name',
        description: 'Your description here...',
        stats: [
            { value: '25+', label: 'Your Metric' },
            { value: '15+', label: 'Another Metric' },
            { value: '26K', label: 'Third Metric' }
        ],
        tags: ['Your', 'Tech', 'Stack'],
        github: 'https://github.com/YOUR_USERNAME/YOUR_REPO',
        demo: 'https://your-demo-url.com'
    },
    // Add more projects...
];
```

---

## 🔧 Troubleshooting

### Links Don't Work

**Problem:** Getting 404 errors  
**Solution:** 
1. Make sure GitHub Pages is enabled
2. Wait 2-3 minutes after enabling
3. Check that files are in the root directory
4. Verify URLs match: `https://USERNAME.github.io/USERNAME/filename.html`

### Stats Not Showing

**Problem:** Values showing as 0 or default  
**Solution:** 
1. Open the HTML file
2. Find the statistics section
3. Update the values manually
4. Save and push changes

### Animations Not Working

**Problem:** Tools look static  
**Solution:**
1. Check browser console for errors (F12)
2. Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
3. Clear browser cache
4. Try opening in incognito/private mode

### Mobile Display Issues

**Problem:** Tools don't look good on mobile  
**Solution:** All tools are responsive, but if you have issues:
1. Check viewport meta tag is present
2. Test in different mobile browsers
3. Zoom settings might affect display

---

## 💡 Pro Tips

### 1. Use Your Own Colors

Change the gradient colors throughout the files:

```javascript
// Find and replace these hex colors:
#667eea → Your primary color
#764ba2 → Your secondary color
#58a6ff → Your accent color
```

### 2. Add Google Analytics

Track visitors to your interactive tools:

```html
<!-- Add before </head> tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR_GA_ID');
</script>
```

### 3. Connect to GitHub API

For real-time GitHub stats:

```javascript
async function fetchGitHubStats(username) {
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();
    // Update your visualizations with real data
}
```

### 4. Add More Projects

To the carousel, just add more objects to the `projects` array. The carousel automatically adjusts!

### 5. Test Locally

Before pushing:

```bash
# Simple HTTP server
python -m http.server 8000
# or
npx serve
```

Then visit `http://localhost:8000`

---

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Markdown Guide](https://www.markdownguide.org/)
- [Icons8 Free Icons](https://icons8.com/)
- [GitHub Profile README Generator](https://rahuldkjain.github.io/gh-profile-readme-generator/)

---

## 🎉 You're Done!

Your GitHub profile now has world-class interactive tools! 

**Next Steps:**
1. Share your profile on Twitter/LinkedIn
2. Customize the tools to match your style
3. Add your real project data
4. Watch the stars roll in! ⭐

---

<div align="center">

**Questions? Open an issue!**

**Found this helpful? Give it a ⭐**

</div>
